// file: SeatMapComponentAvail.tsx

// Финализированный компонент SeatMapComponentAvail

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './getFlightFromSabreData';
import { mapCabinToCode } from '../../utils/mapCabinToCode';

// Типы кабины в библиотеке визуализации и в Sabre
type CabinClassForLibrary = 'E' | 'P' | 'B' | 'F';
type CabinClassForSabre = 'Y' | 'S' | 'C' | 'F' | 'A';

interface SeatMapComponentAvailProps {
  config: any;
  data: any;
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  const rawSegments = data.flightSegments || [];
  const availability = data.availability || [];
  const passengers = data.passengers || [];

  // 🔢 Индекс текущего сегмента
  const [segmentIndex, setSegmentIndex] = React.useState(0);

  // 🪑 Выбранный класс обслуживания (по умолчанию — Economy / E)
  const [cabinClass, setCabinClass] = React.useState<CabinClassForLibrary>('E');

  // ✈️ Преобразование сегментов в нормализованный формат
  const normalizedSegments = rawSegments.map((seg: any) => ({
    marketingAirline: seg.marketingCarrier || seg.MarketingAirline?.EncodeDecodeElement?.Code || 'XX',
    flightNumber: seg.marketingFlightNumber || seg.FlightNumber || '000',
    departureDateTime: seg.departureDate || seg.DepartureDateTime || '',
    origin: seg.origin || seg.OriginLocation?.EncodeDecodeElement?.Code || '???',
    destination: seg.destination || seg.DestinationLocation?.EncodeDecodeElement?.Code || '???',
    cabinClass: mapCabinToCode(seg.bookingClass || seg.BookingClass || 'Y'),
    equipment: seg.Equipment?.EncodeDecodeElement?.SimplyDecoded || seg.equipment || ''
  }));

  // 🔄 При смене сегмента — сбрасываем cabinClass на Economy
  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSegmentIndex(Number(e.target.value));
    setCabinClass('E');
  };

  // 🔁 Маппинг из библиотечного формата в Sabre-код
  const mapToSabreClass = (libClass: CabinClassForLibrary): CabinClassForSabre => {
    switch (libClass) {
      case 'E': return 'Y';
      case 'P': return 'S';
      case 'B': return 'C';
      case 'F': return 'F';
      default: return 'A';
    }
  };

  const sabreCabinClass = mapToSabreClass(cabinClass);

  const segment = normalizedSegments[segmentIndex]; // 👈 теперь она есть
  console.log('📡 Segment before generateFlightData:', segment);

  return (
    <div style={{ padding: '1rem' }}>
    {/* Селектор сегмента рейса */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div>
        <label>Сегмент:</label>
        <select value={segmentIndex} onChange={handleSegmentChange}>
          {rawSegments.map((seg: any, idx: number) => (
            <option key={idx} value={idx}>
              {seg.origin} → {seg.destination}, рейс {seg.FlightNumber || seg.marketingFlightNumber}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Equipment прямо из normalizedSegments */}
      <div style={{ fontSize: '1.5rem', color: '#555' }}>
        ✈️ <strong>Самолёт:</strong> {normalizedSegments?.[segmentIndex]?.equipment || 'неизвестно'}
      </div>
    </div>

    <br />

    {/* Селектор класса обслуживания */}
    <label>Класс обслуживания:</label>
    <select
      value={cabinClass}
      onChange={(e) => setCabinClass(e.target.value as CabinClassForLibrary)}
    >
      <option value="E">Economy</option>
      <option value="P">Premium Economy</option>
      <option value="B">Business</option>
      <option value="F">First</option>
    </select>

    <br /><br />

    {/* Визуализация карты мест */}
    <SeatMapComponentBase
      config={config}
      flightSegments={[normalizedSegments[segmentIndex]]}
      cabinClass={sabreCabinClass}
      generateFlightData={(segment, index, cabin) => {
        const enrichedSegment = {
          ...segment,
          cabinClass: cabin,
          equipment: segment.equipment
        };
        return getFlightFromSabreData({ flightSegments: [enrichedSegment] }, 0);
      }}
      availability={availability}
      passengers={passengers}
      showSegmentSelector={false}
    />
  </div>
  )
};

export default SeatMapComponentAvail;