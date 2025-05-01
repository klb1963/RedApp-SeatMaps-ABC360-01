// file: generateFlightData.ts 

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
  
  // Тип итогового объекта, который передается в карту салона
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
  
    const airlineCode = segment.marketingAirline || (segment as any).marketingCarrier || 'XX';
    const flightNo = segment.flightNumber || (segment as any).marketingFlightNumber || '000';
    const rawDateTime = segment.departureDateTime || (segment as any).departureDate || '';
    const departureDate = rawDateTime.includes('T') ? rawDateTime.split('T')[0] : rawDateTime;
  
    const result: FlightData = {
      id: String(index).padStart(3, '0'),
      airlineCode,
      flightNo,
      departureDate,
      departure: segment.origin || (segment as any).departure || '???',
      arrival: segment.destination || (segment as any).arrival || '???',
      cabinClass: segment.cabinClass || 'Y',
      equipment: segment.equipment || '',
      marketingCarrier: airlineCode
    };
  
    console.log('📦 [generateFlightData] Сформирован объект FlightData:', result);
  
    return result;
  }