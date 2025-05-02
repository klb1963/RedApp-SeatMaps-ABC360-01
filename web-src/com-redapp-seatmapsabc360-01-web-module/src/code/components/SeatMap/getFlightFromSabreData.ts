// файл: getFlightFromSabreData.ts

const equipmentNames: { [code: string]: string } = {
  '388': 'Airbus A380',
  '77W': 'Boeing 777-300ER',
  '789': 'Boeing 787-9 Dreamliner',
  '320': 'Airbus A320',
  '321': 'Airbus A321',
  '738': 'Boeing 737-800',
  '319': 'Airbus A319',
  '744': 'Boeing 747-400',
  '359': 'Airbus A350-900',
  'E90': 'Embraer 190',
};

export const getFlightFromSabreData = (
  data: any,
  segmentIndex: number = 0,
  cabinClass: string = ''
) => {
  const segment = data.flightSegments?.[segmentIndex];

  if (!segment) {
    console.warn(`⚠️ Segment index ${segmentIndex} not found`);
    return {
      id: '001',
      airlineCode: '',
      flightNo: '',
      departureDate: '',
      departure: '',
      arrival: '',
      cabinClass,
      equipment: ''
    };
  }

  const departureDateTime = segment.DepartureDateTime;
  const airlineCode = segment?.MarketingAirline?.EncodeDecodeElement?.Code || segment?.MarketingAirline || '';
  const flightNo = segment?.FlightNumber || '';
  const origin = segment?.OriginLocation?.EncodeDecodeElement?.Code || segment?.OriginLocation || '';
  const destination = segment?.DestinationLocation?.EncodeDecodeElement?.Code || segment?.DestinationLocation || '';
  const equipmentCode = segment?.Equipment?.EncodeDecodeElement?.Code || '';

  // 📌 Логи для отладки
  console.log('✈️ airlineCode:', airlineCode);
  console.log('🔢 flightNo:', flightNo);
  console.log('📅 departureDateTime:', departureDateTime);
  console.log('🌍 departure:', origin);
  console.log('🌍 arrival:', destination);
  console.log('🛫 equipmentCode:', equipmentCode);
  console.log('💺 cabinClass:', cabinClass);

  const departureDate = departureDateTime?.split('T')[0] || '';

  return {
    id: '001',
    airlineCode,
    flightNo,
    departureDate,
    departure: origin,
    arrival: destination,
    cabinClass: cabinClass === 'A' ? undefined : cabinClass, // "A" — это all cabins → не отправляем
    equipment: equipmentCode // ⬅️ используем код, не человекочитаемое имя
  };
};