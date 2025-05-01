// file SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex?: number;
  showCabinClassSelector?: boolean;
  defaultCabinClass?: 'F' | 'C' | 'S' | 'Y' | 'A';
  generateFlightData: (segment: any, segmentIndex: number, cabinClass?: string) => any;
  layoutData?: any;
  availability?: any[];
  passengers?: any[];
  showSegmentSelector?: boolean;
  assignedSeats?: { passengerId: string; seat: string }[];
}

const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex = 0,
  showCabinClassSelector = false,
  defaultCabinClass = 'A',
  generateFlightData,
  availability = [],
  passengers = [],
  showSegmentSelector = true,
  assignedSeats
}) => {
  console.count('🔁 Render SeatMapComponentBase');

  const [segmentIndex, setSegmentIndex] = useState(initialSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'F' | 'C' | 'S' | 'Y' | 'A'>(defaultCabinClass);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [flight, setFlight] = useState<any>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentSegment = flightSegments[segmentIndex];

  // 🔍 Логи для отладки
  useEffect(() => {
    console.log('📡 [SeatMapComponentBase] 🔄 Обновлены flightSegments:', flightSegments);
  }, [flightSegments]);

  useEffect(() => {
    console.log('🎯 [SeatMapComponentBase] Выбранный segmentIndex:', segmentIndex);
  }, [segmentIndex]);

  // 🎯 Генерация flight при изменении сегмента или класса
  useEffect(() => {
    if (!currentSegment || !currentSegment.marketingAirline || !currentSegment.flightNumber) {
      console.warn('⛔ [SeatMapComponentBase] Невозможно сгенерировать flight: сегмент некорректен.', currentSegment);
      setFlight(null);
      return;
    }

    const generatedFlight = generateFlightData(currentSegment, segmentIndex);
    console.log('✅ [SeatMapComponentBase] Сформирован flight:', generatedFlight);
    setFlight(generatedFlight);
  }, [currentSegment, segmentIndex, cabinClass]);

  // 🚀 Отправка сообщения в iframe при готовности данных
  useEffect(() => {
    if (!flight || flight.flightNo === '000' || flight.airlineCode === 'XX') {
      console.warn('[⏳ SeatMaps] Пропущена отправка: flight ещё не готов или некорректен.', flight);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const message: any = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight)
    };

    if (availability.length > 0) {
      message.availability = JSON.stringify(availability);
    }

    if (passengers.length > 0) {
      message.passengers = JSON.stringify(passengers);
    }

    if (assignedSeats && assignedSeats.length > 0) {
      message.assignedSeats = JSON.stringify(assignedSeats);
    }

    console.log('[📤 SeatMaps] Sending flight to iframe:', flight);
    iframe.contentWindow.postMessage(message, '*');
  }, [flight]);

  // Слушатель iframe
  useEffect(() => {
    const appMessageListener = (event: MessageEvent) => {
      const { type } = event.data;
      if (type === 'seatMaps') {
        // обработка ответа
      }
    };
    window.addEventListener('message', appMessageListener);
    return () => window.removeEventListener('message', appMessageListener);
  }, []);

  useEffect(() => {
    if (selectedSeat) {
      console.log('✅ Выбранное место готово для бронирования:', selectedSeat);
    }
  }, [selectedSeat]);

  return (
    <div style={{ padding: '1rem' }}>
      {showSegmentSelector && (
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="segmentSelect">Выберите сегмент: </label>
          <select
            id="segmentSelect"
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
          >
            {flightSegments.map((segment, index) => (
              <option key={index} value={index}>
                {segment.marketingAirline || segment.MarketingAirline?.EncodeDecodeElement?.Code || 'XX'}{' '}
                {segment.flightNumber || segment.FlightNumber || '000'} →{' '}
                {segment.origin || segment.OriginLocation?.EncodeDecodeElement?.Code || '???'} –
                {segment.destination || segment.DestinationLocation?.EncodeDecodeElement?.Code || '???'}
              </option>
            ))}
          </select>
        </div>
      )}

      {showCabinClassSelector && (
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="cabinClassSelect">Выберите класс (кабину): </label>
          <select
            id="cabinClassSelect"
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as any)}
          >
            <option value="Y">Economy</option>
            <option value="S">Premium Economy</option>
            <option value="C">Business</option>
            <option value="F">First</option>
            <option value="A">All cabins</option>
          </select>
        </div>
      )}

      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#333' }}>
        <strong>🛫 Flight info:</strong>
        <pre>{JSON.stringify(flight, null, 2)}</pre>
      </div>

      <iframe
        ref={iframeRef}
        src="https://quicket.io/react-proxy-app/"
        width="100%"
        height="800"
        style={{ border: '1px solid #ccc' }}
        title="SeatMapIframe"
      />
    </div>
  );
};

export default SeatMapComponentBase;