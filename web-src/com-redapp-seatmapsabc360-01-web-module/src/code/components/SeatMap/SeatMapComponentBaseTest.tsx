// file: SeatMapComponentBaseTest.tsx

import * as React from 'react';
import { useEffect, useRef } from 'react';

const SeatMapComponentBaseTest: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const message = { // формируем данные для библиотеки
      type: 'seatMaps',
      config: {
        width: 400,
        lang: 'EN',
        horizontal: false,
        rightToLeft: false,
        visibleFuselage: true,
        visibleWings: true,
        builtInTooltip: true,
        singleDeckMode: true,
      },
      flight: {
        id: '111',
        airlineCode: 'EK',
        flightNo: '50',
        departureDate: '2025-07-19',
        departure: 'MUC',
        arrival: 'DXB',
        cabinClass: 'Y'
      },
      availability: [
        {
          currency: 'USD',
          label: '20A',
          price: 33,
          onlyForPassengerType: ['ADT', 'CHD', 'INF'],
        },
        {
          currency: 'USD',
          label: '21F',
          price: 44,
          onlyForPassengerType: ['ADT'],
        },
        {
          currency: 'USD',
          label: '22C',
          price: 55,
        },
      ],
      passengers: [
        { passengerType: 'ADT', id: '1', seat: null },
        {
          id: '2',
          seat: { price: 0, seatLabel: '21F' },
          passengerLabel: 'John Doe',
          passengerColor: 'blue'
        },
        {
          id: '3',
          seat: null,
          passengerType: 'CHD',
          passengerLabel: 'Jane Kid',
          passengerColor: 'green'
        }
      ],
      currentDeckIndex: 0
    };

    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      setTimeout(() => {
        console.log('🧪 TEST MOCK | Sending INIT_DATA to iframe (RAW object):', message);
        iframe.contentWindow?.postMessage(message, '*'); // отправляем данные в iframe -> библиотеку
      }, 3000); // Увеличенная задержка — 3 секунды
    }
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>✏️ SEATMAPCOMPONENTBASETEST – TEST MOCK</h3>
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

export default SeatMapComponentBaseTest;