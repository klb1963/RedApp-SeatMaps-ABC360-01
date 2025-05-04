// file: SeatMapComponentShopping.tsx

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = data.flightSegments || [];

  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y'); // Sabre: Economy
  const [segmentIndex, setSegmentIndex] = useState(0);

  const currentSegment = flightSegments?.[segmentIndex];
  const equipment =
    typeof currentSegment?.equipment === 'object'
      ? currentSegment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : currentSegment?.equipment || 'неизвестно';

  return (
    <div style={{ padding: '1rem' }}>
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Сегмент:</label>
          <select
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
          >
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, рейс {seg.flightNumber}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Самолёт:</strong> {equipment || 'неизвестно'}
        </div>
      </div>

      {/* 👔 Класс обслуживания */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Класс обслуживания:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
        >
          <option value="Y">Economy</option>
          <option value="S">Premium Economy</option>
          <option value="C">Business</option>
          <option value="F">First</option>
          <option value="A">All Cabins</option>
        </select>
      </div>

      {/* 🧩 Отображение карты */}
      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            { ...segment, cabinClass: cabin, equipment: segment.equipment },
            index
          )
        }
        showSegmentSelector={false}
      />
    </div>
  );
};

export default SeatMapComponentShopping;
