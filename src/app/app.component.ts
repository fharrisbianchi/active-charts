import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TickerSelectorComponent } from './presentation/components/ticker-selector/ticker-selector.component';
import { StockChartComponent } from './presentation/components/stock-chart/stock-chart.component';
import { CryptoBackgroundComponent } from './shared/components/crypto-background/crypto-background.component';
import { StockDataService } from './application/services/stock-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TickerSelectorComponent, StockChartComponent, CryptoBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CryptoCharts Pro';
  selectedTicker: string = '';
  fullDayMode: boolean = false;

  constructor(private stockDataService: StockDataService) {}

  ngOnInit(): void {
    this.selectedTicker = this.stockDataService.getFirstTicker();
  }

  onTickerSelected(ticker: string): void {
    this.selectedTicker = ticker;
  }

  onViewModeChanged(fullDay: boolean): void {
    this.fullDayMode = fullDay;
  }
}
