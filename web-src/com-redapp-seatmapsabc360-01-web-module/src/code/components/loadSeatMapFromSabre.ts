// файл: code/components/loadSeatMapFromSabre.ts

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';

interface Passenger {
    travellerId: number;
    givenName: string;
    surname: string;
}

interface FlightSegment {
    origin: string;
    destination: string;
    departureDate: string;
    marketingCarrier: string;
    marketingFlightNumber: string;
    flightNumber: string;
    bookingClass: string;
    cabin?: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
}

export const loadSeatMapFromSabre = async (
    flightSegment: FlightSegment,
    passengers: Passenger[],
    onSuccess: (parsed: any, rawXml: string) => void,
    onError?: (error: any) => void
): Promise<void> => {
    try {
        const soapApiService = getService(ISoapApiService);

        const passengerBlocks = passengers.map(passenger => `
            <ns4:FareAvailQualifiers passengerType="ADT">
                <ns4:TravellerID>${passenger.travellerId}</ns4:TravellerID>
                <ns4:GivenName>${passenger.givenName}</ns4:GivenName>
                <ns4:Surname>${passenger.surname}</ns4:Surname>
                <ns4:SSR>TKNE</ns4:SSR>
            </ns4:FareAvailQualifiers>
        `).join('');

        // 🧠 Маппинг Cabin → буквенное значение
        const cabinMapping: Record<string, string> = {
            Economy: 'Y',
            PremiumEconomy: 'S',
            Business: 'C',
            First: 'F'
        };

        const mappedCabin = cabinMapping[flightSegment.cabin || ''] || 'Y'; // по умолчанию 'Y'

        const cabinDefinitionBlock = flightSegment.cabin ? `
            <ns4:CabinDefinition>
                <ns4:Cabin>${mappedCabin}</ns4:Cabin>
            </ns4:CabinDefinition>
        ` : `
            <ns4:CabinDefinition>
                <ns4:RBD>${flightSegment.bookingClass}</ns4:RBD>
            </ns4:CabinDefinition>
        `;

        const soapPayload = `
            <ns4:EnhancedSeatMapRQ xmlns:ns4="http://stl.sabre.com/Merchandising/v8">
                <ns4:SeatMapQueryEnhanced>
                    <ns4:RequestType>Payload</ns4:RequestType>

                    <ns4:POS company="DI9L" multiHost="DI9L">
                        <ns4:Actual city="MUC"/>
                        <ns4:PCC>DI9L</ns4:PCC>
                    </ns4:POS>

                    <ns4:Flight id="f1" destination="${flightSegment.destination}" origin="${flightSegment.origin}">
                        <ns4:DepartureDate>${flightSegment.departureDate}</ns4:DepartureDate>
                        <ns4:Marketing carrier="${flightSegment.marketingCarrier}">${flightSegment.marketingFlightNumber}</ns4:Marketing>
                    </ns4:Flight>

                    ${cabinDefinitionBlock}

                    <ns4:Currency>USD</ns4:Currency>

                    ${passengerBlocks}
                </ns4:SeatMapQueryEnhanced>
                <ns4:CalculateDiscount>true</ns4:CalculateDiscount>
            </ns4:EnhancedSeatMapRQ>
        `;

        console.log('📤 Sending EnhancedSeatMapRQ payload:', soapPayload);

        const response = await soapApiService.callSws({
            action: 'EnhancedSeatMapRQ',
            payload: soapPayload,
            authTokenType: 'SESSION'
        });

        const parsed = response.getParsedValue();
        const rawXml = (response as any).response; // 🧾 здесь получаем строку XML!

        console.log('✅ EnhancedSeatMapRQ Parsed:', parsed);
        console.log('📄 Raw XML:', rawXml);

        onSuccess(parsed, rawXml);

    } catch (error) {
        console.error('❌ Error calling EnhancedSeatMapRQ:', error);
        if (onError) {
            onError(error);
        }
    }
};