// файл: code/components/loadSeatMapFromSabre.ts

// файл: code/components/loadSeatMapFromSabre.ts

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';

// Пассажир — используется для заполнения блока <FareAvailQualifiers>
interface Passenger {
    travellerId: number;
    givenName: string;
    surname: string;
}

// Сегмент рейса — данные о перелёте, нужны для запроса карты мест
interface FlightSegment {
    origin: string;
    destination: string;
    departureDate: string;
    marketingCarrier: string;
    marketingFlightNumber: string;
    flightNumber: string;
    bookingClass: string;
    cabin?: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
    cabinCode?: 'Y' | 'W' | 'C' | 'F' | 'A'; // 🆕 добавили: используется вместо bookingClass, если доступно
}

// Основная функция для отправки запроса EnhancedSeatMapRQ
export const loadSeatMapFromSabre = async (
    flightSegment: FlightSegment,
    passengers: Passenger[],
    onSuccess: (parsed: any, rawXml: string) => void,
    onError?: (error: any) => void
): Promise<void> => {
    try {
        const soapApiService = getService(ISoapApiService);

        // Формируем блоки пассажиров (если есть) для запроса
        const passengerBlocks = passengers.map(passenger => `
            <ns4:FareAvailQualifiers passengerType="ADT">
                <ns4:TravellerID>${passenger.travellerId}</ns4:TravellerID>
                <ns4:GivenName>${passenger.givenName}</ns4:GivenName>
                <ns4:Surname>${passenger.surname}</ns4:Surname>
                <ns4:SSR>TKNE</ns4:SSR> <!-- Спецсервисное сообщение о наличии билета -->
            </ns4:FareAvailQualifiers>
        `).join('');

        // Формируем блок CabinDefinition:
        // - если есть cabinCode → передаем код салона (Y, W, C, F, A)
        // - иначе → передаем RBD (буквенный код бронирования)
        const cabinDefinitionBlock = flightSegment.cabinCode ? `
            <ns4:CabinDefinition>
                <ns4:CabinCode>${flightSegment.cabinCode}</ns4:CabinCode>
            </ns4:CabinDefinition>
        ` : `
            <ns4:CabinDefinition>
                <ns4:RBD>${flightSegment.bookingClass}</ns4:RBD>
            </ns4:CabinDefinition>
        `;

        // Полный XML-пакет запроса EnhancedSeatMapRQ
        const soapPayload = `
            <ns4:EnhancedSeatMapRQ xmlns:ns4="http://stl.sabre.com/Merchandising/v8">
                <ns4:SeatMapQueryEnhanced>
                    <ns4:RequestType>Payload</ns4:RequestType>

                    <!-- Информация о точке продажи -->
                    <ns4:POS company="DI9L" multiHost="DI9L">
                        <ns4:Actual city="MUC"/> <!-- Город продажи -->
                        <ns4:PCC>DI9L</ns4:PCC>   <!-- PCC (Pseudo City Code) -->
                    </ns4:POS>

                    <!-- Информация о сегменте рейса -->
                    <ns4:Flight id="f1" destination="${flightSegment.destination}" origin="${flightSegment.origin}">
                        <ns4:DepartureDate>${flightSegment.departureDate}</ns4:DepartureDate>
                        <ns4:Marketing carrier="${flightSegment.marketingCarrier}">${flightSegment.marketingFlightNumber}</ns4:Marketing>
                    </ns4:Flight>

                    <!-- Блок про класс бронирования или код салона -->
                    ${cabinDefinitionBlock}

                    <!-- Валюта для расчета стоимости мест -->
                    <ns4:Currency>USD</ns4:Currency>

                    <!-- Пассажиры (если есть) -->
                    ${passengerBlocks}
                </ns4:SeatMapQueryEnhanced>

                <!-- Запрашиваем расчет скидок, если применимо -->
                <ns4:CalculateDiscount>true</ns4:CalculateDiscount>
            </ns4:EnhancedSeatMapRQ>
        `;

        console.log('📤 Sending EnhancedSeatMapRQ payload:', soapPayload);

        // Отправляем SOAP-запрос через Sabre Web Services
        const response = await soapApiService.callSws({
            action: 'EnhancedSeatMapRQ',
            payload: soapPayload,
            authTokenType: 'SESSION' // Используем текущую сессию агента
        });

        // Парсим ответ
        const parsed = response.getParsedValue();
        const rawXml = response.value;

        console.log('✅ EnhancedSeatMapRQ Parsed:', parsed);
        console.log('📄 Raw XML:', rawXml);

        // Вызываем success-колбэк
        onSuccess(parsed, rawXml);

    } catch (error) {
        console.error('❌ Error calling EnhancedSeatMapRQ:', error);
        if (onError) {
            onError(error);
        }
    }
};