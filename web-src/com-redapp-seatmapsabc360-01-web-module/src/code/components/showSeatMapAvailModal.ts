import * as React from 'react';
import { getService } from '../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { ReactModalOptions } from 'sabre-ngv-modals/components/PublicReactModal/ReactModalOptions';

import SeatMapComponentAvail from './SeatMapComponentAvail';
import { quicketConfig } from '../utils/quicketConfig';
import { PublicAirAvailabilityData } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityData';

// 🔹 Показ модального окна с SeatMapComponentAvail
export function showSeatMapAvailModal(data: PublicAirAvailabilityData): void {
  console.log('📥 [showSeatMapAvailModal] Data received:', data);

  const modalService = getService(PublicModalsService);

  const options: ReactModalOptions = {
    header: 'SeatMaps ABC 360 Viewer',
    component: React.createElement(SeatMapComponentAvail, {
      config: quicketConfig,  // настройки карты салона
      data                    // входные данные из Availability Tile
    }),
    modalClassName: 'react-tile-modal-class',
    onHide: () => console.log('[SeatMap Modal] Closed')
  };

  modalService.showReactModal(options);
}