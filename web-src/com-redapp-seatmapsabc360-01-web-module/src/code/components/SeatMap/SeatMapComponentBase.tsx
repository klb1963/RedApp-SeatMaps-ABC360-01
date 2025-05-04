// file SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { mapCabinToCode } from '../../utils/mapCabinToCode';

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex?: number;
  generateFlightData: (segment: any, segmentIndex: number, cabinClass?: string) => any;
  cabinClass: 'F' | 'C' | 'S' | 'Y' | 'A' | 'P' | 'B';
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
  generateFlightData,
  cabinClass,
  layoutData,
  availability = [],
  passengers = [],
  showSegmentSelector = true,
  assignedSeats
}) => {
  const [segmentIndex, setSegmentIndex] = useState(initialSegmentIndex);
  const [flight, setFlight] = useState<any>(null); // объект, который отправим в библиотеку
  const iframeRef = useRef<HTMLIFrameElement>(null); // ссылка на iframe

  const currentSegment = flightSegments[segmentIndex];

  // 🔄 Генерация flight при изменении сегмента или класса обслуживания
  useEffect(() => {
    if (
      !flightSegments.length ||
      !currentSegment ||
      !currentSegment.marketingAirline ||
      !currentSegment.flightNumber
    ) {
      console.warn('⛔ Невозможно сгенерировать flight: сегмент некорректен.', currentSegment);
      setFlight(null);
      return;
    }

    const generatedFlight = generateFlightData(currentSegment, segmentIndex, cabinClass);

    if (!generatedFlight) {
      console.warn('⚠️ generateFlightData вернул null или undefined');
      setFlight(null);
      return;
    }

    console.log('🔧 [generateFlightData] результат:', generatedFlight);

    // 🪑 Преобразуем cabinClass для библиотеки визуализации
    const cabinClassForLib = mapCabinToCode(cabinClass);

    const flightForIframe = {
      ...generatedFlight,
      cabinClass: cabinClassForLib,
      passengerType: 'ADT',
    };

    console.log('✅ Сформирован flight:', flightForIframe);
    setFlight(flightForIframe);
  }, [flightSegments, segmentIndex, cabinClass]);

  // 📤 Отправка сообщения в iframe при обновлении flight
  useEffect(() => {
    if (!flight || flight.flightNo === '000' || flight.airlineCode === 'XX') {
      console.warn('[⏳ SeatMaps] Пропущена отправка: flight ещё не готов или некорректен.', flight);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const message: Record<string, string> = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      currentDeckIndex: '0',
    };

    console.log('%c📤 [SeatMaps] Итоговое сообщение в библиотеку:', 'color: green; font-weight: bold;');
    console.log(JSON.stringify(message, null, 2));

    iframe.contentWindow.postMessage(message, '*');
  }, [flight]);

  // ⏱ Повторная инициализация через короткий таймер
  useEffect(() => {
    if (!flight) return;

    const timeout = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      const message: Record<string, string> = {
        type: 'seatMaps',
        config: JSON.stringify(config),
        flight: JSON.stringify(flight),
        currentDeckIndex: '0'
      };

      console.log('%c🚀 [SeatMaps] Повторная инициализация через timeout', 'color: orange; font-weight: bold;');
      iframe.contentWindow.postMessage(message, '*');
    }, 300);

    return () => clearTimeout(timeout);
  }, [flight]);

  return (
    <div style={{ padding: '1rem' }}>
      {/* 👇 Селектор сегмента (если включён) */}
      {showSegmentSelector && (
        <div style={{ marginBottom: '1rem' }}>
          <label>Сегмент:</label>
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
      )}

      {/* 🔍 Отладочная информация */}
      <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#555', background: '#f9f9f9', padding: '0.5rem', border: '1px solid #ccc' }}>
        <strong>Debug info:</strong>
        <div>segmentIndex: {segmentIndex}</div>
        <div>cabinClass: {cabinClass}</div>
        <div>flightNo: {flight?.flightNo}</div>
        <div>airlineCode: {flight?.airlineCode}</div>
        <div>equipment: {flight?.equipment}</div>
      </div>

      {/* ✈️ Полный JSON flight-объекта */}
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#333' }}>
        <strong>🛫 Flight info:</strong>
        <pre>{JSON.stringify(flight, null, 2)}</pre>
      </div>

      {/* 👉 iframe с картой салона */}
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