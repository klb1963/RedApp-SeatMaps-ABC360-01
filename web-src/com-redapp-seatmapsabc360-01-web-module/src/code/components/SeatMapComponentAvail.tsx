// file: SeatMapComponentAvail.tsx

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

  // 🔧 Исправлено: удалили 'W', потому что она не поддерживается
  const [cabinClass, setCabinClass] = React.useState<'F' | 'C' | 'S' | 'Y' | 'A'>('Y');

  console.log('📦 [SeatMapComponentAvail] Данные получены:', data);
  console.log('🧩 [SeatMapComponentAvail] Выбранный класс:', cabinClass);

  return (
    <div style={{ padding: '1rem' }}>
      <label style={{ marginRight: '8px' }}>Выберите класс обслуживания:</label>
      <select
        value={cabinClass}
        onChange={(e) => setCabinClass(e.target.value as 'F' | 'C' | 'S' | 'Y' | 'A')}
      >
        <option value="Y">Economy (Y)</option>
        <option value="S">Premium Economy (S)</option>
        <option value="C">Business (C)</option>
        <option value="F">First (F)</option>
        <option value="A">All cabins (A)</option>
      </select>

      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        showCabinClassSelector={false}
        defaultCabinClass={cabinClass}
        generateFlightData={(segment, index) =>
          getFlightFromSabreData({ flightSegments: [segment] }, 0, cabinClass)
        }
        availability={[]}
        passengers={[]}
      />
    </div>
  );
};

export default SeatMapComponentAvail;