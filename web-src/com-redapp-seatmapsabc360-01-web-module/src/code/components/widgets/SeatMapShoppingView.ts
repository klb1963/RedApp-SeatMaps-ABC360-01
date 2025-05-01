// file: SeatMapShoppingView.ts

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AbstractView } from 'sabre-ngv-app/app/AbstractView';
import { AbstractModel } from 'sabre-ngv-app/app/AbstractModel';
import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';
import SeatMapComponentShopping from '../SeatMapComponentShopping';
import { quicketConfig } from '../../utils/quicketConfig';
import { CssClass } from 'sabre-ngv-core/decorators/classes/view/CssClass';
import { Template } from 'sabre-ngv-core/decorators/classes/view/Template';

@CssClass('com-redapp-seatmapsabc360-01-web-module')
@Template('com-redapp-seatmapsabc360-01-web-module:ShoppingTileView')
export class SeatMapShoppingView extends AbstractView<AbstractModel> {
    private currentSegment: FlightSegment | null = null;
    private flightSegments: any[] = [];
    private selectedSegmentIndex: number = 0;

    selfDrawerContextModelPropagated(cpa: FlightSegment): void {

        console.log('📌 [SeatMapShoppingView] selfDrawerContextModelPropagated called with cpa:', cpa);

        this.currentSegment = cpa;
        this.updateFlightSegmentsFromSegment(cpa);
        console.log("tryRenderReactComponent_before");
        this.tryRenderReactComponent();
    }

    private updateFlightSegmentsFromSegment(segment: FlightSegment): void {
        const segments = segment.getShoppingItinerary().getFlightSegments();
    
        const aircraftTypes: Record<string, string> = {
            '359': 'Airbus A350-900',
            '388': 'Airbus A380-800',
            '77W': 'Boeing 777-300ER',
            '320': 'Airbus A320',
            '321': 'Airbus A321',
            '738': 'Boeing 737-800',
            '787': 'Boeing 787 Dreamliner'
        };
    
        this.flightSegments = segments.map(s => {
            const departureDateTime = s.getDepartureDate();
            const equipmentCode = s.getEquipmentCode?.() || 'UNKNOWN';
            const equipmentDescription = aircraftTypes[equipmentCode] || 'Not Available';
    
            return {
                id: s.getSegmentId(),
                segmentId: s.getSegmentId(),
                flightNumber: s.getFlightNumber(),
                origin: s.getOriginIata(),
                destination: s.getDestinationIata(),
                airMiles: s.getAirMiles(),
                departureDateTime: departureDateTime ? departureDateTime.toISOString().split('T')[0] : 'UNKNOWN',
                marketingAirline: s.getMarketingAirline(),
                cabinClass: 'A',
                aircraft: {
                    code: equipmentCode,
                    description: equipmentDescription
                }
            };
        });
    }

    tryRenderReactComponent(attempts = 0) {

        console.log("tryRenderReactComponent");

        const MAX_ATTEMPTS = 10;
        const INTERVAL = 500;
        const rootElement = document.getElementById('seatmap-root');

        if (rootElement) {
            console.log('✅ [SeatMapShoppingView] Элемент seatmap-root найден. Начинаем рендеринг React компонента.');
            this.renderReactComponent();
        } else if (attempts < MAX_ATTEMPTS) {
            console.warn(`⚠️ [SeatMapShoppingView] Элемент seatmap-root не найден. Повторная попытка через ${INTERVAL} мс. Попытка ${attempts + 1}/${MAX_ATTEMPTS}`);
            setTimeout(() => this.tryRenderReactComponent(attempts + 1), INTERVAL);
        } else {
            console.error('❌ [SeatMapShoppingView] Не удалось найти элемент seatmap-root после максимального числа попыток.');
        }
    }

    renderReactComponent() {

        console.log("renderReactComponent");

        if (!this.currentSegment) {
            console.warn('⚠️ Нет сохранённого сегмента. React компонент не будет отрендерен.');
            return;
        }
    
        if (!this.flightSegments?.length) {
            console.warn('⚠️ flightSegments пуст. Переинициализация из текущего сегмента.');
            this.updateFlightSegmentsFromSegment(this.currentSegment);
        }
    
        let rootElement = document.getElementById('seatmap-root');
    
        if (rootElement) {
            ReactDOM.unmountComponentAtNode(rootElement);
            rootElement.innerHTML = '';
        } else {
            rootElement = document.createElement('div');
            rootElement.id = 'seatmap-root';
            document.body.appendChild(rootElement);
        }
    
        const data = {
            flightSegments: this.flightSegments,
            selectedSegmentIndex: this.selectedSegmentIndex
        };
    
        // 💾 Сохраняем flightSegments в sessionStorage для использования в Pricing
        try {
            window.sessionStorage.setItem('flightSegmentsForPricing', JSON.stringify(this.flightSegments));
            console.log('💾 [SeatMapShoppingView] Сегменты маршрута сохранены в sessionStorage:', this.flightSegments);
        } catch (error) {
            console.error('❌ Ошибка при сохранении данных в sessionStorage:', error);
        }
    
        ReactDOM.render(
            React.createElement(SeatMapComponentShopping, { config: quicketConfig, data }),
            rootElement
        );
    
        console.log('📌 [SeatMapShoppingView] React Component успешно отрендерен в #seatmap-root.');
    }
}
