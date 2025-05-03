// SeatMapComponentShopping.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any; // данные из сценария Shopping
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = data.flightSegments || [];

  return (
    <SeatMapComponentBase
      config={config}
      flightSegments={flightSegments}
      cabinClass="Y" // 👈 по умолчанию — Economy (Sabre)
      generateFlightData={(segment, index, cabin) =>
        generateFlightData(segment, index)
      }
    />
  );
};

export default SeatMapComponentShopping;