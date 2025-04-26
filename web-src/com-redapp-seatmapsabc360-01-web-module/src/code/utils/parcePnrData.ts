// файл: code/utils/parsePnrData.ts

import { Option } from 'sabre-ngv-UIComponents/advancedDropdown/interfaces/Option';

export interface PassengerOption extends Option<string> {
    givenName: string;
    surname: string;
}

export interface SegmentOption extends Option<string> {
    origin: string;
    destination: string;
    departureDate: string;
    marketingCarrier: string;
    marketingFlightNumber: string;
    bookingClass: string;
    equipment: string;
}

export interface PnrData {
    passengers: PassengerOption[];
    segments: SegmentOption[];
}

export const parsePnrData = (xmlDoc: XMLDocument): PnrData => {
    const passengers: PassengerOption[] = [];
    const segments: SegmentOption[] = [];

    // --- Пассажиры ---
    const passengerNodes = xmlDoc.getElementsByTagName('stl19:Passenger');
    for (let i = 0; i < passengerNodes.length; i++) {
        const passenger = passengerNodes[i];
        const id = passenger.getAttribute('id') || '';
        const surname = passenger.getElementsByTagName('stl19:LastName')[0]?.textContent?.trim() || '';
        const givenName = passenger.getElementsByTagName('stl19:FirstName')[0]?.textContent?.trim() || '';

        passengers.push({
            label: `${surname}/${givenName}`,
            value: id,
            givenName,
            surname
        });
    }

    // --- Сегменты ---
    const airSegmentNodes = xmlDoc.getElementsByTagName('stl19:Air');
    for (let i = 0; i < airSegmentNodes.length; i++) {
        const segment = airSegmentNodes[i];

        const id = segment.getAttribute('id') || '';
        const origin = segment.getElementsByTagName('stl19:DepartureAirport')[0]?.textContent?.trim() || '';
        const destination = segment.getElementsByTagName('stl19:ArrivalAirport')[0]?.textContent?.trim() || '';
        const departureDateTime = segment.getElementsByTagName('stl19:DepartureDateTime')[0]?.textContent?.trim() || '';
        const marketingFlightNumber = segment.getElementsByTagName('stl19:MarketingFlightNumber')[0]?.textContent?.trim() || '';

        const marketingCarrier = segment.getElementsByTagName('stl19:MarketingAirlineCode')[0]?.textContent?.trim() || 'UNKNOWN'; // Carrier
        const bookingClass = segment.getElementsByTagName('stl19:OperatingClassOfService')[0]?.textContent?.trim() || ''; // Class
        const equipment = segment.getElementsByTagName('stl19:EquipmentType')[0]?.textContent?.trim() || ''; // Equipment

        // Корректно извлекаем только дату
        let departureDate = '';
        if (departureDateTime.includes('T')) {
            departureDate = departureDateTime.split('T')[0];
        }

        segments.push({
            label: `${marketingCarrier}${marketingFlightNumber} — ${origin} → ${destination}`,
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

    return { passengers, segments };
};