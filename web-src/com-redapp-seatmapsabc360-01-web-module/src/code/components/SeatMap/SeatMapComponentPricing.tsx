// SeatMapComponentPricing.tsx

import * as React from 'react';
import { useState } from 'react';
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
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const segment = flightSegments[selectedSegmentIndex];
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔝 Сегмент и Самолёт на одной строке */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Сегмент:</label>
          <span>
            {segment?.origin} → {segment?.destination}, рейс {segment?.flightNumber}
          </span>
        </div>
        <div style={{ fontSize: '1.2rem', color: '#555' }}>
          ✈️ <strong>Самолёт:</strong> {equipment}
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

      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={selectedSegmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            { ...segment, cabinClass: cabin, equipment: segment.equipment },
            index
          )
        }
        passengers={[]} // можно передать, если есть
        showSegmentSelector={false}
      />
    </div>
  );
};

export default SeatMapComponentPricing;