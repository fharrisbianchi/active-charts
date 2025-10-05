import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { StockDataService } from '../../../application/services/stock-data.service';
import { WebSocketService } from '../../../infrastructure/services/websocket.service';
import { WebSocketMessage } from '../../../domain/models/stock-data.model';
import { Subscription, interval } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-chart.component.html',
  styleUrl: './stock-chart.component.css'
})
export class StockChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ticker: string = '';
  @Input() fullDayMode: boolean = false;
  @Output() viewModeChanged = new EventEmitter<boolean>();
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private subscription: Subscription | null = null;
  private updateInterval: Subscription | null = null;
  private liveUpdateTimer: any = null; // Timer para actualizaciones cada 5 segundos

  // Propiedades para mostrar información del precio
  currentPrice: number = 0;
  priceChange: number = 0;
  priceChangePercent: number = 0;
  isLoading: boolean = false;
  isPriceLoading: boolean = true; // Nueva propiedad para loading del precio
  isChartLoading: boolean = false; // Nueva propiedad para loading del gráfico
  private openingPrice: number = 0;

  // Cache para optimizar renders
  private cachedData: { labels: string[], prices: number[] } | null = null;
  private lastUpdateTime: number = 0;
  private lastLivePriceUpdate: number = 0;
  private readonly MIN_UPDATE_INTERVAL = 1000; // Mínimo 1 segundo entre updates

  constructor(
    private stockDataService: StockDataService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.initChart();
    this.subscribeToData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
    if (this.liveUpdateTimer) {
      clearInterval(this.liveUpdateTimer);
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticker'] && !changes['ticker'].firstChange) {
      this.resetChart();
      this.subscribeToData();
    }

    if (changes['fullDayMode'] && !changes['fullDayMode'].firstChange) {
      this.resetChart();
      this.subscribeToData();
    }
  }

  private initChart(): void {
    if (!this.chartCanvas) {
      console.warn('Canvas element not found');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('Could not get 2D context');
      return;
    }

    // Crear gradiente dinámico para el fondo
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)'); // Verde transparente arriba
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)'); // Azul en el medio
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)'); // Rojo transparente abajo

    // Gradiente para el borde principal
    const borderGradient = ctx.createLinearGradient(0, 0, 0, 400);
    borderGradient.addColorStop(0, 'rgb(34, 197, 94)'); // Verde arriba
    borderGradient.addColorStop(0.5, 'rgb(59, 130, 246)'); // Azul en el medio
    borderGradient.addColorStop(1, 'rgb(239, 68, 68)'); // Rojo abajo

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: `${this.ticker} Precio`,
          data: [],
          borderColor: borderGradient,
          backgroundColor: gradient,
          borderWidth: 4,
          pointBackgroundColor: (ctx: any) => {
            // Color dinámico de puntos basado en la posición
            const dataIndex = ctx.dataIndex;
            const data = ctx.dataset.data;
            if (dataIndex === 0) return 'rgb(59, 130, 246)';
            
            const current = data[dataIndex];
            const previous = data[dataIndex - 1];
            
            if (current > previous) return 'rgb(34, 197, 94)'; // Verde para subida
            if (current < previous) return 'rgb(239, 68, 68)'; // Rojo para bajada
            return 'rgb(59, 130, 246)'; // Azul para sin cambio
          },
          pointBorderColor: 'white',
          pointBorderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 4,
          fill: true,
          tension: 0.4,
          segment: {
            borderColor: (ctx: any) => {
              // Color dinámico del segmento basado en la tendencia
              const prev = ctx.p0.parsed.y;
              const curr = ctx.p1.parsed.y;
              
              if (curr > prev) {
                // Tendencia alcista - gradiente verde a verde claro
                return 'rgb(34, 197, 94)';
              } else if (curr < prev) {
                // Tendencia bajista - gradiente rojo a rojo claro
                return 'rgb(239, 68, 68)';
              } else {
                // Sin cambio - azul
                return 'rgb(59, 130, 246)';
              }
            },
            backgroundColor: (ctx: any) => {
              const prev = ctx.p0.parsed.y;
              const curr = ctx.p1.parsed.y;
              
              if (curr > prev) {
                return 'rgba(34, 197, 94, 0.1)';
              } else if (curr < prev) {
                return 'rgba(239, 68, 68, 0.1)';
              } else {
                return 'rgba(59, 130, 246, 0.1)';
              }
            }
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutCubic',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 30;
            }
            return delay;
          }
        },
        transitions: {
          active: {
            animation: {
              duration: 600,
              easing: 'easeOutQuart'
            }
          },
          resize: {
            animation: {
              duration: 0
            }
          },
          show: {
            animations: {
              x: {
                from: 0
              },
              y: {
                from: 0
              }
            }
          },
          hide: {
            animations: {
              x: {
                to: 0
              },
              y: {
                to: 0
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `${this.ticker} Precio de Criptomoneda ${this.fullDayMode ? '- Todo el Día' : '- Vista Actual'}`,
            font: {
              size: 18,
              weight: 'bold'
            },
            color: 'white'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff', // Blanco puro para la leyenda
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20,
              usePointStyle: true,
              generateLabels: (chart: any) => {
                return [{
                  text: `${this.ticker} Precio`,
                  fillStyle: 'rgba(255, 255, 255, 0.9)', // Fondo blanco semitransparente
                  strokeStyle: '#ffffff', // Borde blanco
                  lineWidth: 3,
                  pointStyle: 'circle',
                  fontColor: '#ffffff' // Color de fuente blanco
                }];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: (context: any) => {
              const dataIndex = context.tooltip.dataPoints[0]?.dataIndex;
              const data = context.tooltip.dataPoints[0]?.dataset.data;
              
              if (dataIndex > 0) {
                const current = data[dataIndex];
                const previous = data[dataIndex - 1];
                
                if (current > previous) return 'rgb(34, 197, 94)';
                if (current < previous) return 'rgb(239, 68, 68)';
              }
              return 'rgb(59, 130, 246)';
            },
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                const value = Number(context.parsed.y).toFixed(2);
                const dataIndex = context.dataIndex;
                const data = context.dataset.data;
                
                let trend = '';
                if (dataIndex > 0) {
                  const current = data[dataIndex];
                  const previous = data[dataIndex - 1];
                  const change = ((current - previous) / previous * 100).toFixed(2);
                  
                  if (current > previous) {
                    trend = ` 📈 +${change}%`;
                  } else if (current < previous) {
                    trend = ` 📉 ${change}%`;
                  } else {
                    trend = ` ➡️ 0%`;
                  }
                }
                
                return `${context.dataset.label}: $${value}${trend}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: this.fullDayMode ? 'Hora del Día' : 'Tiempo',
              color: 'white',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
              display: true
            },
            ticks: {
              color: 'white',
              maxTicksLimit: this.fullDayMode ? 12 : 10,
              font: {
                size: 11
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Precio ($)',
              color: 'white',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
              display: true
            },
            ticks: {
              color: 'white',
              font: {
                size: 11
              },
              callback: function(value) {
                return '$' + Number(value).toFixed(2);
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private resetChart(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Resetear también el precio de apertura cuando se cambia de ticker o modo
    this.openingPrice = 0;
    this.currentPrice = 0;
    this.priceChange = 0;
    this.priceChangePercent = 0;
    this.isPriceLoading = true; // Reset price loading state
    // No resetear isChartLoading aquí porque se maneja en toggleFullDayView

    this.initChart();
  }

  subscribeToData(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Detener actualizaciones automáticas previas
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }

    // Limpiar timer de actualizaciones LIVE
    if (this.liveUpdateTimer) {
      clearInterval(this.liveUpdateTimer);
      this.liveUpdateTimer = null;
    }

    // Desconectar WebSocket previo
    this.webSocketService.disconnect();

    // Mostrar loading al inicio
    this.isLoading = true;
    this.isChartLoading = true; // Mostrar loading del gráfico también

    if (this.fullDayMode) {
      // Modo día completo: cargar datos iniciales una sola vez
      this.stockDataService.getFullDayData(this.ticker).subscribe(fullDayData => {
        if (fullDayData === null) {
          // No hay datos del WebSocket, mantener loading
          console.log('No WebSocket data available, showing loading state');
          return;
        }

        this.isLoading = false;
        this.isChartLoading = false; // Ocultar loading del gráfico cuando los datos están listos
        console.log('Full day data received:', fullDayData);

        // Establecer el precio de apertura del día
        if (fullDayData.prices.length > 0) {
          this.openingPrice = fullDayData.prices[0];
          this.currentPrice = fullDayData.prices[fullDayData.prices.length - 1];
          this.isPriceLoading = false; // Stop price loading when full day data is loaded
          this.calculatePriceChange();
        }

        // Cargar datos iniciales una sola vez
        this.updateChart(fullDayData.labels, fullDayData.prices);
      });

      // Conectar WebSocket para actualizaciones en tiempo real sin re-render completo
      this.webSocketService.connect('ws://localhost:8081');
      this.subscription = this.webSocketService.getMessages().subscribe((message: WebSocketMessage) => {
        if (message.type === 'tick' && message.ticker === this.ticker && message.price) {
          console.log('WebSocket update for full day mode:', message.price);
          this.updateLivePrice(parseFloat(message.price));
        }
      });
    } else {
      // Modo actual: cargar datos iniciales una sola vez
      this.stockDataService.getStockData(this.ticker).subscribe(data => {
        console.log('Initial current data received:', data);

        // Obtener precio de apertura del día completo
        this.stockDataService.getFullDayData(this.ticker).subscribe(fullDayData => {
          if (fullDayData && fullDayData.prices.length > 0) {
            this.openingPrice = fullDayData.prices[0];
          }

          if (data.prices.length > 0) {
            this.currentPrice = data.prices[data.prices.length - 1];
            this.isPriceLoading = false; // Stop price loading when live data is loaded
            this.calculatePriceChange();
          }

          // Ocultar loading una vez que tenemos datos
          this.isLoading = false;
          this.isChartLoading = false; // Ocultar loading del gráfico cuando los datos están listos

          // Cargar datos iniciales una sola vez
          this.updateChart(data.labels, data.prices);
        });
      });

      // Conectar WebSocket para actualizaciones en tiempo real
      this.webSocketService.connect('ws://localhost:8081');
      this.subscription = this.webSocketService.getMessages().subscribe((message: WebSocketMessage) => {
        console.log('Live update received:', message);
        if (message.type === 'tick' && message.ticker === this.ticker) {
          this.updateLivePrice(parseFloat(message.price));
        }
      });

      // Iniciar timer para agregar nuevos puntos cada 5 segundos en modo LIVE
      this.startLiveUpdates();
    }
  }

  private startLiveUpdates(): void {
    // Refrescar datos completos cada 5 segundos en modo LIVE
    this.liveUpdateTimer = setInterval(() => {
      if (!this.chart || this.fullDayMode) return;

      console.log('Refreshing data every 5 seconds for', this.ticker);
      
      // Obtener datos frescos del servicio (que ahora tiene cache de 5 segundos)
      this.stockDataService.getStockData(this.ticker).subscribe(data => {
        if (data && data.prices.length > 0) {
          // Actualizar el precio actual
          this.currentPrice = data.prices[data.prices.length - 1];
          this.isPriceLoading = false;
          this.calculatePriceChange();
          
          // Actualizar el gráfico con los nuevos datos
          this.updateChart(data.labels, data.prices);
          console.log('Chart updated with fresh data at', new Date().toLocaleTimeString());
        }
      });
    }, 5000); // Cada 5 segundos
  }


  private updateChart(labels: string[], prices: number[]): void {
    if (!this.chart) return;

    // Validar datos de entrada
    if (!labels || !prices || labels.length === 0 || prices.length === 0) {
      console.warn('Invalid data provided to updateChart');
      return;
    }

    // Ocultar loading del gráfico cuando se reciben datos
    this.isChartLoading = false;

    // Control de frecuencia para evitar updates excesivos
    const now = Date.now();
    if (now - this.lastUpdateTime < this.MIN_UPDATE_INTERVAL) {
      return;
    }

    // Verificar si los datos han cambiado realmente para evitar re-renders innecesarios
    if (this.cachedData &&
        this.arraysEqual(this.cachedData.labels, labels) &&
        this.arraysEqual(this.cachedData.prices, prices)) {
      return; // No hay cambios, evitar re-render
    }

    // Actualizar cache solo si hay cambios reales
    this.cachedData = { labels: [...labels], prices: [...prices] };
    this.lastUpdateTime = now;

    console.log('Updating chart with new data - labels:', labels.length, 'prices:', prices.length);

    // Actualizar precio actual si es diferente
    const latestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
    if (latestPrice > 0 && this.currentPrice !== latestPrice) {
      this.currentPrice = latestPrice;
      this.calculatePriceChange();
    }

    // Solo actualizar los datos del chart, no recrear
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = prices;

    // Actualizar escalas solo si es necesario
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const padding = (maxPrice - minPrice) * 0.1;

      if (this.chart.options.scales && this.chart.options.scales['y']) {
        const yScale = this.chart.options.scales['y'] as any;
        const currentMin = yScale.min;
        const currentMax = yScale.max;
        const newMin = minPrice - padding;
        const newMax = maxPrice + padding;

        // Solo actualizar escalas si hay un cambio significativo
        if (Math.abs(currentMin - newMin) > padding * 0.1 || Math.abs(currentMax - newMax) > padding * 0.1) {
          yScale.min = newMin;
          yScale.max = newMax;
        }
      }
    }

    // Actualizar con animación suave para mejor experiencia visual
    this.chart.update('active');
  }

  // Método auxiliar para comparar arrays
  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

  private updateLivePrice(price: number): void {
    if (!this.chart) return;

    // Control de frecuencia: máximo 2 actualizaciones por segundo
    const now = Date.now();
    if (now - this.lastLivePriceUpdate < 500) {
      return;
    }
    this.lastLivePriceUpdate = now;

    // Solo actualizar si el precio ha cambiado
    if (this.currentPrice !== price) {
      this.currentPrice = price;
      this.isPriceLoading = false; // Stop price loading when we receive data
      this.calculatePriceChange();

      // En modo LIVE, el timer se encarga de agregar puntos
      // Aquí solo actualizamos el precio actual para el próximo punto
      console.log('Live price updated to:', price);
    }
  }

  toggleFullDayView(): void {
    this.fullDayMode = !this.fullDayMode;
    this.viewModeChanged.emit(this.fullDayMode);
    this.isChartLoading = true; // Mostrar loading del gráfico
    this.resetChart();
    this.subscribeToData();
  }

  private calculatePriceChange(): void {
    if (this.openingPrice > 0 && this.currentPrice > 0) {
      this.priceChange = this.currentPrice - this.openingPrice;
      this.priceChangePercent = (this.priceChange / this.openingPrice) * 100;
    }
  }
}
