// файл: code/utils/parsePnrData.ts

import { Option } from 'sabre-ngv-UIComponents/advancedDropdown/interfaces/Option';

// ==== Типы данных, которые мы парсим ====

/**
 * Описание пассажира (для выпадающего списка выбора пассажиров)
 */
export interface PassengerOption extends Option<string> {
    givenName: string;
    surname: string;
    seatAssignment?: string; // номер места (если есть)
}

/**
 * Описание авиасегмента (для выпадающего списка выбора сегмента)
 */
export interface SegmentOption extends Option<string> {
    origin: string;
    destination: string;
    departureDate: string;
    marketingCarrier: string;
    marketingFlightNumber: string;
    bookingClass: string;
    equipment: string;
}

/**
 * Структура возвращаемых данных после парсинга PNR
 */
export interface PnrData {
    passengers: PassengerOption[];
    segments: SegmentOption[];
}

// ==== Основная функция парсинга XML-ответа ====

/**
 * Парсит XML-документ с данными бронирования (PNR).
 * Извлекает пассажиров и авиасегменты для дальнейшего отображения.
 * 
 * @param xmlDoc - XMLDocument, полученный из ответа Sabre
 * @returns Структурированные данные по пассажирам и сегментам
 */
export const parsePnrData = (xmlDoc: XMLDocument): PnrData => {
    const passengers: PassengerOption[] = [];
    const segments: SegmentOption[] = [];

    // --- Парсинг пассажиров ---
    const passengerNodes = xmlDoc.getElementsByTagName('stl19:Passenger');
    for (let i = 0; i < passengerNodes.length; i++) {
        const passenger = passengerNodes[i];
        const id = passenger.getAttribute('id') || '';
        const surname = passenger.getElementsByTagName('stl19:LastName')[0]?.textContent?.trim() || '';
        const givenName = passenger.getElementsByTagName('stl19:FirstName')[0]?.textContent?.trim() || '';
    
        let seatAssignment: string | undefined = undefined;
        const seatsNode = passenger.getElementsByTagName('stl19:Seats')[0];
        if (seatsNode) {
            const seatNode = seatsNode.getElementsByTagName('stl19:Seat')[0];
            seatAssignment = seatNode?.getAttribute('Assignment')?.trim();
        }
    
        passengers.push({
            label: `${surname}/${givenName}`,
            value: id,
            givenName,
            surname,
            seatAssignment
        });
    }

    // --- Парсинг авиасегментов ---
    const airSegmentNodes = xmlDoc.getElementsByTagName('stl19:Air');
    for (let i = 0; i < airSegmentNodes.length; i++) {
        const segment = airSegmentNodes[i];

        const id = segment.getAttribute('id') || '';
        const origin = segment.getElementsByTagName('stl19:DepartureAirport')[0]?.textContent?.trim() || '';
        const destination = segment.getElementsByTagName('stl19:ArrivalAirport')[0]?.textContent?.trim() || '';
        const departureDateTime = segment.getElementsByTagName('stl19:DepartureDateTime')[0]?.textContent?.trim() || '';
        const marketingFlightNumber = segment.getElementsByTagName('stl19:MarketingFlightNumber')[0]?.textContent?.trim() || '';
        const marketingCarrier = segment.getElementsByTagName('stl19:MarketingAirlineCode')[0]?.textContent?.trim() || 'UNKNOWN'; // Код авиакомпании
        const bookingClass = segment.getElementsByTagName('stl19:OperatingClassOfService')[0]?.textContent?.trim() || ''; // Класс бронирования (например, Y, C)
        const equipment = segment.getElementsByTagName('stl19:EquipmentType')[0]?.textContent?.trim() || ''; // Тип самолета (например, 388)

        // Отделяем дату от полной даты-времени
        let departureDate = '';
        if (departureDateTime.includes('T')) {
            departureDate = departureDateTime.split('T')[0]; // Берем только часть до "T"
        }

        segments.push({
            label: `${marketingCarrier}${marketingFlightNumber} — ${origin} → ${destination}`, // Пример: "LH410 — MUC → JFK"
            value: id,
            origin,
            destination,
            departureDate,
            marketingCarrier,
            marketingFlightNumber,
            bookingClass,
            equipment
        });
    }

    // --- Возвращаем собранные пассажиров и сегменты ---
    return { passengers, segments };
};