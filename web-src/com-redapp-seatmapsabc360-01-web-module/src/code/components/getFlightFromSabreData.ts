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
  // можно потом дополнить по мере необходимости
};

export const getFlightFromSabreData = (data: any, segmentIndex: number = 0) => {
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
      cabinClass: '',
      equipment: ''
    };
  }

  console.log('📌 [getFlightFromSabreData] Полные данные сегмента:', JSON.stringify(segment, null, 2));

  const departureDateTime = segment.DepartureDateTime;

  const equipmentCode = segment.Equipment?.EncodeDecodeElement?.Code || '';
  const equipmentName = equipmentNames[equipmentCode] || equipmentCode; // Человекочитаемое название или код

  if (!departureDateTime) {
    console.warn('⚠️ [getFlightFromSabreData] DepartureDateTime отсутствует в данных сегмента!');
    return {
      id: '001',
      airlineCode: segment.MarketingAirline?.EncodeDecodeElement?.Code || '',
      flightNo: segment.FlightNumber || '',
      departureDate: '',
      departure: segment.OriginLocation?.EncodeDecodeElement?.Code || '',
      arrival: segment.DestinationLocation?.EncodeDecodeElement?.Code || '',
      cabinClass: '',
      equipment: equipmentName
    };
  }

  const departureDate = departureDateTime.split('T')[0]; // Оставляем только дату

  return {
    id: '001',
    airlineCode: segment.MarketingAirline?.EncodeDecodeElement?.Code,
    flightNo: segment.FlightNumber,
    departureDate,
    departure: segment.OriginLocation?.EncodeDecodeElement?.Code,
    arrival: segment.DestinationLocation?.EncodeDecodeElement?.Code,
    cabinClass: '',
    equipment: equipmentName
  };
};