import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockDataService } from '../../../application/services/stock-data.service';

@Component({
  selector: 'app-ticker-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticker-selector.component.html',
  styleUrl: './ticker-selector.component.css'
})
export class TickerSelectorComponent implements OnInit, OnDestroy {
  @Output() tickerSelected = new EventEmitter<string>();
  
  tickers: string[] = [];
  selectedTicker: string = '';
  currentPrices: { [ticker: string]: number } = {};
  currentTime: string = '';
  private timeInterval: any;

  constructor(private stockDataService: StockDataService) {}

  ngOnInit(): void {
    this.tickers = this.stockDataService.getAllTickers();
    this.selectedTicker = this.stockDataService.getFirstTicker();
    this.subscribeToLivePrices();
    this.updateCurrentTime();
    this.startTimeUpdater();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  onTickerChange(ticker: string): void {
    this.selectedTicker = ticker;
    this.tickerSelected.emit(ticker);
  }

  private subscribeToLivePrices(): void {
    this.stockDataService.getAllCurrentPrices().subscribe(prices => {
      this.currentPrices = prices;
    });
  }

  private updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private startTimeUpdater(): void {
    this.timeInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  getCurrentPrice(ticker: string): number {
    return this.currentPrices[ticker] || 0;
  }

  getTickerName(ticker: string): string {
    const tickerNames: { [key: string]: string } = {
      'BTC-USD': 'Bitcoin',
      'ETH-USD': 'Ethereum',
      'SOL-USD': 'Solana',
      'ADA-USD': 'Cardano',
      'DOGE-USD': 'Dogecoin',
      'XRP-USD': 'Ripple',
      'MATIC-USD': 'Polygon',
      'AVAX-USD': 'Avalanche',
      'DOT-USD': 'Polkadot',
      'LINK-USD': 'Chainlink',
      'UNI-USD': 'Uniswap',
      'LTC-USD': 'Litecoin'
    };
    return tickerNames[ticker] || ticker;
  }

  // Método eficiente para determinar si un ticker está activo
  isTickerActive(ticker: string): boolean {
    return ticker === this.selectedTicker;
  }

  // Método eficiente para obtener las clases CSS del ticker
  getTickerClasses(ticker: string): { [key: string]: boolean } {
    const isActive = this.isTickerActive(ticker);
    return {
      'text-crypto-green-light': isActive,
      'text-white': !isActive
    };
  }

  // Método eficiente para obtener las clases CSS del precio
  getPriceClasses(ticker: string): { [key: string]: boolean } {
    const isActive = this.isTickerActive(ticker);
    return {
      'text-crypto-green': isActive,
      'text-gray-300': !isActive
    };
  }

  // Método eficiente para obtener las clases CSS del contenedor de la tarjeta
  getCardClasses(ticker: string): { [key: string]: boolean } {
    const isActive = this.isTickerActive(ticker);
    return {
      'border-crypto-green bg-gradient-to-br from-crypto-green/30 to-crypto-green-dark/30 shadow-crypto-green/50 ring-4 ring-crypto-green/30': isActive,
      'border-gray-600/60 bg-gradient-to-br from-gray-800/40 to-gray-900/40 hover:shadow-gray-400/30 hover:border-gray-500 hover:from-gray-700/50 hover:to-gray-800/50 active:border-gray-400 focus:ring-gray-400/50': !isActive
    };
  }

  // Método eficiente para obtener las clases CSS del nombre de la criptomoneda
  getNameClasses(ticker: string): { [key: string]: boolean } {
    const isActive = this.isTickerActive(ticker);
    return {
      'text-crypto-green-light': isActive,
      'text-gray-300': !isActive
    };
  }
}
