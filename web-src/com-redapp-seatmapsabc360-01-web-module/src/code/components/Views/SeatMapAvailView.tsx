// file: SeatMapAvailView.ts

import * as React from 'react';
import { PublicAirAvailabilityData } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityData';

export const SeatMapAvailView: React.FC<PublicAirAvailabilityData> = (props) => {

  // console.log('SeatMapAvailView props:', props);

  return (
    <div className="sdk-seatmap-custom-tile-content">
      <p>SeatMap Viewer загружен</p>
    </div>
  );
};