import type { CommodityData, RiskLevel } from '../types';

// Yahoo Finance commodity futures symbols
const COMMODITY_SYMBOLS = {
  'Natural Gas': 'NG=F',
  'Crude Oil': 'CL=F',
  'Gold': 'GC=F',
  'Silver': 'SI=F',
  'Copper': 'HG=F',
  'Lumber': 'LBS=F',
  'Steel': 'SLB',  // Steel ETF proxy (VanEck Steel ETF)
  'USD Index': 'DX-Y.NYB',
};

// Commodity metadata
const COMMODITY_META: Record<string, {
  id: string;
  symbol: string;
  priceImpact: string;
  socalImpact: string
}> = {
  'Natural Gas': {
    id: 'ng',
    symbol: 'NG',
    priceImpact: 'Direct impact on heating, manufacturing, and transportation costs',
    socalImpact: 'Affects energy costs for construction equipment and material production',
  },
  'Crude Oil': {
    id: 'cl',
    symbol: 'CL',
    priceImpact: 'Major driver of fuel and transportation costs',
    socalImpact: 'Impacts delivery costs and asphalt pricing for SoCal projects',
  },
  'Gold': {
    id: 'gc',
    symbol: 'GC',
    priceImpact: 'Economic uncertainty indicator and inflation hedge',
    socalImpact: 'Indicator of economic conditions affecting construction financing',
  },
  'Silver': {
    id: 'si',
    symbol: 'SI',
    priceImpact: 'Industrial metal with electrical and solar applications',
    socalImpact: 'Affects electrical component and solar panel costs in SoCal construction',
  },
  'Copper': {
    id: 'hg',
    symbol: 'HG',
    priceImpact: 'Critical for electrical wiring and plumbing',
    socalImpact: 'Direct impact on electrical and plumbing costs for SoCal builders',
  },
  'Lumber': {
    id: 'lbs',
    symbol: 'LBS',
    priceImpact: 'Essential for framing and construction',
    socalImpact: 'Major cost driver for residential and commercial framing in SoCal',
  },
  'Steel': {
    id: 'steel',
    symbol: 'STEEL',
    priceImpact: 'Structural material for commercial construction',
    socalImpact: 'Critical for high-rise and commercial projects in LA/SD metro areas',
  },
  'USD Index': {
    id: 'dxy',
    symbol: 'DXY',
    priceImpact: 'Affects import costs and international material pricing',
    socalImpact: 'Impacts cost of imported materials through Port of LA/Long Beach',
  },
};

// Multiple CORS proxies for fallback
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Calculate risk level based on volatility and price change
function calculateRiskLevel(dailyChangePercent: number, volatility: number): RiskLevel {
  const absChange = Math.abs(dailyChangePercent);
  if (absChange > 5 || volatility > 40) return 'CRITICAL';
  if (absChange > 3 || volatility > 25) return 'HIGH';
  if (absChange > 1.5 || volatility > 15) return 'MODERATE';
  return 'LOW';
}

// Generate historical prices (simulated based on current price and volatility)
function generateHistoricalPrices(currentPrice: number, volatility: number): { date: string; price: number }[] {
  const prices: { date: string; price: number }[] = [];
  const today = new Date();
  let price = currentPrice;

  // Generate 90 days of historical data working backwards
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random walk with mean reversion
    const dailyVolatility = volatility / Math.sqrt(252); // Annualized to daily
    const change = (Math.random() - 0.5) * 2 * (dailyVolatility / 100) * price;
    price = price + change;

    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(price, currentPrice * 0.7), // Floor at 70% of current
    });
  }

  // Ensure last price matches current
  if (prices.length > 0) {
    prices[prices.length - 1].price = currentPrice;
  }

  return prices;
}

// Fetch with retry logic and multiple proxies
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  initialDelay: number = 500
): Promise<Response> {
  let lastError: Error | null = null;

  for (let proxyIndex = 0; proxyIndex < CORS_PROXIES.length; proxyIndex++) {
    const proxyFn = CORS_PROXIES[proxyIndex];
    const proxyUrl = proxyFn(url);

    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        // If we get a rate limit response, try next proxy
        if (response.status === 429) {
          console.warn(`Rate limited on proxy ${proxyIndex + 1}, trying next...`);
          break;
        }

        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Exponential backoff
        const delay = initialDelay * Math.pow(2, retry);

        if (retry < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error('All fetch attempts failed');
}

// Fetch quote data from Yahoo Finance via CORS proxy with retry
async function fetchYahooQuote(symbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
  volume: number | null;
} | null> {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    const response = await fetchWithRetry(yahooUrl);

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return null;

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    const currentPrice = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.chartPreviousClose || meta.previousClose;

    if (!currentPrice || currentPrice <= 0) return null;

    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;
    const volume = quote?.volume?.[quote.volume.length - 1] || null;

    return {
      price: currentPrice,
      change,
      changePercent,
      volume,
    };
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

export async function fetchCommodityData(): Promise<CommodityData[]> {
  console.log('Fetching commodity data from Yahoo Finance...');

  const commodities: CommodityData[] = [];
  const entries = Object.entries(COMMODITY_SYMBOLS);

  for (let i = 0; i < entries.length; i++) {
    const [name, symbol] = entries[i];
    const meta = COMMODITY_META[name];

    try {
      const quote = await fetchYahooQuote(symbol);

      if (quote && quote.price > 0) {
        // Estimate volatility based on daily change (simplified)
        const volatility = Math.max(10, Math.min(50, Math.abs(quote.changePercent) * 5 + 15));

        commodities.push({
          id: meta.id,
          name,
          symbol: meta.symbol,
          currentPrice: quote.price,
          dailyChange: quote.change,
          dailyChangePercent: quote.changePercent,
          monthlyChangePercent: quote.changePercent * 3, // Estimated
          quarterlyChangePercent: quote.changePercent * 6, // Estimated
          volatility,
          volume: quote.volume,
          priceImpact: meta.priceImpact,
          socalImpact: meta.socalImpact,
          trendDirection: quote.changePercent > 0.5 ? 'up' : quote.changePercent < -0.5 ? 'down' : 'neutral',
          riskLevel: calculateRiskLevel(quote.changePercent, volatility),
          news: [],
          lastUpdated: new Date().toISOString(),
          historicalPrices: generateHistoricalPrices(quote.price, volatility),
        });

        console.log(`✓ ${name}: $${quote.price.toFixed(2)} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
      } else {
        throw new Error('No quote data');
      }
    } catch (error) {
      console.error(`✗ ${name}: Failed -`, error instanceof Error ? error.message : 'Unknown error');

      // Fallback with placeholder data
      commodities.push({
        id: meta.id,
        name,
        symbol: meta.symbol,
        currentPrice: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
        monthlyChangePercent: 0,
        quarterlyChangePercent: 0,
        volatility: 15,
        volume: null,
        priceImpact: meta.priceImpact,
        socalImpact: meta.socalImpact,
        trendDirection: 'neutral',
        riskLevel: 'LOW',
        news: [],
        lastUpdated: new Date().toISOString(),
        historicalPrices: [],
      });
    }

    // Delay between requests to avoid rate limiting
    if (i < entries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const successCount = commodities.filter(c => c.currentPrice > 0).length;
  console.log(`Commodity fetch complete: ${successCount}/${commodities.length} successful`);

  return commodities;
}
