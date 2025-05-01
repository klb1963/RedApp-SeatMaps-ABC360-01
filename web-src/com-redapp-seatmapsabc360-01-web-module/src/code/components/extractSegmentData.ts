// file: extractSegmentData.ts

import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';

export function extractSegmentData(segment: FlightSegment): Record<string, any> {
    return {
        flightNumber: segment.getSegmentId(),
        marketingCarrier: segment.getMarketingOperatingAirline(),
        departureDate: segment.getRawDepartureDate(),
        rbd: segment.getSelectedBookingClass() || 'N/A',
        origin: segment.getOriginIata(),
        destination: segment.getDestinationIata(),
        equipmentCode: segment.getEquipmentCode(),
        equipmentCodes: segment.getEquipmentCodes().map(codeInfo => String(codeInfo)),
        segmentRph: segment.getRph()
    };
}