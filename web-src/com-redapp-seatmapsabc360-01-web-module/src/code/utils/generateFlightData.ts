// file: generateFlightData.ts 

import { mapCabinToCode } from '../utils/mapCabinToCode';

// Тип входных данных для сегмента рейса
export interface FlightSegmentInput {
  marketingAirline?: string;
  marketingCarrier?: string;
  flightNumber?: string;
  marketingFlightNumber?: string;
  departureDateTime?: string;
  departureDate?: string;
  origin?: string;
  departure?: string;
  destination?: string;
  arrival?: string;
  cabinClass?: string;
  equipment?: string;
}

export interface FlightData {
  id: string;
  airlineCode: string;
  flightNo: string;
  departureDate: string;
  departure: string;
  arrival: string;
  cabinClass: string;
  equipment: string;
  marketingCarrier?: string;
}

export function generateFlightData(segment: FlightSegmentInput, index: number): FlightData {
  console.log(`🛰️ [generateFlightData] Вызов для сегмента #${index}:`, segment);
  console.count('🎯 generateFlightData called');

  const airlineCode = segment.marketingAirline || segment.marketingCarrier || 'XX';
  const flightNo = segment.flightNumber || segment.marketingFlightNumber || '000';
  const rawDate = segment.departureDateTime || segment.departureDate || '';
  const departureDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;

  const departure = segment.origin || segment.departure || '???';
  const arrival = segment.destination || segment.arrival || '???';

  const result: FlightData = {
    id: String(index).padStart(3, '0'),
    airlineCode,
    flightNo,
    departureDate,
    departure,
    arrival,
    cabinClass: mapCabinToCode(segment.cabinClass || 'Y'),
    equipment: segment.equipment || '',
    marketingCarrier: airlineCode
  };

  console.log('📦 [generateFlightData] Сформирован объект FlightData:', result);

  return result;
}