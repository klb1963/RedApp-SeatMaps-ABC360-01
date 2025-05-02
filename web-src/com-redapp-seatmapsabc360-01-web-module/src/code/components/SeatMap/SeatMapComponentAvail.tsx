// file: SeatMapComponentAvail.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import SeatMapComponentBaseTest from './SeatMapComponentBaseTest';
import { getFlightFromSabreData } from './getFlightFromSabreData';


interface SeatMapComponentAvailProps {
  config: any;
  data: any;
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  const [cabinClass, setCabinClass] = React.useState<'F' | 'C' | 'S' | 'Y' | 'A'>('Y');

  return (
    <div style={{ padding: '1rem' }}>
      <label style={{ marginRight: '8px' }}>Выберите класс обслуживания:</label>
      <select
        value={cabinClass}
        onChange={(e) => setCabinClass(e.target.value as any)}
      >
        <option value="Y">Economy (Y)</option>
        <option value="S">Premium Economy (S)</option>
        <option value="C">Business (C)</option>
        <option value="F">First (F)</option>
        <option value="A">All cabins (A)</option>
      </select>

      <SeatMapComponentBaseTest />
    </div>
  );
};

export default SeatMapComponentAvail;
