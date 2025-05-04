//file: code/components/SeatMapShoppingTile.ts

import { Tile } from 'sabre-ngv-app/app/widgets/drawer/views/elements/Tile';
import { TileOptions } from 'sabre-ngv-app/app/widgets/drawer/views/elements/TileOptions';
import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';
import { WithoutFocusOnClick } from 'sabre-ngv-app/app/common/mixins/WithoutFocusOnClick';
import { Initial } from 'sabre-ngv-core/decorators/classes/Initial';
import { Mixin } from 'sabre-ngv-core/decorators/classes/Mixin';
import { CssClass } from 'sabre-ngv-core/decorators/classes/view/CssClass';
import { extractSegmentData } from '../../utils/extractSegmentData';

@CssClass('com-redapp-seatmapsabc360-01-web-module', { overwrite: false })
@Initial<TileOptions>({
    caption: 'SeatMaps ABC 360',
    className: 'web-air-shopping-widget-sample'
})
@Mixin(WithoutFocusOnClick)
export class SeatMapShoppingTile extends Tile<FlightSegment> implements WithoutFocusOnClick {
    declare context: any;

    private currentSegment: FlightSegment | null = null;
    private sharedModel: any = null;

    selfDrawerContextModelPropagated(cpa: FlightSegment): void {

        console.log("selfDrawerContextModelPropagated");

        try {
            this.currentSegment = cpa;
            const segment = cpa;
            const sharedSegmentData = extractSegmentData(segment);

            // Сохраняем или повторно используем sharedModel
            if (this.context?.sharedContextModel?.set) {
                this.sharedModel = this.context.sharedContextModel;
                this.sharedModel.set('selectedSegmentForPricing', sharedSegmentData);
                console.log('✅ Сохранили сегмент в SharedContextModel:', sharedSegmentData);
            } else if (this.sharedModel?.set) {
                this.sharedModel.set('selectedSegmentForPricing', sharedSegmentData);
                console.log('♻️ Повторно сохранили сегмент в SharedContextModel:', sharedSegmentData);
            } else {
                console.warn('⚠️ SharedContextModel недоступен — сегмент не сохранён.');
            }

            const segments = cpa.getShoppingItinerary().getFlightSegments();

            const label = segments.map(segment => {
                const origin = segment.getOriginIata();
                const destination = segment.getDestinationIata();
                const carrier = segment.getMarketingAirline();
                const flightNumber = segment.getFlightNumber();
                return `${origin}-${destination}:${carrier} ${flightNumber}`;
            }).join(' ');

            // формируем виджетс "кнопкой"
            const tileHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; font-size: 12px;">
                    <div style="margin-bottom: 8px;">${label}</div>
                    <button class="abc-seatmap-button" style="
                        padding: 0px 12px 12px 12px;
                        background-color: #2f73bc;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;">
                        SeatMaps ABC 360
                    </button>
                </div>
            `;

            console.log("setDataContent_before");

            this.setDataContent(tileHtml);

            console.log("setDataContent_after");

            // Обработчик клика
            this.$el.off('click', '.abc-seatmap-button');
            this.$el.on('click', '.abc-seatmap-button', () => {
                console.log('🔁 Клик по кнопке — повторно инициируем View');
                this.trigger('selfDrawerContextModelPropagated', this.model); // ✅ нативно
            });

        } catch (error) {
            console.error('❌ Ошибка в selfDrawerContextModelPropagated:', error);
        }
    }

    selfSelectedFareChanged(cpa: FlightSegment): void {
        this.selfDrawerContextModelPropagated(cpa);
    }
}