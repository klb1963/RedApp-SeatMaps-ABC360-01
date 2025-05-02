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
      showCabinClassSelector={false}
      generateFlightData={generateFlightData}
    />
  );
};

export default SeatMapComponentShopping;