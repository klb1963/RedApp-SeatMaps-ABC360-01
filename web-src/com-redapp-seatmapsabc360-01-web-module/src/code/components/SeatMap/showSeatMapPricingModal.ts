import * as React from 'react';
import { getService } from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { ReactModalOptions } from 'sabre-ngv-modals/components/PublicReactModal/ReactModalOptions';

import SeatMapComponentPricing from './SeatMapComponentPricing';
import { quicketConfig } from '../../utils/quicketConfig';

export function showSeatMapPricingModal(): void {
  const modalService = getService(PublicModalsService);

  // 🟡 Получаем сохранённые сегменты из sessionStorage
  const raw = window.sessionStorage.getItem('flightSegmentsForPricing');
  let segments: any[] = [];

  try {
    segments = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('❌ Ошибка разбора данных flightSegmentsForPricing из sessionStorage:', e);
  }

  if (!segments.length) {
    alert('❗ Нет доступных сегментов рейса для отображения карты мест.');
    return;
  }

  const options: ReactModalOptions = {
    header: 'SeatMap Viewer (Pricing)',
    component: React.createElement(SeatMapComponentPricing, {
      config: quicketConfig,
      flightSegments: segments,        // 🔄 передаём сохранённые сегменты
      selectedSegmentIndex: 0          // можно начать с первого
    }),
    onHide: () => console.log('[SeatMap Modal] Closed')
  };

  modalService.showReactModal(options);
}