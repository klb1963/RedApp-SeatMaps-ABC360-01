// файл: code/components/loadPnrDetailsFromSabre.ts

/**
 * Загружает полные данные о текущем бронировании (PNR) из Sabre.
 * 
 * @param onDataLoaded Колбэк, который вызывается после успешной загрузки данных о PNR и получения исходного XML.
 */

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { parsePnrData, PnrData } from '../utils/parcePnrData';

// Основная функция загрузки данных PNR
export const loadPnrDetailsFromSabre = async (onDataLoaded: (data: PnrData, rawXml: string) => void): Promise<void> => {
    try {
        // Сервисы Sabre
        const pnrService = getService(PnrPublicService); // для получения локатора брони (Record Locator)
        const soapApiService = getService(ISoapApiService); // для отправки SOAP-запросов

        // Получаем текущий локатор PNR (код брони, например: ABC123)
        const recordLocator = pnrService.getRecordLocator();

        if (!recordLocator) {
            console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
            return; // Если брони нет — ничего не делаем
        }

        console.log('📄 Record Locator:', recordLocator);

        // Формируем тело SOAP-запроса
        const soapPayload = `
            <ns6:GetReservationRQ xmlns:ns6="http://webservices.sabre.com/pnrbuilder/v1_19" Version="1.19.22">
                <ns6:RequestType>Stateful</ns6:RequestType> <!-- Работает с активным PNR в сессии -->
                <ns6:ReturnOptions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns6:ReturnOptions" UnmaskCreditCard="false" ShowTicketStatus="true">
                    <ns6:ViewName>Full</ns6:ViewName>      <!-- Просим все доступные данные о бронировании -->
                    <ns6:ResponseFormat>STL</ns6:ResponseFormat> <!-- Ответ будет в формате STL (Structured Text Language) -->
                </ns6:ReturnOptions>
            </ns6:GetReservationRQ>
        `;

        // Отправляем запрос в Sabre через ISoapApiService
        const response = await soapApiService.callSws({
            action: 'GetReservationRQ', // Название действия
            payload: soapPayload,       // SOAP-тело
            authTokenType: 'SESSION'     // Используем текущую сессию агента
        });

        // Парсим ответ с помощью нашего парсера parsePnrData
        const parsedData = parsePnrData(response.getParsedValue());

        // Сохраняем исходный XML (может понадобиться для логов/отладки)
        const rawXml = response.value;

        console.log('🧩 Parsed PNR Data:', JSON.stringify(parsedData, null, 2));

        // Вызываем переданный колбэк с распарсенными данными и XML
        onDataLoaded(parsedData, rawXml);

    } catch (error) {
        console.error('❌ Error calling GetReservationRQ via ISoapApiService:', error);
    }
};