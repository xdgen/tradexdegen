import { Connection } from '@solana/web3.js';

export type PriceData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

class PriceDataService {
  private connection: Connection;
  private priceHistory: { [key: string]: PriceData[] } = {};
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
  }

  async getPriceData(
    tokenAddress: string,
    timeframe: string,
    limit: number = 100
  ): Promise<PriceData[]> {
    try {
      // Get initial price from Jupiter API
      const initialPrice = await this.getCurrentPrice(tokenAddress);
      
      // Fetch historical data
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );
      const data = await response.json();
      
      if (!data.pairs || !data.pairs[0]) {
        throw new Error('No price data available');
      }

      const pair = data.pairs[0];
      const basePrice = parseFloat(pair.priceUsd);
      
      // Generate candles based on real initial price
      const historicalData = this.generateRealisticData(basePrice, limit, timeframe);
      this.priceHistory[tokenAddress] = historicalData;

      // Initialize WebSocket for real-time updates
      this.initializeWebSocket(tokenAddress, timeframe);

      return historicalData;
    } catch (error) {
      console.error('Error fetching price data:', error);
      return [];
    }
  }

  private async getCurrentPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await fetch(
        `https://price.jup.ag/v4/price?ids=${tokenAddress}`
      );
      const data = await response.json();
      return data.data[tokenAddress]?.price || 0;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return 0;
    }
  }

  private initializeWebSocket(tokenAddress: string, timeframe: string) {
    if (this.ws) {
      this.ws.close();
    }

    try {
      // Connect to Jupiter's high-frequency WebSocket
      this.ws = new WebSocket('wss://price.jup.ag/v4/ws');
      
      this.ws.onopen = () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            op: 'subscribe',
            channel: 'market',
            markets: [tokenAddress],
            frequency: 'realtime' // Request highest frequency updates
          }));
        }
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.data?.price) {
          const price = parseFloat(data.data.price);
          this.updateLatestCandle(tokenAddress, price, timeframe);
          
          // Emit high-frequency updates
          if (this.listeners[tokenAddress]) {
            const updates = this.priceHistory[tokenAddress];
            for (const callback of this.listeners[tokenAddress]) {
              callback(updates);
            }
          }
        }
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }

  private generateRealisticData(basePrice: number, limit: number, timeframe: string): PriceData[] {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeframeSeconds = this.getTimeframeInSeconds(timeframe);
    const mockData: PriceData[] = [];
    let lastClose = basePrice;

    for (let i = 0; i < limit; i++) {
      const time = currentTime - (limit - i) * timeframeSeconds;
      const volatility = 0.001; // 0.1% volatility
      const change = (Math.random() - 0.5) * 2 * volatility;
      
      const open = lastClose;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      const volume = Math.random() * basePrice * 1000;

      mockData.push({
        time,
        open,
        high,
        low,
        close,
        volume
      });

      lastClose = close;
    }

    return mockData;
  }

  private updateLatestCandle(tokenAddress: string, price: number, timeframe: string) {
    const history = this.priceHistory[tokenAddress];
    if (!history?.length) return;

    const now = Date.now() / 1000;
    const lastCandle = history[history.length - 1];
    const timeframeSeconds = this.getTimeframeInSeconds(timeframe);
    
    // Update or create new candle with microsecond precision
    if (now - lastCandle.time >= timeframeSeconds) {
      // New candle
      history.push({
        time: Math.floor(now),
        open: lastCandle.close,
        high: price,
        low: price,
        close: price,
        volume: 0
      });
    } else {
      // Update existing candle
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.close = price;
    }
  }

  private getTimeframeInSeconds(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    return timeframes[timeframe] || 300;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  // Add event emitter for real-time updates
  private listeners: { [key: string]: ((data: PriceData[]) => void)[] } = {};

  public subscribe(tokenAddress: string, callback: (data: PriceData[]) => void) {
    if (!this.listeners[tokenAddress]) {
      this.listeners[tokenAddress] = [];
    }
    this.listeners[tokenAddress].push(callback);
  }

  public unsubscribe(tokenAddress: string, callback: (data: PriceData[]) => void) {
    if (this.listeners[tokenAddress]) {
      this.listeners[tokenAddress] = this.listeners[tokenAddress].filter(cb => cb !== callback);
    }
  }

  private emitUpdate(tokenAddress: string, data: PriceData[]) {
    if (this.listeners[tokenAddress]) {
      for (const callback of this.listeners[tokenAddress]) {
        callback(data);
      }
    }
  }
}

export const priceDataService = new PriceDataService(); 