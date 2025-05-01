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
import { bookingClassToCabinCode } from '../utils/mapCabinToCode';

import { generateFlightData, FlightSegmentInput } from '../utils/generateFlightData'; // ✅ добавлен импорт

import SeatMapComponentBase from './SeatMapComponentBase';
import { SeatMapComponentWrapper } from './SeatMapComponentWrapper';

interface SeatMapsPopoverState {
  selectedPassengers: string[];
  selectedSegment: string;
  selectedSegmentFullData: SegmentOption | null;
  passengers: PassengerOption[];
  segments: SegmentOption[];
  flightSegmentInput?: FlightSegmentInput; // ✅ добавлено
}

export class SeatMapsPopover extends React.Component<Record<string, unknown>, SeatMapsPopoverState> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      selectedPassengers: [],
      selectedSegment: '',
      selectedSegmentFullData: null,
      passengers: [],
      segments: []
    };
  }

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
        selectedSegmentFullData
      });
    });
  }

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
  
      if (fullData) {
        const flightSegmentInput = {
          marketingAirline: fullData.marketingCarrier,
          flightNumber: fullData.marketingFlightNumber,
          departureDateTime: `${fullData.departureDate}T00:00:00`,
          origin: fullData.origin,
          destination: fullData.destination,
          cabinClass: bookingClassToCabinCode(fullData.bookingClass),
          equipment: fullData.equipment
        };
  
        this.setState({
          selectedSegment: selected.value,
          selectedSegmentFullData: fullData,
          flightSegmentInput // ✅ сохраняем объект в state
        });
      }
    }
  };

  //========= loadSeatMap =================

  private loadSeatMap = async ({ availabilityInfo, silent = false }: { availabilityInfo: boolean; silent?: boolean }): Promise<void> => {
    const { selectedPassengers, passengers, flightSegmentInput } = this.state;
  
    if (!flightSegmentInput) {
      console.error('❌ flightSegmentInput is missing.');
      return;
    }
  
    // 🎯 Объект для запроса в Sabre (расширяем input нужными полями)
    const flightSegmentRQ = {
      bookingClass: flightSegmentInput.cabinClass || 'Y', // или исходный bookingClass, если доступен
      marketingCarrier: flightSegmentInput.marketingAirline || '',
      marketingFlightNumber: flightSegmentInput.flightNumber || '',
      flightNumber: flightSegmentInput.flightNumber || '',
      departureDate: flightSegmentInput.departureDateTime?.split('T')[0] || '',
      origin: flightSegmentInput.origin || '',
      destination: flightSegmentInput.destination || ''
    };
  
    // ✅ Генерация визуального flight объекта
    const flight = generateFlightData(flightSegmentInput, 0);
  
    const assignedSeats = passengers
      .filter(p => p.seatAssignment)
      .map(p => ({
        passengerId: p.value,
        seat: p.seatAssignment!
      }));
  
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
  
    if (!availabilityInfo) {
      getService(PublicModalsService).showReactModal({
        header: '✈️ Empty Seat Map',
        component: React.createElement(SeatMapComponentBase, {
          flightSegments: [flight],
          config: quicketConfig,
          availability: [],
          passengers: [],
          generateFlightData,
          initialSegmentIndex: 0,
          showSegmentSelector: false,
          assignedSeats
        }),
        modalClassName: 'seatmap-xml-modal'
      });
      return;
    }
  
    // 🚀 Запрос в Sabre
    await loadSeatMapFromSabre(flightSegmentRQ, mappedPassengers, async (parsed, rawXml) => {
      const xmlDoc = new DOMParser().parseFromString(rawXml, 'application/xml');
      const { availability } = parseSeatMapResponse(xmlDoc);
  
      getService(PublicModalsService).showReactModal({
        header: '👥 Occupied Seat Map',
        component: React.createElement(SeatMapComponentWrapper, {
          flightSegments: [flight],
          config: quicketConfig,
          availability,
          passengers: mappedPassengers,
          generateFlightData,
          initialSegmentIndex: 0,
          showCabinClassSelector: false,
          showSegmentSelector: false,
          assignedSeats
        }),
        modalClassName: 'seatmap-xml-modal'
      });
    });
  };

  //======================================

  render(): JSX.Element {
    const { passengers, segments, selectedPassengers, selectedSegment } = this.state;
    const selectedSegmentData = segments.find(seg => seg.value === selectedSegment);
    const isButtonDisabled = !selectedSegment || selectedPassengers.length === 0;

    return (
      <div style={{ padding: '20px', minWidth: '400px', backgroundColor: '#fff' }}>
        <FormGroup>
          <ControlLabel>Select Passengers ({selectedPassengers.length})</ControlLabel>
          <div style={{ marginTop: '10px' }}>
            {passengers.map(passenger => (
              <div key={passenger.value} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <input
                  type="checkbox"
                  checked={selectedPassengers.includes(passenger.value)}
                  onChange={() => this.handlePassengerChange(passenger.value)}
                  style={{ marginRight: '8px' }}
                />
                <span>
                  {passenger.label} —{' '}
                  {passenger.seatAssignment
                    ? `🟢 Место: ${passenger.seatAssignment}`
                    : '🔴 Без места'}
                </span>
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