// файл: code/utils/parseSeatMapResponse.ts

/**
 * Парсит XML-ответ EnhancedSeatMapRS от Sabre.
 * 
 * Извлекает:
 * - layout: расположение рядов и мест (для отрисовки карты салона)
 * - availability: доступность и цену мест (для отображения состояния мест)
 * 
 * @param xml - XML-документ, полученный в ответ от EnhancedSeatMapRQ
 * @returns layout (карта салона) и availability (информация о местах)
 */
export function parseSeatMapResponse(xml: Document): {
    layout: { decks: any[] };
    availability: any[];
} {
    // --- Инициализация пустой карты салона (layout) ---
    const layout = {
        decks: [
            {
                id: 'main-deck',
                name: 'Main Deck', // Пока поддерживаем только один дек
                rows: [] as any[]
            }
        ]
    };

    // --- Инициализация списка доступных мест ---
    const availability: any[] = [];

    // --- Ищем все строки <Row> ---
    const rowElements = Array.from(xml.getElementsByTagName('Row'));

    rowElements.forEach(rowEl => {
        const rowNumber = rowEl.getElementsByTagName('RowNumber')[0]?.textContent?.trim();
        if (!rowNumber) return; // Если нет номера ряда — пропускаем

        const seatElements = Array.from(rowEl.getElementsByTagName('Seat'));

        // --- Создаем объект для строки ---
        let row = {
            label: rowNumber,
            seats: [] as any[]
        };

        seatElements.forEach(seatEl => {
            const seatLabel = seatEl.getElementsByTagName('Number')[0]?.textContent?.trim();
            if (!seatLabel) return; // Если нет номера места — пропускаем

            // --- Проверка занятости места ---
            const occupiedInd = seatEl.getAttribute('occupiedInd') === 'true';

            // --- Проверка предложения покупки места ---
            const offerEl = seatEl.getElementsByTagName('Offer')[0];
            const priceEl = offerEl?.getElementsByTagName('TotalAmount')[0];

            // --- Инициализация цены и валюты ---
            let price = 0;
            let currency = 'USD';
            if (priceEl) {
                price = parseFloat(priceEl.textContent || '0');
                currency = priceEl.getAttribute('currencyCode') || 'USD';
            }

            // --- Определяем цвет места ---
            let color = 'lightblue'; // по умолчанию: обычное свободное место

            if (occupiedInd) {
                color = 'gray'; // занятое место
            } else if (offerEl) {
                color = 'orange'; // свободное, но требует доплаты
            }

            // --- Добавляем информацию о месте в availability ---
            availability.push({
                label: `${rowNumber}${seatLabel}`, // например: 12A
                price,
                currency,
                color
            });

            // --- Координаты места (упрощенно, сетка) ---
            const seatX = 60 + row.seats.length * 60; // x зависит от позиции в ряду
            const seatY = 50 + parseInt(rowNumber || '1') * 30; // y зависит от номера ряда

            // --- Добавляем место в текущий ряд ---
            row.seats.push({
                label: seatLabel,
                x: seatX,
                y: seatY
            });
        });

        // --- Добавляем ряд в дек ---
        layout.decks[0].rows.push(row);
    });

    // --- Сортировка рядов по возрастанию номера ---
    layout.decks[0].rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));

    // --- Возвращаем финальную структуру ---
    return { layout, availability };
}