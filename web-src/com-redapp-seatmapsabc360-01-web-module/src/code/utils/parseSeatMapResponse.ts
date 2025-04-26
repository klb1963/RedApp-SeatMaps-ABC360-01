// файл: parseSeatMapResponse.ts

export function parseSeatMapResponse(xml: Document): {
    layout: { decks: any[] };
    availability: any[];
  } {
    const layout = {
      decks: [
        {
          id: 'main-deck',
          name: 'Main Deck',
          rows: [] as any[]
        }
      ]
    };
  
    const availability: any[] = [];
  
    const seatElements = Array.from(xml.getElementsByTagName('Seat'));
  
    seatElements.forEach(seat => {
      const rowLabel = seat.getAttribute('row');
      const seatLabel = seat.getAttribute('seat');
  
      if (!rowLabel || !seatLabel) return;
  
      const available = seat.getAttribute('availableInd') === 'true';
      const premium = seat.getAttribute('premiumInd') === 'true';
      const chargeable = seat.getAttribute('chargeableInd') === 'true';
  
      const fullLabel = `${rowLabel}${seatLabel}`;
  
      // Вычисляем цвет
      const color = !available
        ? 'gray'
        : premium
        ? 'gold'
        : chargeable
        ? 'orange'
        : 'lightblue';
  
      // Добавляем в availability
      availability.push({
        label: fullLabel,
        price: chargeable ? 30 : 0,
        currency: 'USD',
        color
      });
  
      // Ищем или создаём строку layout
      let row = layout.decks[0].rows.find(r => r.label === rowLabel);
      if (!row) {
        row = { label: rowLabel, seats: [] };
        layout.decks[0].rows.push(row);
      }
  
      // Координаты для seat (примитивные, по сетке)
      const seatX = 60 + row.seats.length * 60;
      const seatY = 50 + parseInt(rowLabel || '1') * 30;
  
      row.seats.push({
        label: seatLabel,
        x: seatX,
        y: seatY
      });
    });
  
    // Сортировка рядов по номеру
    layout.decks[0].rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));
  
    return { layout, availability };
  }