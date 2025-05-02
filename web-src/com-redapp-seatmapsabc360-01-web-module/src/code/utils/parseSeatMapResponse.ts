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
  
  function getSeatColor(seatEl: Element): string {
    const isOccupied = seatEl.getAttribute('occupiedInd') === 'true';
    const hasOffer = seatEl.querySelector('Offer');
    if (isOccupied) return 'gray';
    if (hasOffer) return 'orange';
    return 'lightblue';
  }
  
  export function parseSeatMapResponse(xml: Document): {
    layout: { decks: Deck[] };
    availability: AvailabilityItem[];
  } {
    const layout: { decks: Deck[] } = {
      decks: [{ id: 'main-deck', name: 'Main Deck', rows: [] }]
    };
    const availability: AvailabilityItem[] = [];
  
    const rowElements = Array.from(xml.querySelectorAll('Row'));
  
    rowElements.forEach((rowEl, rowIndex) => {
      const rowNumber = rowEl.querySelector('RowNumber')?.textContent?.trim() || '';
      if (!/^\d+$/.test(rowNumber)) return;
  
      const row: Row = { label: rowNumber, seats: [] };
      const seatElements = Array.from(rowEl.querySelectorAll('Seat'));
  
      seatElements.forEach((seatEl, seatIndex) => {
        const seatLabel = seatEl.querySelector('Number')?.textContent?.trim();
        if (!seatLabel) return;
  
        const offerEl = seatEl.querySelector('Offer TotalAmount');
        const price = offerEl ? parseFloat(offerEl.textContent || '0') : 0;
        const currency = offerEl?.getAttribute('currencyCode') || 'USD';
        const color = getSeatColor(seatEl);
  
        availability.push({
          label: `${rowNumber}${seatLabel}`,
          price,
          currency,
          color
        });
  
        row.seats.push({
          label: seatLabel,
          x: 60 + seatIndex * 60,
          y: 50 + rowIndex * 40
        });
      });
  
      layout.decks[0].rows.push(row);
    });
  
    layout.decks[0].rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));
  
    return { layout, availability };
  }