// file: SeatMapAvailTile.tsx

import * as React from 'react';
import { PublicAirAvailabilityData } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityData';

export const SeatMapAvailTile = (data: PublicAirAvailabilityData): React.ReactElement => {

    console.log('🧩 [SeatMapAvailTile] Полученные данные:', data);
        
    return (
        <div className={'sdk-seatmap-custom-tile-content'} style={{ padding: '10px' }}> 
            
            <ol>
                {data.flightSegments.map((segment, index) => (
                    <li key={index}>
                        Flight {segment.MarketingAirline.FlightNumber}
                    </li>  
                ))}
            </ol>

            {/* Добавляем (рисуем) кнопку*/}
            <button 
                className="abc-seatmap-button"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 10px',
                    backgroundColor: '#2f73bc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    height: '24px',
                    marginBottom: '10px',
                    marginLeft: '25px'
                }}
            >
                SeatMaps ABC 360
            </button>

        </div>
    );
};