// file SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { mapCabinToCode } from '../../utils/mapCabinToCode';

import { getService} from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

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
    if (!flightSegments.length || !currentSegment) {
      console.warn('⛔ Нет сегментов или текущий сегмент не определён');
      setFlight(null);
      return;
    }
  
    // Используем функцию генерации полёта
    const generatedFlight = generateFlightData(currentSegment, segmentIndex, cabinClass);
  
    if (!generatedFlight || generatedFlight.flightNo === '000' || generatedFlight.airlineCode === 'XX') {
      console.warn('⛔ generateFlightData: flight некорректен.', generatedFlight);
      setFlight(null);
      return;
    }
  
    console.log('🔧 [generateFlightData] результат:', generatedFlight);
  
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
      availability: JSON.stringify(availability),
      passengers: JSON.stringify(passengers) // ✅ добавлено
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
        currentDeckIndex: '0',
        availability: JSON.stringify(availability),
        passengers: JSON.stringify(passengers) // ✅ добавлено
      };

      console.log('%c🚀 [SeatMaps] Повторная инициализация через timeout', 'color: orange; font-weight: bold;');
      iframe.contentWindow.postMessage(message, '*');
    }, 300);

    return () => clearTimeout(timeout);
  }, [flight]);

  // 👂👂👂 Слушатель сообщений из библиотеки (seatSelected)
  const appMessageListener = (event: MessageEvent) => {
    const { type, ...rest } = event.data;
    console.log('Recieved!!!:', event.data);

    if (type === 'seatMaps' && rest.onSeatSelected) {
      const { passengerId, seatLabel, value, currency, label, flightNumber, airlineCode, origin, destination, departureDate } = rest.onSeatSelected;
    
      console.log('✅ Выбрано место:', seatLabel, 'для пассажира:', passengerId);
    
      const publicModalsService = getService(PublicModalsService);

      const UpdatePNRComponent = require('../../PNR/UpdatePNR').UpdatePNR;
    
      publicModalsService.showReactModal({
        header: 'Назначение места',
        component: React.createElement(UpdatePNRComponent, {
          passengerRef: passengerId,
          seatNumber: seatLabel,
          amount: value,
          currency,
          passengerName: label,
          flightNumber,
          airlineCode,
          origin,
          destination,
          departureDate
        }),
        modalClassName: 'seatmap-modal-class'
      });
    }
  };

  window.addEventListener('message', appMessageListener);

  // useEffect(() => {
  //   window.addEventListener('message', appMessageListener);
  //   return () => {
  //     window.removeEventListener('message', appMessageListener);
  //   };
  // }, []);

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


