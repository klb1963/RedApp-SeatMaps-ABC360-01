// file: SeatMapComponentPnr.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../utils/generateFlightData';

interface SeatMapComponentPnrProps {
  config: any;
  flight: any;
  availability?: any[];
  passengers?: any[];
  showSegmentSelector?: boolean;
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flight,
  availability = [],
  passengers = [],
  showSegmentSelector = true 
}) => {
  const flightSegments = [
    {
      ...flight,
      cabinClass: flight.cabinClass || 'Y' // подстраховка
    }
  ];

  return (
    <SeatMapComponentBase
      config={config}
      flightSegments={flightSegments}
      initialSegmentIndex={0}
      showSegmentSelector={showSegmentSelector}
      generateFlightData={generateFlightData}
      availability={availability}
      passengers={passengers}
    />
  );
};

export default SeatMapComponentPnr;