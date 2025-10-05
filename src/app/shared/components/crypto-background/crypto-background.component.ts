import { Component } from '@angular/core';

@Component({
  selector: 'app-crypto-background',
  standalone: true,
  template: `
    <div class="crypto-background-container">
      <!-- Fondo estático con gradiente crypto -->
    </div>
  `,
  styles: [`
    .crypto-background-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      background: linear-gradient(135deg, 
        rgba(30, 58, 138, 0.95) 0%,
        rgba(30, 58, 138, 0.8) 25%,
        rgba(6, 182, 212, 0.1) 50%,
        rgba(74, 222, 128, 0.1) 75%,
        rgba(252, 211, 77, 0.05) 100%
      );
    }
  `]
})
export class CryptoBackgroundComponent {
}