// SeatMapComponentPricing.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';

interface SeatMapComponentPricingProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex: number;
}

const SeatMapComponentPricing: React.FC<SeatMapComponentPricingProps> = ({
  config,
  flightSegments,
  selectedSegmentIndex
}) => {
  return (
    <SeatMapComponentBase
      config={config}
      flightSegments={flightSegments}
      initialSegmentIndex={selectedSegmentIndex}
      showCabinClassSelector={false}
      generateFlightData={generateFlightData}
      passengers={[]}
    />
  );
};

export default SeatMapComponentPricing;