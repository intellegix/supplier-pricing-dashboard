import type { EconomicIndicator } from '../types';

// Economic indicator symbols and sources
const ECONOMIC_SYMBOLS: Record<string, {
  symbol: string;
  name: string;
  unit: string;
  description: string;
  source: string;
  transform?: (value: number) => number;
}> = {
  // Treasury rates from Yahoo Finance
  'TNX': {
    symbol: '^TNX',
    name: '10-Year Treasury Yield',
    unit: '%',
    description: 'U.S. 10-year Treasury note yield, key benchmark for mortgage rates',
    source: 'U.S. Treasury',
  },
  'FVX': {
    symbol: '^FVX',
    name: '5-Year Treasury Yield',
    unit: '%',
    description: 'U.S. 5-year Treasury note yield, medium-term rate indicator',
    source: 'U.S. Treasury',
  },
  'IRX': {
    symbol: '^IRX',
    name: '13-Week T-Bill Rate',
    unit: '%',
    description: 'Short-term Treasury bill rate, reflects Fed policy',
    source: 'U.S. Treasury',
  },
  // Market indicators
  'VIX': {
    symbol: '^VIX',
    name: 'Market Volatility Index',
    unit: '',
    description: 'CBOE VIX measures market uncertainty and construction financing risk',
    source: 'CBOE',
  },
  'GSPC': {
    symbol: '^GSPC',
    name: 'S&P 500 Index',
    unit: '',
    description: 'Broad market index reflecting overall economic health',
    source: 'S&P Dow Jones',
  },
  // Sector-specific ETFs as proxies
  'XHB': {
    symbol: 'XHB',
    name: 'Homebuilders Index',
    unit: '$',
    description: 'SPDR S&P Homebuilders ETF tracks residential construction sector',
    source: 'SPDR',
  },
  'ITB': {
    symbol: 'ITB',
    name: 'Home Construction ETF',
    unit: '$',
    description: 'iShares U.S. Home Construction ETF tracks building industry',
    source: 'iShares',
  },
  'XLI': {
    symbol: 'XLI',
    name: 'Industrial Sector',
    unit: '$',
    description: 'Industrial Select Sector SPDR tracks manufacturing and construction equipment',
    source: 'SPDR',
  },
};

// Multiple CORS proxies for fallback
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

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

// Fetch quote data from Yahoo Finance with retry
async function fetchYahooQuote(symbol: string): Promise<{
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  historicalData: { date: string; value: number }[];
} | null> {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`;
    const response = await fetchWithRetry(yahooUrl);

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return null;

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp || [];
    const closes = quotes?.close || [];

    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
    const previousClose = meta.chartPreviousClose || meta.previousClose || closes[closes.length - 2];

    if (!currentPrice || currentPrice <= 0) return null;

    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    // Build historical data
    const historicalData: { date: string; value: number }[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined && closes[i] > 0) {
        const date = new Date(timestamps[i] * 1000);
        historicalData.push({
          date: date.toISOString().split('T')[0],
          value: closes[i],
        });
      }
    }

    return {
      current: currentPrice,
      previous: previousClose,
      change,
      changePercent,
      historicalData,
    };
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

export async function fetchEconomicData(): Promise<EconomicIndicator[]> {
  console.log('Fetching economic data from Yahoo Finance...');

  const indicators: EconomicIndicator[] = [];
  const entries = Object.entries(ECONOMIC_SYMBOLS);

  for (let i = 0; i < entries.length; i++) {
    const [id, config] = entries[i];

    try {
      const quote = await fetchYahooQuote(config.symbol);

      if (quote && quote.current > 0) {
        let value = quote.current;
        let previousValue = quote.previous;

        // Apply any transforms (e.g., for rates that need to be divided)
        if (config.transform) {
          value = config.transform(value);
          previousValue = config.transform(previousValue);
        }

        indicators.push({
          id: id.toLowerCase(),
          name: config.name,
          value,
          previousValue,
          change: quote.change,
          changePercent: quote.changePercent,
          unit: config.unit,
          description: config.description,
          source: config.source,
          lastUpdated: new Date().toISOString(),
          historicalData: quote.historicalData,
        });

        console.log(`✓ ${config.name}: ${value.toFixed(2)}${config.unit} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
      } else {
        throw new Error('No quote data');
      }
    } catch (error) {
      console.error(`✗ ${config.name}: Failed -`, error instanceof Error ? error.message : 'Unknown error');

      // Add placeholder data for failed fetch
      indicators.push({
        id: id.toLowerCase(),
        name: config.name,
        value: 0,
        previousValue: 0,
        change: 0,
        changePercent: 0,
        unit: config.unit,
        description: config.description,
        source: config.source,
        lastUpdated: new Date().toISOString(),
        historicalData: [],
      });
    }

    // Delay between requests to avoid rate limiting
    if (i < entries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  const successCount = indicators.filter(ind => ind.value > 0).length;
  console.log(`Economic fetch complete: ${successCount}/${indicators.length} successful`);

  return indicators;
}
