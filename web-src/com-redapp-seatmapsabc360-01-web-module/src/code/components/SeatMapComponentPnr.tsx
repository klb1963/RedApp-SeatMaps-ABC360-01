// file: SeatMapComponentPnr.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';

interface SeatMapComponentPnrProps {
  config: any;
  flight: any;
  layout: any;
  availability?: any[];
  passengers?: any[];
  showSegmentSelector?: boolean;
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flight,
  layout,
  availability = [],
  passengers = [],
  showSegmentSelector = true 
}) => {
  const flightSegments = [flight];

  return (
    <SeatMapComponentBase
      config={config}
      flightSegments={flightSegments}
      initialSegmentIndex={0}
      showCabinClassSelector={false}
      showSegmentSelector={showSegmentSelector}
      defaultCabinClass={flight.cabinClass || 'Y'}
      generateFlightData={(segment) => ({
        ...segment,
        cabinClass: segment.cabinClass || 'Y' // чтобы точно был cabinClass
      })}
      layoutData={layout}
      availability={availability}
      passengers={passengers}
    />
  );
};

export default SeatMapComponentPnr;