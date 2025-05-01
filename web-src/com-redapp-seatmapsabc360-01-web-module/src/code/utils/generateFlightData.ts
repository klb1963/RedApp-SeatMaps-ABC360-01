// file: generateFlightData.ts 

export interface FlightSegmentInput {
    marketingAirline?: string;
    flightNumber?: string;
    departureDateTime?: string;
    origin?: string;
    destination?: string;
    cabinClass?: string;
    equipment?: string;
  }
  
  interface FlightData {
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
  
    const result: FlightData = {
      id: String(index).padStart(3, '0'),
      airlineCode: segment.marketingAirline || 'XX',
      flightNo: segment.flightNumber || '000',
      departureDate: segment.departureDateTime?.split('T')[0] || '',
      departure: segment.origin || '???',
      arrival: segment.destination || '???',
      cabinClass: segment.cabinClass || '',
      equipment: segment.equipment || '',
      marketingCarrier: segment.marketingAirline
    };
  
    console.log('📦 [generateFlightData] Сформирован объект FlightData:', result);
  
    return result;
  }