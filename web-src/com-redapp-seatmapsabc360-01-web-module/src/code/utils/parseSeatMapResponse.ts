// файл: code/utils/parseSeatMapResponse.ts

/**
 * Интерфейсы данных
 */
interface Seat {
    label: string;
    x: number;
    y: number;
}

interface Row {
    label: string;
    seats: Seat[];
}

interface Deck {
    id: string;
    name: string;
    rows: Row[];
}

interface AvailabilityItem {
    label: string;
    price: number;
    currency: string;
    color: string;
}

/**
 * Определяет цвет места на основе его атрибутов
 */
function getSeatColor(seatEl: Element): string {
    const occupiedInd = seatEl.getAttribute('occupiedInd') === 'true';
    const offerEl = seatEl.querySelector('Offer');

    if (occupiedInd) return 'gray'; // занятое место
    if (offerEl) return 'orange'; // требует доплаты

    return 'lightblue'; // обычное свободное место
}

/**
 * Парсит XML-ответ EnhancedSeatMapRS от Sabre
 */
export function parseSeatMapResponse(xml: Document): {
    layout: { decks: Deck[] };
    availability: AvailabilityItem[];
} {
    const layout: { decks: Deck[] } = {
        decks: [{ id: 'main-deck', name: 'Main Deck', rows: [] }]
    };
    const availability: AvailabilityItem[] = [];

    const rowElements = Array.from(xml.querySelectorAll('Row'));

    rowElements.forEach(rowEl => {
        const rowNumber = rowEl.querySelector('RowNumber')?.textContent?.trim();
        if (!rowNumber) return;

        const row: Row = { label: rowNumber, seats: [] };
        const seatElements = Array.from(rowEl.querySelectorAll('Seat'));

        seatElements.forEach(seatEl => {
            const seatLabel = seatEl.querySelector('Number')?.textContent?.trim();
            if (!seatLabel) return;

            const priceEl = seatEl.querySelector('Offer TotalAmount');
            const price = priceEl ? parseFloat(priceEl.textContent || '0') : 0;
            const currency = priceEl?.getAttribute('currencyCode') || 'USD';

            const color = getSeatColor(seatEl);

            availability.push({
                label: `${rowNumber}${seatLabel}`,
                price,
                currency,
                color
            });

            const seatX = 60 + row.seats.length * 60;
            const seatY = 50 + parseInt(rowNumber) * 30;

            row.seats.push({ label: seatLabel, x: seatX, y: seatY });
        });

        layout.decks[0].rows.push(row);
    });

    layout.decks[0].rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));

    return { layout, availability };
}
