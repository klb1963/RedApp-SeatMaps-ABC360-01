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
        (p) => `<Passenger id="${p.value}"><Name><Given>${p.givenName}</Given><Surname>${p.surname}</Surname></Name></Passenger>`
      )
      .join('');

    const soapPayload = `
      <EnhancedSeatMapRQ Version="4.0.0" xmlns="http://stl.sabre.com/Merchandising/v4">
        <SeatMapQueryEnhanced>
          <RequestType>Payload</RequestType>
          <FlightSegment>
            <BookingClass>${segment.bookingClass}</BookingClass>
            <MarketingCarrier>${segment.marketingCarrier}</MarketingCarrier>
            <MarketingFlightNumber>${segment.marketingFlightNumber}</MarketingFlightNumber>
            <DepartureDate>${segment.departureDate}</DepartureDate>
            <OriginLocation>${segment.origin}</OriginLocation>
            <DestinationLocation>${segment.destination}</DestinationLocation>
          </FlightSegment>
          <Passengers>${passengerXml}</Passengers>
        </SeatMapQueryEnhanced>
      </EnhancedSeatMapRQ>
    `;

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