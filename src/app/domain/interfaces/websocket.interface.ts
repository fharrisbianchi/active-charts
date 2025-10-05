import { Observable } from 'rxjs';
import { WebSocketMessage } from '../models/stock-data.model';

export interface IWebSocketService {
  connect(url: string): void;
  disconnect(): void;
  getMessages(): Observable<WebSocketMessage>;
  isConnected(): boolean;
}