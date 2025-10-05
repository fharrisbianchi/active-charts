// ws-relay.js
const { WebSocketServer } = require('ws');
const WebSocket = require('ws');

const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });

// Lista de productos a suscribir (Coinbase usa "BTC-USD", "ETH-USD", etc.)
const PRODUCTS = [
  "BTC-USD", "ETH-USD", "SOL-USD", "ADA-USD", 
  "DOGE-USD", "XRP-USD", "MATIC-USD", "AVAX-USD",
  "DOT-USD", "LINK-USD", "UNI-USD", "LTC-USD"
];

// Conexión al WebSocket de Coinbase
const coinbase = new WebSocket("wss://ws-feed.exchange.coinbase.com");

coinbase.on("open", () => {
  console.log("Conectado a Coinbase WebSocket");

  // Nos suscribimos a los tickers que queremos
  coinbase.send(JSON.stringify({
    type: "subscribe",
    product_ids: PRODUCTS,
    channels: ["ticker"]
  }));
});

// Cuando Coinbase manda un mensaje, se lo pasamos a todos los clientes locales
coinbase.on("message", (msg) => {
  const data = JSON.parse(msg);

  // Solo reemitimos si es un evento de "ticker"
  if (data.type === "ticker") {
    const relayMsg = JSON.stringify({
      type: "tick",
      ticker: data.product_id,
      price: data.price,
      volume: data.last_size,
      ts: Date.now()
    });

    wss.clients.forEach(c => c.readyState === 1 && c.send(relayMsg));
  }
});

coinbase.on("error", (err) => {
  console.error("Error en Coinbase WS:", err);
});

coinbase.on("close", () => {
  console.log("Conexión a Coinbase cerrada");
});

// Cuando un cliente local se conecta, podemos mandarle un mensaje inicial
wss.on("connection", (ws) => {
  console.log("Cliente conectado al relay local");
  ws.send(JSON.stringify({
    type: "info",
    msg: `Relay conectado a Coinbase para productos: ${PRODUCTS.join(", ")}`
  }));
});

console.log(`WS relay corriendo en ws://localhost:${PORT}`);
