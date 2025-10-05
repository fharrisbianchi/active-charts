import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { StockData, WebSocketMessage } from '../../domain/models/stock-data.model';
import { WebSocketService } from '../../infrastructure/services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class StockDataService {
  private currentPricesSubject = new BehaviorSubject<{ [ticker: string]: number }>({});
  private tickers = [
    'BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD',
    'DOGE-USD', 'XRP-USD', 'MATIC-USD', 'AVAX-USD',
    'DOT-USD', 'LINK-USD', 'UNI-USD', 'LTC-USD'
  ];
  
  // Cache para datos generados
  private dataCache = new Map<string, { data: StockData, timestamp: number }>();
  private fullDayCache = new Map<string, { data: StockData, timestamp: number }>();
  private readonly CACHE_DURATION = 5000; // 5 segundos para vista actual (actualización cada 5 seg)
  private readonly FULL_DAY_CACHE_DURATION = 9000; // 9 segundos para vista completa

  constructor(private webSocketService: WebSocketService) {
    this.connectToWebSocket();
  }

  getAllTickers(): string[] {
    return this.tickers;
  }

  getFirstTicker(): string {
    return this.tickers.length > 0 ? this.tickers[0] : '';
  }

  getAllCurrentPrices(): Observable<{ [ticker: string]: number }> {
    return this.currentPricesSubject.asObservable();
  }

  getStockData(ticker: string): Observable<StockData> {
    const cached = this.dataCache.get(ticker);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('Returning cached current data for', ticker);
      return of(cached.data);
    }

    const currentPrices = this.currentPricesSubject.value;
    let basePrice = currentPrices[ticker];

    // Si no hay precio del WebSocket, usar un precio base por defecto
    if (!basePrice) {
      console.log('No WebSocket data for', ticker, '- using default base price');
      const defaultPrices: { [key: string]: number } = {
        'BTC-USD': 45000,
        'ETH-USD': 3000,
        'SOL-USD': 100,
        'ADA-USD': 0.5,
        'DOGE-USD': 0.08,
        'XRP-USD': 0.6,
        'MATIC-USD': 1.2,
        'AVAX-USD': 35,
        'DOT-USD': 7,
        'LINK-USD': 15,
        'UNI-USD': 8,
        'LTC-USD': 150
      };
      basePrice = defaultPrices[ticker] || 100;
    }

    const labels: string[] = [];
    const prices: number[] = [];
    const now_date = new Date();
    // Cambiar a 3 horas como solicitó el usuario
    const startTime = new Date(now_date.getTime() - 3 * 60 * 60 * 1000);

    // Generar más puntos para 3 horas (cada 5 minutos = 36 puntos)
    for (let i = 0; i <= 36; i++) {
      const timePoint = new Date(startTime.getTime() + i * 5 * 60 * 1000);

      labels.push(timePoint.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }));

      const variation = (Math.random() - 0.5) * 0.008;
      prices.push(basePrice * (1 + variation));
    }

    const data = { labels, prices };
    this.dataCache.set(ticker, { data, timestamp: now });
    console.log('Generated and cached new current data for', ticker);

    return of(data);
  }

  getFullDayData(ticker: string): Observable<StockData | null> {
    const cached = this.fullDayCache.get(ticker);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.FULL_DAY_CACHE_DURATION) {
      console.log('Returning cached full day data for', ticker);
      return of(cached.data);
    }

    const currentPrices = this.currentPricesSubject.value;
    let basePrice = currentPrices[ticker];

    // Si no hay precio del WebSocket, usar un precio base por defecto
    if (!basePrice) {
      console.log('No WebSocket data for full day', ticker, '- using default base price');
      const defaultPrices: { [key: string]: number } = {
        'BTC-USD': 45000,
        'ETH-USD': 3000,
        'SOL-USD': 100,
        'ADA-USD': 0.5,
        'DOGE-USD': 0.08,
        'XRP-USD': 0.6,
        'MATIC-USD': 1.2,
        'AVAX-USD': 35,
        'DOT-USD': 7,
        'LINK-USD': 15,
        'UNI-USD': 8,
        'LTC-USD': 150
      };
      basePrice = defaultPrices[ticker] || 100;
    }

    const labels: string[] = [];
    const prices: number[] = [];
    const now_date = new Date();
    const startOfDay = new Date(now_date);
    startOfDay.setHours(9, 0, 0, 0); // Mercado abre a las 9:00 AM

    const currentTime = now_date.getTime();
    const startTime = startOfDay.getTime();
    const intervalMinutes = 15; // Intervalos de 15 minutos para mejor resolución

    const timePoints: number[] = [];
    
    // Generar puntos desde las 9:00 AM hasta la hora actual
    for (let time = startTime; time <= currentTime; time += intervalMinutes * 60 * 1000) {
      timePoints.push(time);
    }

    // Asegurar que tenemos al menos 12 puntos de datos (3 horas de trading)
    const minDataPoints = 12;
    if (timePoints.length < minDataPoints) {
      const additionalPoints = minDataPoints - timePoints.length;
      const baseTime = timePoints.length > 0 ? timePoints[timePoints.length - 1] : startTime;

      for (let i = 1; i <= additionalPoints; i++) {
        timePoints.push(baseTime + i * intervalMinutes * 60 * 1000);
      }
    }

    // Generar datos más realistas para el día completo
    timePoints.forEach((time, index) => {
      const timePoint = new Date(time);

      labels.push(timePoint.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }));

      // Crear variación más realista durante el día
      const hoursFromStart = (time - startTime) / (1000 * 60 * 60);
      
      // Tendencia general del día (puede subir o bajar)
      const dailyTrend = Math.sin(hoursFromStart * Math.PI / 8) * 0.03;
      
      // Volatilidad intradiaria
      const volatility = (Math.random() - 0.5) * 0.02;
      
      // Patrón de volumen (más actividad al inicio y final del día)
      const volumePattern = Math.sin(hoursFromStart * Math.PI / 6) * 0.01;
      
      // Precio base con todas las variaciones
      const priceVariation = dailyTrend + volatility + volumePattern;
      const finalPrice = basePrice * (1 + priceVariation);
      
      prices.push(Math.max(finalPrice, basePrice * 0.95)); // Evitar caídas extremas
    });

    const data = { labels, prices };
    this.fullDayCache.set(ticker, { data, timestamp: now });
    console.log('Generated and cached new full day data for', ticker, 'with', timePoints.length, 'points');

    return of(data);
  }

  updateCurrentPrice(ticker: string, price: number): void {
    const currentPrices = this.currentPricesSubject.value;
    currentPrices[ticker] = price;
    this.currentPricesSubject.next(currentPrices);
  }

  private connectToWebSocket(): void {
    this.webSocketService.connect('ws://localhost:8081');
    this.webSocketService.getMessages().subscribe((message: WebSocketMessage) => {
      if (message.type === 'tick') {
        this.updateCurrentPrice(message.ticker, parseFloat(message.price));
      }
    });
  }
}
