import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IWebSocketService } from '../../domain/interfaces/websocket.interface';
import { WebSocketMessage } from '../../domain/models/stock-data.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements IWebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<WebSocketMessage>();
  private connectionStatus = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  connect(url: string): void {
    // Solo ejecutar en el navegador, no en el servidor
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // Desconectar socket anterior si existe
    if (this.socket) {
      this.socket.close();
    }

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus.next(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket mensaje recibido:', message); // Debug log
          this.messagesSubject.next(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionStatus.next(false);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.next(false);
        // Intentar reconectar después de un error
        setTimeout(() => {
          if (!this.isConnected()) {
            console.log('Attempting to reconnect WebSocket...');
            this.connect(url);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatus.next(false);
    }
  }

  disconnect(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectionStatus.next(false);
    }
  }

  getMessages(): Observable<WebSocketMessage> {
    return this.messagesSubject.asObservable();
  }

  isConnected(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return this.socket?.readyState === WebSocket.OPEN || false;
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}