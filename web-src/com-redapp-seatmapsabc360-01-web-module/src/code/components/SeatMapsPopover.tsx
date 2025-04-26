// файл: code/components/SeatMapsPopover.tsx

/**
 * SeatMapsPopover - интерфейс для загрузки и отображения карты мест рейса на основе данных PNR.
 *
 * Позволяет выбрать пассажиров, сегмент, класс обслуживания и перевозчика.
 * Отправляет запрос EnhancedSeatMapRQ в Sabre, отображает результат в модальном окне.
 *
 * Использует:
 * - loadPnrDetailsFromSabre() для получения данных PNR
 * - loadSeatMapFromSabre() для загрузки карты мест
 */

import * as React from 'react';
import { getService } from '../Context';
import { Button, FormGroup, ControlLabel } from 'react-bootstrap';
import { SimpleDropdown } from 'sabre-ngv-UIComponents/advancedDropdown/components/SimpleDropdown';
import { Option } from 'sabre-ngv-UIComponents/advancedDropdown/interfaces/Option';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

import { loadPnrDetailsFromSabre } from './loadPnrDetailsFromSabre';
import { loadSeatMapFromSabre } from './loadSeatMapFromSabre';

import { PassengerOption, SegmentOption } from '../utils/parcePnrData';
import { quicketConfig } from '../utils/quicketConfig';
import { parseSeatMapResponse } from '../utils/parseSeatMapResponse';
import { mapCabinToCode } from '../utils/mapCabinToCode';

import SeatMapComponentPnr from '../components/SeatMapComponentPnr';
import SeatMapComponentBase from './SeatMapComponentBase';

//====================
interface SeatMapsPopoverState {
    selectedPassengers: string[];
    selectedSegment: string;
    selectedSegmentFullData: SegmentOption | null;
    selectedCabinClass: string;
    passengers: PassengerOption[];
    segments: SegmentOption[];
}

export class SeatMapsPopover extends React.Component<Record<string, unknown>, SeatMapsPopoverState> {
    constructor(props: Record<string, unknown>) {
        super(props);
        this.state = {
            selectedPassengers: [],
            selectedSegment: '',
            selectedSegmentFullData: null,
            selectedCabinClass: 'Economy',
            passengers: [],
            segments: []
        };
    }

    cabinClasses: Option<string>[] = [
        { label: 'Economy (Y)', value: 'Economy' },
        { label: 'Premium Economy (W)', value: 'PremiumEconomy' },
        { label: 'Business (J)', value: 'Business' },
        { label: 'First (F)', value: 'First' }
    ];

    componentDidMount(): void {
        loadPnrDetailsFromSabre((data) => {
            let selectedSegment = '';
            let selectedSegmentFullData: SegmentOption | null = null;

            if (data.segments.length === 1) {
                selectedSegment = data.segments[0].value;
                selectedSegmentFullData = data.segments[0];
            }

            this.setState({
                passengers: data.passengers.map(p => ({ ...p, checked: true })),
                selectedPassengers: data.passengers.map(p => p.value),
                segments: data.segments,
                selectedSegment,
                selectedSegmentFullData,
                selectedCabinClass: 'Economy'
            });
        });
    }

//====================

    handlePassengerChange = (passengerValue: string): void => {
        this.setState((prevState) => ({
            selectedPassengers: prevState.selectedPassengers.includes(passengerValue)
                ? prevState.selectedPassengers.filter(p => p !== passengerValue)
                : [...prevState.selectedPassengers, passengerValue]
        }));
    };

    handleSegmentChange = (options: Option[]): void => {
        const selected = options.find(opt => opt.checked);
        if (selected) {
            const fullData = this.state.segments.find(seg => seg.value === selected.value) || null;
            this.setState({ selectedSegment: selected.value, selectedSegmentFullData: fullData });
        }
    }

    handleCabinClassChange = (options: Option[]): void => {
        const selected = options.find(opt => opt.checked);
        if (selected) this.setState({ selectedCabinClass: selected.value });
    };

    // ============================

    private loadSeatMap = async ({ availabilityInfo, silent = false }: { availabilityInfo: boolean; silent?: boolean }): Promise<void> => {
        const {
            selectedPassengers,
            selectedSegment,
            selectedCabinClass,
            segments,
            passengers
        } = this.state;
    
        const selectedSegmentData = segments.find(seg => seg.value === selectedSegment);
        if (!selectedSegmentData) {
            console.error('❌ No segment data found.');
            return;
        }
    
        const marketingCarrierFinal = selectedSegmentData?.marketingCarrier || 'UNKNOWN';
    
        const flightSegment = {
            id: selectedSegment,
            origin: selectedSegmentData.origin,
            destination: selectedSegmentData.destination,
            departureDate: selectedSegmentData.departureDate,
            marketingCarrier: marketingCarrierFinal,
            marketingFlightNumber: selectedSegmentData.marketingFlightNumber,
            flightNumber: selectedSegmentData.marketingFlightNumber,
            bookingClass: selectedSegmentData.bookingClass,
            equipment: selectedSegmentData.equipment || 'Unknown',
            cabin: selectedCabinClass as any
        };
    
        // 🧠 Здесь важно: если availabilityInfo == false, пассажиров передаем пусто
        const mappedPassengers = (!availabilityInfo || selectedPassengers.length === 0)
            ? []
            : passengers
                .filter(p => selectedPassengers.includes(p.value))
                .map(p => ({
                    id: p.value,
                    travellerId: Number(p.value),
                    givenName: p.givenName,
                    surname: p.surname
                }));
    
        // ✅ Показ пустой карты без загрузки
        if (!availabilityInfo) {
            const fallbackLayout = {
                decks: [
                    {
                        id: 'main-deck',
                        name: 'Deck 1',
                        width: 600,
                        height: 400,
                        rows: [
                            { label: '1', seats: [{ label: 'A', x: 50, y: 50 }, { label: 'B', x: 100, y: 50 }] },
                            { label: '2', seats: [{ label: 'A', x: 50, y: 100 }] }
                        ]
                    }
                ]
            };
    
            getService(PublicModalsService).showReactModal({
                header: '✈️ Empty Seat Map',
                component: React.createElement(SeatMapComponentBase, {
                    config: quicketConfig,
                    flightSegments: [{ 
                        id: flightSegment.id,
                        airlineCode: flightSegment.marketingCarrier,
                        flightNo: flightSegment.marketingFlightNumber,
                        departureDate: flightSegment.departureDate,
                        departure: flightSegment.origin,
                        arrival: flightSegment.destination,
                        cabinClass: mapCabinToCode(flightSegment.cabin),
                        equipment: flightSegment.equipment || 'Unknown'
                    }],
                    layoutData: fallbackLayout,
                    availability: [],
                    passengers: [],
                    generateFlightData: (segment: any, index: number, cabinClass?: string) => ({
                        id: segment.id,
                        airlineCode: segment.airlineCode,
                        flightNo: segment.flightNo,
                        departureDate: segment.departureDate,
                        departure: segment.departure,
                        arrival: segment.arrival,
                        cabinClass: (cabinClass || 'A') as 'F' | 'C' | 'S' | 'Y' | 'A',
                        equipment: segment.equipment || 'Unknown'
                    }),
                    initialSegmentIndex: 0,
                    showCabinClassSelector: false,
                    showSegmentSelector: false
                }),
                modalClassName: 'seatmap-xml-modal'
            });
    
            return;
        }
    
        // 🧠 Реальная карта через loadSeatMapFromSabre
        await loadSeatMapFromSabre(flightSegment, mappedPassengers, (responseXml) => {
            const { layout, availability } = parseSeatMapResponse(responseXml);
    
            const flight = {
                id: flightSegment.id,
                airlineCode: flightSegment.marketingCarrier,
                flightNo: flightSegment.marketingFlightNumber,
                departureDate: flightSegment.departureDate,
                departure: flightSegment.origin,
                arrival: flightSegment.destination,
                cabinClass: mapCabinToCode(flightSegment.cabin),
                equipment: flightSegment.equipment || 'Unknown'
            };
    
            if (!silent) {
                getService(PublicModalsService).showReactModal({
                    header: '👥 Occupied Seat Map',
                    component: React.createElement(SeatMapComponentBase, {
                        config: quicketConfig,
                        flightSegments: [flight],
                        layoutData: layout,
                        availability: availability,
                        passengers: mappedPassengers,
                        generateFlightData: (segment: any, index: number, cabinClass?: string) => ({
                            id: segment.id,
                            airlineCode: segment.airlineCode,
                            flightNo: segment.flightNo,
                            departureDate: segment.departureDate,
                            departure: segment.departure,
                            arrival: segment.arrival,
                            cabinClass: (cabinClass || 'A') as 'F' | 'C' | 'S' | 'Y' | 'A',
                            equipment: segment.equipment || 'Unknown'
                        }),
                        initialSegmentIndex: 0,
                        showCabinClassSelector: false,
                        showSegmentSelector: false
                    }),
                    modalClassName: 'seatmap-xml-modal'
                });
            }
        });
    };

    // ===========================

    render(): JSX.Element {
        const { passengers, segments, selectedPassengers, selectedSegment, selectedCabinClass } = this.state;
        const selectedSegmentData = segments.find(seg => seg.value === selectedSegment);

        const isButtonDisabled = !selectedSegment || selectedPassengers.length === 0;

        return (
            <div style={{ padding: '20px', minWidth: '400px', backgroundColor: '#fff' }}>
                <FormGroup>
                    <ControlLabel>Select Passengers ({selectedPassengers.length})</ControlLabel>
                    <div style={{ marginTop: '10px' }}>
                        {passengers.map(passenger => (
                            <div key={passenger.value} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                <input type="checkbox" checked={selectedPassengers.includes(passenger.value)} onChange={() => this.handlePassengerChange(passenger.value)} style={{ marginRight: '8px' }} />
                                <span>{passenger.label}</span>
                            </div>
                        ))}
                    </div>
                </FormGroup>

                {selectedSegmentData && (
                    <div style={{ marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>
                        ✈️ {selectedSegmentData.marketingCarrier}{selectedSegmentData.marketingFlightNumber} — {selectedSegmentData.origin} → {selectedSegmentData.destination}
                        <br />
                        📅 Departure: {selectedSegmentData.departureDate}
                        <br />
                        🎟️ Class: {selectedSegmentData.bookingClass}
                        <br />
                        🛩️ Equipment: {selectedSegmentData.equipment}
                    </div>
                )}

                <FormGroup>
                    <ControlLabel>Select Flight Segment</ControlLabel>
                    <SimpleDropdown
                        options={segments.map(seg => ({
                            label: `${seg.marketingCarrier}${seg.marketingFlightNumber} — ${seg.origin} → ${seg.destination}`,
                            value: seg.value,
                            checked: seg.value === selectedSegment
                        }))}
                        onChange={this.handleSegmentChange}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>Select Cabin Class</ControlLabel>
                    <SimpleDropdown options={this.cabinClasses.map(opt => ({ ...opt, checked: opt.value === selectedCabinClass }))} onChange={this.handleCabinClassChange} />
                </FormGroup>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <Button className="btn-primary" style={{ flex: 1 }} disabled={isButtonDisabled} onClick={() => this.loadSeatMap({ availabilityInfo: false })}>
                        ✈️ Empty Seat Map
                    </Button>
                    <Button className="btn-success" style={{ flex: 1 }} disabled={isButtonDisabled} onClick={() => this.loadSeatMap({ availabilityInfo: true })}>
                        👥 Occupied Seat Map
                    </Button>
                </div>
            </div>
        );
    }
}