// файл: code/components/loadSeatMapFromSabre.ts

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PassengerOption } from '../utils/parcePnrData';
import { parseSeatMapResponse } from '../utils/parseSeatMapResponse';

interface FlightSegment {
  bookingClass: string;
  marketingCarrier: string;
  marketingFlightNumber: string;
  flightNumber: string;
  departureDate: string;
  origin: string;
  destination: string;
}

export const loadSeatMapFromSabre = async (
  segment: FlightSegment,
  passengers: PassengerOption[]
): Promise<{ rawXml: string; availability: any }> => {
  try {
    const soapApiService = getService(ISoapApiService);

    const passengerXml = passengers
    .map(
      (p, index) => `
        <Passenger id="${p.value}">
          <Name>
            <Given>${p.givenName.split(' ')[0]}</Given>
            <Surname>${p.surname}</Surname>
          </Name>
          <PTC>ADT</PTC>
        </Passenger>
      `
    )
    .join('');

    const soapPayload = `
    <ns4:EnhancedSeatMapRQ xmlns:ns4="http://stl.sabre.com/Merchandising/v8">
      <ns4:SeatMapQueryEnhanced>
        <ns4:RequestType>Payload</ns4:RequestType>
        <ns4:Flight origin="${segment.origin}" destination="${segment.destination}">
          <ns4:DepartureDate>${segment.departureDate}</ns4:DepartureDate>
          <ns4:Marketing carrier="${segment.marketingCarrier}">${parseInt(segment.marketingFlightNumber, 10)}</ns4:Marketing>
        </ns4:Flight>
        <ns4:CabinDefinition>
          <ns4:RBD>${segment.bookingClass}</ns4:RBD>
        </ns4:CabinDefinition>
        ${passengers
          .map(
            (p, index) => `
          <ns4:FareAvailQualifiers fareBasisCode="TESTFARE" passengerType="ADT">
            <ns4:TravellerID>${index + 1}</ns4:TravellerID>
            <ns4:GivenName>${p.givenName.split(' ')[0]}</ns4:GivenName>
            <ns4:Surname>${p.surname}</ns4:Surname>
          </ns4:FareAvailQualifiers>
        `
          )
          .join('')}
        <ns4:POS multiHost="${segment.marketingCarrier}" company="${segment.marketingCarrier}">
          <ns4:Actual city="${segment.origin}"/>
          <ns4:PCC>DI9L</ns4:PCC>
          <ns4:ClientContext clientType="SSW_RES"/>
        </ns4:POS>
      </ns4:SeatMapQueryEnhanced>
    </ns4:EnhancedSeatMapRQ>
    `;

    console.log('🚀 Sending EnhancedSeatMapRQ:\n', soapPayload);

    const response = await soapApiService.callSws({
      action: 'EnhancedSeatMapRQ',
      payload: soapPayload,
      authTokenType: 'SESSION'
    });

    const rawXml = response.value;
    const xmlDoc = new DOMParser().parseFromString(rawXml, 'application/xml');
    const { availability } = parseSeatMapResponse(xmlDoc);

    return { rawXml, availability };
  } catch (error) {
    console.error('❌ Error in loadSeatMapFromSabre:', error);
    return Promise.reject(error);
  }
};