# 📈 CryptoCharts Pro

Una aplicación moderna de análisis de criptomonedas en tiempo real construida con Angular 17. Visualiza datos de mercado con gráficos interactivos y un diseño temático crypto elegante.

## 🚀 Características

- **Análisis en Tiempo Real**: Datos de criptomonedas actualizados en vivo
- **Gráficos Interactivos**: Visualización avanzada con Chart.js
- **Tema Crypto**: Diseño moderno con colores inspirados en el mundo cripto
- **Fondo Dinámico**: Animaciones y efectos visuales atractivos
- **Responsive**: Optimizado para dispositivos móviles y desktop
- **WebSocket**: Conexión en tiempo real para actualizaciones instantáneas

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores inspirada en el icono crypto:
- **Verde Crypto**: `#4ADE80` - Para tendencias positivas
- **Azul Marino**: `#1E3A8A` - Color principal de fondo
- **Oro/Amarillo**: `#FCD34D` - Para destacar elementos importantes
- **Cian**: `#06B6D4` - Para acentos y detalles

## 🛠️ Servidor de Desarrollo

Ejecuta `ng serve` para iniciar el servidor de desarrollo. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo fuente.

Para usar un puerto específico:
```bash
ng serve --port 4201
```

## 📊 Servidor WebSocket Mock

Para simular datos de mercado en tiempo real, ejecuta:
```bash
node ws-mock.js
```

Este servidor mock proporciona datos simulados de criptomonedas a través de WebSocket en el puerto 8080.

## 🏗️ Construcción

Ejecuta `ng build` para construir el proyecto. Los artefactos de construcción se almacenarán en el directorio `dist/`.

Para construcción de producción:
```bash
ng build --prod
```

## 🧪 Pruebas Unitarias

Ejecuta `ng test` para ejecutar las pruebas unitarias a través de [Karma](https://karma-runner.github.io).

## 🔧 Scaffolding de Código

Ejecuta `ng generate component nombre-componente` para generar un nuevo componente. También puedes usar `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── application/          # Servicios de aplicación
│   ├── domain/              # Modelos e interfaces
│   ├── infrastructure/      # Servicios de infraestructura
│   ├── presentation/        # Componentes de UI
│   └── shared/             # Componentes compartidos
├── assets/                 # Recursos estáticos
└── styles/                # Estilos globales
```

## 🎯 Tecnologías Utilizadas

- **Angular 17**: Framework principal
- **TypeScript**: Lenguaje de programación
- **Tailwind CSS**: Framework de estilos
- **Chart.js**: Librería de gráficos
- **RxJS**: Programación reactiva
- **WebSocket**: Comunicación en tiempo real

## 🌟 Características Técnicas

- **Arquitectura Limpia**: Separación clara de responsabilidades
- **Componentes Standalone**: Uso de la nueva arquitectura de Angular
- **Lazy Loading**: Carga optimizada de componentes
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Animaciones CSS**: Efectos visuales suaves y atractivos

## 📱 Uso

1. **Seleccionar Criptomoneda**: Usa el selector para elegir entre diferentes cryptos
2. **Cambiar Vista**: Alterna entre vista actual y gráfico completo del día
3. **Monitoreo en Tiempo Real**: Observa las actualizaciones de precios en vivo
4. **Análisis Visual**: Interpreta tendencias con los gráficos interactivos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Ayuda Adicional

Para obtener más ayuda sobre Angular CLI usa `ng help` o visita la página [Angular CLI Overview and Command Reference](https://angular.io/cli).

---

**Desarrollado con ❤️ para la comunidad crypto** 🚀💎