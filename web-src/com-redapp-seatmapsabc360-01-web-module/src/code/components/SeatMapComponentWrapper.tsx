// file: SeatMapComponentWrapper.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';

interface Props {
    flightSegments: any[];
    config: any;
    availability: any[];
    passengers: any[];
    generateFlightData: (segment: any, index: number, cabinClass?: string) => any;
    initialSegmentIndex: number;
    showCabinClassSelector: boolean;
    showSegmentSelector: boolean;
    assignedSeats?: { passengerId: string; seat: string }[];
    layoutData?: any; // 👈 Добавлено как необязательный
}

export const SeatMapComponentWrapper = (props: Props): JSX.Element => {
    return <SeatMapComponentBase {...props} />;
};