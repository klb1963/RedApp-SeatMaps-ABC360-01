import * as React from 'react';
import { Module } from 'sabre-ngv-core/modules/Module';
import { getService, registerService } from './Context';
import { ExtensionPointService } from 'sabre-ngv-xp/services/ExtensionPointService';
import { RedAppSidePanelConfig } from 'sabre-ngv-xp/configs/RedAppSidePanelConfig';
import { RedAppSidePanelButton } from 'sabre-ngv-redAppSidePanel/models/RedAppSidePanelButton';
import { LayerService } from 'sabre-ngv-core/services/LayerService';

import { PublicAirAvailabilityService } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityService';
import { ReactModalOptions } from 'sabre-ngv-modals/components/PublicReactModal/ReactModalOptions';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

import { DrawerService } from 'sabre-ngv-app/app/services/impl/DrawerService';
import { LargeWidgetDrawerConfig } from 'sabre-ngv-core/configs/drawer/LargeWidgetDrawerConfig';

import { CustomWorkflowService } from './services/CustomWorkflowService';
import { SeatMapAvailTile } from './components/widgets/SeatMapAvailTile';
import SeatMapComponentAvail from './components/SeatMapComponentAvail';
import { quicketConfig } from './utils/quicketConfig';

import { SeatMapShoppingTile } from './components/widgets/SeatMapShoppingTile';
import { SeatMapShoppingView } from './components/widgets/SeatMapShoppingView';

import { IAirPricingService } from 'sabre-ngv-pricing/services/IAirPricingService';
import { PricingTile } from './components/widgets/PricingTile';
import { PricingView } from './components/widgets/PricingView';

import { CreatePNR } from './components/createPNR/CreatePNR';
import { SeatMapsPopover } from './components/SeatMapsPopover';

import { loadPnrDetailsFromSabre } from './components/loadPnrDetailsFromSabre';

export class Main extends Module {
    init(): void {
        super.init();
        registerService(CustomWorkflowService);

        // регистрация виджетов
        this.registerSeatMapAvailTile();
        this.registerSeatMapShoppingTile();

        // регистрация кнопок на правой панели
        const xp = getService(ExtensionPointService);
        const sidepanelMenu = new RedAppSidePanelConfig([
            new RedAppSidePanelButton(
                "Create PNR",
                "btn-secondary side-panel-button",
                () => { this.showForm(); },
                false
            ),
            new RedAppSidePanelButton(
                "SeatMaps ABC 360",
                "btn-secondary side-panel-button",
                () => { this.openSeatMaps(); },
                false
            ),
            new RedAppSidePanelButton(
              "Get EnhancedSeatMapRQ",
              "btn-secondary side-panel-button",
              () => { this.getEnhancedSeatMapRQ(); }, // 👈 новая кнопка
              false
          ),
          new RedAppSidePanelButton(
            "Show PNR Info",
            "btn-secondary side-panel-button",
            () => { this.showPnrInfo(); }, // 👈 метод, который мы сейчас напишем
            false
          ),
        ]);
        xp.addConfig("redAppSidePanel", sidepanelMenu);

    }

    //форма для создания PNR
    showForm(): void {
        const ls = getService(LayerService);
        ls.showOnLayer(CreatePNR, { display: "areaView", position: 42 });
    }

    // открываем модальное окно с SeatMap
    openSeatMaps(): void {
        const publicModalsService = getService(PublicModalsService);
        publicModalsService.showReactModal({
            header: 'Select Passengers and Segment',
            component: React.createElement(SeatMapsPopover),
            modalClassName: 'seatmap-modal-class'
        });
    }
    //============= getEnhancedSeatMapRQ ==========
    private getEnhancedSeatMapRQ(): void {
      const publicModalsService = getService(PublicModalsService);

      publicModalsService.showReactModal({
        header: 'Get EnhancedSeatMapRQ',
        component: React.createElement(require('./components/EnhancedSeatMapRequest').EnhancedSeatMapRequest),
        modalClassName: 'seatmap-xml-modal'
      });
    }

    // =========== showPnrInfo ==================
    showPnrInfo(): void {
      const publicModalsService = getService(PublicModalsService);

      loadPnrDetailsFromSabre((pnrData, rawXml) => {
        const isEmpty = !pnrData ||
          (!pnrData.passengers || pnrData.passengers.length === 0) &&
          (!pnrData.segments || pnrData.segments.length === 0);

        const content = isEmpty
          ? React.createElement('div', { style: { padding: '1rem' } }, 'No active PNR found.')
          : React.createElement(require('./components/ShowPnrInfo').ShowPnrInfo, { pnrData, rawXml });

        publicModalsService.showReactModal({
          header: 'PNR Information',
          component: content,
          modalClassName: 'seatmap-modal-class'
        });
      });
    }

    //============== Widgets ====================

    // AvailabilityTile
    private registerSeatMapAvailTile(): void {
        const airAvailabilityService = getService(PublicAirAvailabilityService);
      
        const showSeatMapAvailabilityModal = (data: any) => {
          console.log('📥 [Availability] Received Data:', JSON.stringify(data, null, 2));
      
          const modalOptions: ReactModalOptions = {
            header: 'SeatMaps ABC 360',
            component: React.createElement(SeatMapComponentAvail, {
              config: quicketConfig,
              data: data
            }),
            modalClassName: 'react-tile-modal-class'
          };
      
          getService(PublicModalsService).showReactModal(modalOptions);
        };
      
        airAvailabilityService.createAirAvailabilitySearchTile(
          SeatMapAvailTile,
          showSeatMapAvailabilityModal,
          'SeatMaps ABC 360'
        );
      }

    // Shopping & Pricing Tile 
    private registerSeatMapShoppingTile(): void {
        // определяем config shoppingDrawerConfig для Shopping
        const shoppingDrawerConfig = new LargeWidgetDrawerConfig(SeatMapShoppingTile, SeatMapShoppingView, {
            title: 'Shopping Tile Widget' // заголовок окна
        });
        // вызвываем сервис с этим config shoppingDrawerConfig
        getService(DrawerService).addConfig(['shopping-flight-segment'], shoppingDrawerConfig);

        // Pricing Tile
        const showPricingModal = this.createShowModalAction(PricingView, 'Pricing Data');
        getService(IAirPricingService).createPricingTile(PricingTile, showPricingModal, 'ABC Seat Map');

    }

    // ===============================================

    // приватный метод для показа модального окна
    private createShowModalAction(view: React.FunctionComponent<any>, header: string): (data: any) => void {
        return ((data) => {
    
            console.log('📥 [Pricing] Received:', JSON.stringify(data, null, 2));
    
          const ngvModalOptions: ReactModalOptions = {
            header,
            component: React.createElement(
              view,
              data
            ),
            modalClassName: 'react-tile-modal-class'
          }
          getService(PublicModalsService).showReactModal(ngvModalOptions);
        })
      }

}