// файл: code/components/SeatMap/getFlightFromSabreData.ts

export const getFlightFromSabreData = (
  data: any,
  segmentIndex: number = 0
) => {
  const segment = data.flightSegments?.[segmentIndex];

  if (!segment) {
    console.warn(`⚠️ Segment index ${segmentIndex} not found`);
    return null;
  }

  console.log('🔍 Исходный сегмент:', segment);

  const airlineCode =
    segment?.MarketingAirline?.EncodeDecodeElement?.Code ||
    segment?.marketingAirline ||
    'XX';

  const flightNo =
    segment?.FlightNumber ||
    segment?.flightNumber ||
    '000';

  const origin =
    segment?.OriginLocation?.EncodeDecodeElement?.Code ||
    segment?.origin ||
    '???';

  const destination =
    segment?.DestinationLocation?.EncodeDecodeElement?.Code ||
    segment?.destination ||
    '???';

  const rawDeparture =
    segment?.departureDate ||
    segment?.departureDateTime || 
    '';

  const departureDate = rawDeparture
    ? new Date(rawDeparture).toISOString().split('T')[0]
    : '';

  if (!departureDate) {
    console.warn('⚠️ Не удалось извлечь дату вылета из:', rawDeparture);
  } else {
    console.log('📅 Извлечена дата вылета:', departureDate);
  }

  const cabinClass = segment?.cabinClass || 'E';

  const equipment =
  segment?.Equipment?.EncodeDecodeElement?.SimplyDecoded ||
  segment?.equipment ||
  '';

  const result = {
    id: '111',
    airlineCode,
    flightNo,
    departureDate,
    departure: origin,
    arrival: destination,
    cabinClass: cabinClass === 'A' ? undefined : cabinClass,
    passengerType: 'ADT',
    equipment
  };

  console.log('✅ [getFlightFromSabreData] Итоговый объект flight:', result);

  return result;
};