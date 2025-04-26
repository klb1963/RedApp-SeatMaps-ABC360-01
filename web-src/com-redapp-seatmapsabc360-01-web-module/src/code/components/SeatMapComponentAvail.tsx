// file: SeatMapComponentAvail.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './getFlightFromSabreData';

interface SeatMapComponentAvailProps {
  config: any;
  data: any;
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
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
      showCabinClassSelector={true}
      defaultCabinClass="A"
      generateFlightData={(_, index, cabinClass) => {
        const flight = getFlightFromSabreData(data, index);
        return { ...flight, cabinClass }; // добавляем выбранный класс
      }}
      layoutData={layout}
      availability={[]} // availability подставится внутри getFlightFromSabreData, либо можно мок включить вручную
      passengers={[]}
    />
  );
};

export default SeatMapComponentAvail;