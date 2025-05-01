// файл: code/utils/mapCabinToCode.ts

// UI → SeatMap код
export function mapCabinToCode(cabin: string): string {
    switch (cabin) {
        case 'Economy': return 'Y';
        case 'PremiumEconomy': return 'S';
        case 'Business': return 'C';
        case 'First': return 'F';
        default: return 'A'; // A = All cabins
    }
}

// Sabre bookingClass → SeatMap код
export function bookingClassToCabinCode(bookingClass: string): 'Y' | 'S' | 'C' | 'F' {
    const economy = ['Y', 'H', 'K', 'M', 'L', 'T', 'E', 'U', 'V', 'N'];
    const premiumEconomy = ['W', 'S'];
    const business = ['J', 'C', 'D', 'Z', 'P', 'I'];
    const first = ['F', 'A'];

    if (first.includes(bookingClass)) return 'F';
    if (business.includes(bookingClass)) return 'C';
    if (premiumEconomy.includes(bookingClass)) return 'S';
    return 'Y'; // по умолчанию
}