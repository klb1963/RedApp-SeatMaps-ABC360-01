// файл: code/utils/mapCabinToCode.ts

export function mapCabinToCode(cabin: string): string {
    switch (cabin) {
        case 'Economy': return 'Y';
        case 'PremiumEconomy': return 'S';
        case 'Business': return 'C';
        case 'First': return 'F';
        default: return 'A'; // A = All cabins
    }
}