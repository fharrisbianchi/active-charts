import { Observable } from 'rxjs';
import { StockPrice, StockTick, ChartDataPoint } from '../models/stock-data.model';

export interface IStockDataService {
  getHistoricalData(ticker: string): Observable<StockPrice[]>;
  getLiveUpdates(): Observable<StockTick>;
  getChartData(ticker: string): Observable<ChartDataPoint[]>;
  getAllTickers(): string[];
}