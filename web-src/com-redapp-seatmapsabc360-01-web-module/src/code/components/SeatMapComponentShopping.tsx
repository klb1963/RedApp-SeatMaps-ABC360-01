// SeatMapComponentShopping.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any; // данные из сценария Shopping
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = data.flightSegments || [];

  const layout = {
    decks: [
      {
        id: 'main-deck',
        name: 'Deck 1',
        width: 600,
        height: 400,
        rows: [
          { label: '1', seats: [{ label: 'A', x: 50, y: 50 }, { label: 'B', x: 100, y: 50 }] },
          { label: '2', seats: [{ label: 'A', x: 50, y: 100 }] }
        ]
      }
    ]
  };

  return (
    <SeatMapComponentBase
      config={config}
      flightSegments={flightSegments}
      showCabinClassSelector={false}
      generateFlightData={(segment) => {
        return {
          id: '001',
          airlineCode: segment.marketingAirline || 'XX',
          flightNo: segment.flightNumber || '000',
          departureDate: segment.departureDateTime?.split('T')[0] || '',
          departure: segment.origin || '???',
          arrival: segment.destination || '???',
          cabinClass: segment.cabinClass || '',
          equipment: segment.equipment || ''
        };
      }}
      layoutData={layout}
    />
  );
};

export default SeatMapComponentShopping;