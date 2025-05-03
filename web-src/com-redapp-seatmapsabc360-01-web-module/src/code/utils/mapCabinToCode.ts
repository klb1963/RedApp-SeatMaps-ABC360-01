// файл: code/utils/mapCabinToCode.ts

/**
 * Маппинг из Sabre bookingClass в SeatMap код
 * E – Economy, P – Premium, B – Business, F – First, A – All cabins
 */

export function mapCabinToCode(bookingClass: string): 'E' | 'P' | 'B' | 'F' | 'A' {
    // Явно пропускаем "All cabins"
    if (bookingClass === 'A') return 'A';
  
    const economy = ['Y', 'H', 'K', 'M', 'L', 'T', 'E', 'U', 'V', 'N'];
    const premiumEconomy = ['W', 'S'];
    const business = ['J', 'C', 'D', 'Z', 'P', 'I'];
    const first = ['F'];
  
    if (first.includes(bookingClass)) return 'F';
    if (business.includes(bookingClass)) return 'B';
    if (premiumEconomy.includes(bookingClass)) return 'P';
    return 'E'; // По умолчанию — Economy
  }
  
  /**
   * Преобразование из значения UI (человеческие подписи) в код библиотеки
   */
  export function uiCabinLabelToSeatMapCode(cabin: string): 'E' | 'P' | 'B' | 'F' | 'A' {
    switch (cabin) {
      case 'Economy':
        return 'E';
      case 'PremiumEconomy':
        return 'P';
      case 'Business':
        return 'B';
      case 'First':
        return 'F';
      default:
        return 'A'; // All cabins
    }
  }
  
  /**
   * Безопасный вариант — используется, если библиотека не принимает "A"
   * и нужно заменить его на E (Economy)
   */
  export function mapCabinToCodeSafe(bookingClass: string): 'E' | 'P' | 'B' | 'F' {
    const result = mapCabinToCode(bookingClass);
    return result === 'A' ? 'E' : result;
  }