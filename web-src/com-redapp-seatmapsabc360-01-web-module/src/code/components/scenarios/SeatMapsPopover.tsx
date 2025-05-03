// file: SeatMapsPopover.tsx

// file: SeatMapsPopover.tsx

import * as React from 'react';
import { generateFlightData, FlightSegmentInput } from '../../utils/generateFlightData';
import { mapCabinToCode } from '../../utils/mapCabinToCode';
import SeatMapComponentBase from '../SeatMap/SeatMapComponentBase';
import { quicketConfig } from '../../utils/quicketConfig';
import { PassengerOption, SegmentOption } from '../../utils/parcePnrData';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { parseSeatMapResponse } from '../../utils/parseSeatMapResponse';

interface State {
  passengers: PassengerOption[];
  segments: SegmentOption[];
  flightSegmentInput?: FlightSegmentInput;
  mappedPassengers: any[];
  flight: any;
  assignedSeats: { passengerId: string; seat: string }[];
  availability: any[];
}

export class SeatMapsPopover extends React.Component<Record<string, unknown>, State> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      passengers: [],
      segments: [],
      mappedPassengers: [],
      assignedSeats: [],
      flight: {
        id: '000',
        airlineCode: 'XX',
        flightNo: '000',
        departureDate: '',
        departure: '???',
        arrival: '???',
        cabinClass: '',
        equipment: ''
      },
      availability: []
    };
  }

  // ============

  async componentDidMount(): Promise<void> {
    try {
      // ⏳ Шаг 1: Получаем данные PNR
      const { parsedData: pnrData, rawXml } = await loadPnrDetailsFromSabre();
      const segment = pnrData.segments[0];
      const passengers = pnrData.passengers;
  
      const flightSegmentInput: FlightSegmentInput = {
        marketingAirline: segment.marketingCarrier,
        flightNumber: segment.marketingFlightNumber,
        departureDateTime: `${segment.departureDate}T00:00:00`,
        origin: segment.origin,
        destination: segment.destination,
        cabinClass: mapCabinToCode(segment.bookingClass),
        equipment: segment.equipment
      };
  
      const flight = {
        ...generateFlightData(flightSegmentInput, 0),
        equipment: segment.equipment || ''
      };
  
      const mappedPassengers = passengers.map(p => ({
        id: p.value,
        travellerId: Number(p.value),
        givenName: p.givenName,
        surname: p.surname,
        label: p.label,
        value: p.value
      }));
  
      const assignedSeats = passengers
        .filter(p => p.seatAssignment)
        .map(p => ({
          passengerId: p.value,
          seat: p.seatAssignment!
        }));
  
      // ⏳ Шаг 2: Загружаем availability
      const seatMapResult = await loadSeatMapFromSabre(
        {
          bookingClass: segment.bookingClass,
          marketingCarrier: segment.marketingCarrier,
          marketingFlightNumber: segment.marketingFlightNumber,
          flightNumber: segment.marketingFlightNumber,
          departureDate: segment.departureDate,
          origin: segment.origin,
          destination: segment.destination
        },
        mappedPassengers
      );
  
      const xmlDoc = new DOMParser().parseFromString(seatMapResult.rawXml, 'application/xml');
      const { availability } = parseSeatMapResponse(xmlDoc);
  
      // ✅ Один setState
      this.setState({
        passengers,
        segments: pnrData.segments,
        flightSegmentInput,
        flight,
        mappedPassengers,
        assignedSeats,
        availability
      });
  
    } catch (error) {
      console.error('❌ Ошибка при инициализации SeatMapsPopover:', error);
    }
  }

  //========================

  render(): React.ReactNode {
    const {
      flight,
      mappedPassengers,
      assignedSeats,
      flightSegmentInput,
      availability
    } = this.state;
  
    // 🛑 Проверка: данные ещё не загружены или загружены некорректно
    const flightIsInvalid =
      !flight ||
      flight.flightNo === '000' ||
      flight.airlineCode === 'XX' ||
      flight.departure === '???' ||
      flight.arrival === '???';
  
    if (
      !flightSegmentInput ||
      mappedPassengers.length === 0 ||
      flightIsInvalid
    ) {
      return (
        <div style={{ padding: '2rem', fontSize: '1.1rem' }}>
          ⏳ Загрузка информации о рейсе и пассажирах...
        </div>
      );
    }
  
    return (
      <div style={{ padding: '20px', minWidth: '600px', backgroundColor: '#fff' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3>✈️ Рейс: {flight.airlineCode}{flight.flightNo}</h3>
          <p><strong>Дата вылета:</strong> {flight.departureDate}</p>
          <p><strong>Маршрут:</strong> {flight.departure} → {flight.arrival}</p>
          <p><strong>Самолёт:</strong> {flight.equipment || 'неизвестен'}</p>
          <p><strong>Класс:</strong> {flight.cabinClass}</p>
          <p><strong>Пассажиры:</strong>{' '}
            {mappedPassengers.map(p => (
              <span key={p.id}>
                {p.givenName} {p.surname}{' '}
                {assignedSeats.find(a => a.passengerId === p.id)
                  ? '🟢' : '🔴 без места'}
                ,{' '}
              </span>
            ))}
          </p>
        </div>
  
        <SeatMapComponentBase
          flightSegments={[flight]}
          config={quicketConfig}
          availability={availability}
          passengers={mappedPassengers}
          assignedSeats={assignedSeats}
          generateFlightData={(segment, index, cabin) =>
            generateFlightData(segment, index)
          }
          initialSegmentIndex={0}
          showSegmentSelector={false}
          cabinClass={flight.cabinClass || 'Y'} // 👈 обязательно передаём
        />
      </div>
    );
  }

}