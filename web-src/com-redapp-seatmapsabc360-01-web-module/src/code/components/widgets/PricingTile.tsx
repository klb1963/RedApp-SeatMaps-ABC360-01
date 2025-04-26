import * as React from 'react';
import { AirPricingData } from 'sabre-ngv-pricing/response/interfaces/AirPricingData';
import { showSeatMapPricingModal } from '../showSeatMapPricingModal';

export const PricingTile = (data: AirPricingData): React.ReactElement => {
  const handleClick = () => {
    console.log('🔘 Клик по кнопке SeatMaps ABC 360 в PricingTile');
    showSeatMapPricingModal(); // Вызов модального окна
  };

  // 📦 Формируем подпись с сегментами (origin-destination:airline flightNo ...)
  let segmentLabel = '';
  try {
    const raw = window.sessionStorage.getItem('flightSegmentsForPricing');
    const segments = raw ? JSON.parse(raw) : [];

    segmentLabel = segments.map((segment: any) => {
      return `${segment.origin}-${segment.destination}:${segment.marketingAirline} ${segment.flightNumber}`;
    }).join(' ');
  } catch (e) {
    console.error('⚠️ Ошибка при извлечении flightSegmentsForPricing в PricingTile:', e);
    segmentLabel = 'ABC Seat Map';
  }

  return (
    <div
      className="sdk-pricing-custom-tile-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px'
      }}
    >
      <div style={{ fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
        {segmentLabel}
      </div>

      <button
        className="abc-seatmap-button"
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 12px',
          backgroundColor: '#2f73bc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        SeatMaps ABC 360
      </button>
    </div>
  );
};