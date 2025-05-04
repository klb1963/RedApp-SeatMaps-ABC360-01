// file: SeatMapComponentPnr.tsx

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';

interface Passenger {
  id: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  label?: string;
}

interface SeatMapComponentPnrProps {
  config: any;
  flight?: any;
  availability?: any[];
  passengers?: Passenger[];
  showSegmentSelector?: boolean;
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flight,
  availability = [],
  passengers = [],
  showSegmentSelector = true
}) => {
  if (!flight || typeof flight !== 'object') {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        ❌ Ошибка: отсутствует информация о сегменте рейса.
      </div>
    );
  }

  const cabinClass = flight.cabinClass || 'Y';

  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>(
    Array.isArray(passengers) ? passengers.map(p => p.id) : []
  );

  const handleTogglePassenger = (id: string) => {
    setSelectedPassengerIds(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const selectedPassengers = (Array.isArray(passengers)
    ? passengers.filter(p => selectedPassengerIds.includes(p.id))
    : []) as Passenger[];

  const flightSegments = [
    {
      ...flight,
      cabinClass
    }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      {/* 👤 Селектор пассажиров */}
      {passengers.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Пассажиры:</strong>
          <div>
            {passengers.map(p => {
              const labelParts = p.label?.split(' ') || [];
              const title = labelParts.length > 1 ? labelParts[1] : '';
              return (
                <label key={p.id} style={{ marginRight: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedPassengerIds.includes(p.id)}
                    onChange={() => handleTogglePassenger(p.id)}
                  />
                  {title} {p.givenName} {p.surname}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 🧩 Карта мест */}
      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={0}
        showSegmentSelector={showSegmentSelector}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(segment, index, cabin)
        }
        availability={Array.isArray(availability) ? availability : []}
        passengers={selectedPassengers}
      />
    </div>
  );
};

export default SeatMapComponentPnr;