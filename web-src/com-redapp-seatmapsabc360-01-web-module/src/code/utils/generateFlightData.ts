// file: generateFlightData.ts 

import { mapCabinToCode } from '../utils/mapCabinToCode';

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
  equipment?: string | {
    EncodeDecodeElement?: {
      Code?: string;
      FullyDecoded?: string;
      SimplyDecoded?: string;
    };
  };
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

export function generateFlightData(segment: FlightSegmentInput, index: number, cabinClassOverride?: string): FlightData {

  console.log('[📥 Incoming segment]', segment);

  const airlineCode = segment.marketingAirline || segment.marketingCarrier || 'XX';
  const flightNoRaw = segment.flightNumber || segment.marketingFlightNumber || '000';
  const flightNo = flightNoRaw.replace(/^0+/, '') || '000'; // удаляем лидирующие нули
  const rawDate = segment.departureDateTime || segment.departureDate || '';
  const departureDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  const departure = segment.origin || segment.departure || '???';
  const arrival = segment.destination || segment.arrival || '???';

  const rawEquipment =
    typeof segment.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded || ''
      : segment.equipment || '';

  const cabinClass = cabinClassOverride || segment.cabinClass || 'Y';
  const mappedCabin = mapCabinToCode(cabinClass);

  const result: FlightData = {
    id: String(index).padStart(3, '0'),
    airlineCode,
    flightNo,
    departureDate,
    departure,
    arrival,
    cabinClass: mappedCabin,
    equipment: rawEquipment,
    marketingCarrier: airlineCode
  };

  console.log('[✅ FlightData Ready]', result);
  
  return result;
}