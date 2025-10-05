export interface StockPrice {
  timestamp: string;
  price: number;
  volume: number;
}

export interface StockTick {
  type: 'tick';
  ticker: string;
  price: string; // El precio viene como string desde el WebSocket
  ts: number;
}

export interface StockHistory {
  type: 'history';
  range: string;
  data: { [ticker: string]: StockPrice[] };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
}

export interface StockData {
  labels: string[];
  prices: number[];
}

export type WebSocketMessage = StockTick | StockHistory;