import type { SupplierData } from '../types';

// Supplier stock symbols and metadata
const SUPPLIERS: Record<string, {
  company: string;
  focusArea: string;
  socalPresence: string;
  keyProducts: string;
  pricingPowerAssessment: string;
  socalRelevanceScore: number;
}> = {
  'HD': {
    company: 'Home Depot',
    focusArea: 'Home Improvement Retail',
    socalPresence: '100+ stores across Southern California',
    keyProducts: 'Building materials, tools, lumber, plumbing, electrical',
    pricingPowerAssessment: 'Strong pricing power due to market leadership and scale',
    socalRelevanceScore: 95,
  },
  'LOW': {
    company: "Lowe's",
    focusArea: 'Home Improvement Retail',
    socalPresence: '80+ stores in SoCal region',
    keyProducts: 'Building materials, appliances, tools, lumber',
    pricingPowerAssessment: 'Good pricing power, competing closely with HD',
    socalRelevanceScore: 90,
  },
  'BLDR': {
    company: 'Builders FirstSource',
    focusArea: 'Building Materials Distribution',
    socalPresence: 'Multiple distribution centers in LA/SD',
    keyProducts: 'Lumber, trusses, millwork, windows, doors',
    pricingPowerAssessment: 'Strong in professional builder segment',
    socalRelevanceScore: 85,
  },
  'FAST': {
    company: 'Fastenal',
    focusArea: 'Industrial Distribution',
    socalPresence: '50+ branches in Southern California',
    keyProducts: 'Fasteners, tools, safety supplies, OEM components',
    pricingPowerAssessment: 'Moderate pricing power in fragmented market',
    socalRelevanceScore: 75,
  },
  'MAS': {
    company: 'Masco',
    focusArea: 'Home Improvement Products',
    socalPresence: 'Products widely available through retailers',
    keyProducts: 'Faucets, cabinets, paints (Behr), bath products',
    pricingPowerAssessment: 'Brand-driven pricing power (Delta, Behr)',
    socalRelevanceScore: 80,
  },
  'CARR': {
    company: 'Carrier Global',
    focusArea: 'HVAC & Building Systems',
    socalPresence: 'Strong dealer network in hot SoCal climate',
    keyProducts: 'HVAC systems, refrigeration, fire & security',
    pricingPowerAssessment: 'Premium brand with strong pricing power',
    socalRelevanceScore: 88,
  },
  'JCI': {
    company: 'Johnson Controls',
    focusArea: 'Building Technology',
    socalPresence: 'Major presence in commercial construction',
    keyProducts: 'HVAC, fire safety, security systems, building automation',
    pricingPowerAssessment: 'Strong in integrated building solutions',
    socalRelevanceScore: 82,
  },
  'OC': {
    company: 'Owens Corning',
    focusArea: 'Building Materials',
    socalPresence: 'Products distributed throughout SoCal',
    keyProducts: 'Roofing, insulation, composites',
    pricingPowerAssessment: 'Strong pricing in roofing segment',
    socalRelevanceScore: 85,
  },
  'SHW': {
    company: 'Sherwin-Williams',
    focusArea: 'Paints & Coatings',
    socalPresence: '200+ stores in Southern California',
    keyProducts: 'Paints, stains, coatings, applicators',
    pricingPowerAssessment: 'Market leader with premium pricing',
    socalRelevanceScore: 92,
  },
  'VMC': {
    company: 'Vulcan Materials',
    focusArea: 'Construction Aggregates',
    socalPresence: 'Quarries and plants throughout SoCal',
    keyProducts: 'Crushed stone, sand, gravel, asphalt, concrete',
    pricingPowerAssessment: 'Regional monopolies provide strong pricing',
    socalRelevanceScore: 95,
  },
};

// Multiple CORS proxies for fallback
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Format market cap
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toFixed(0)}`;
}

// Calculate financial health based on metrics
function calculateFinancialHealth(
  profitMargin: number | null,
  debtEquity: number | null,
  roe: number | null
): string {
  let score = 0;

  if (profitMargin !== null) {
    if (profitMargin > 15) score += 3;
    else if (profitMargin > 8) score += 2;
    else if (profitMargin > 3) score += 1;
  }

  if (debtEquity !== null) {
    if (debtEquity < 0.5) score += 3;
    else if (debtEquity < 1) score += 2;
    else if (debtEquity < 2) score += 1;
  }

  if (roe !== null) {
    if (roe > 20) score += 3;
    else if (roe > 12) score += 2;
    else if (roe > 5) score += 1;
  }

  if (score >= 7) return 'Excellent';
  if (score >= 5) return 'Strong';
  if (score >= 3) return 'Moderate';
  return 'Weak';
}

// Calculate investment grade
function calculateInvestmentGrade(
  peRatio: number | null,
  profitMargin: number | null,
  quarterlyPerformance: number
): string {
  let score = 0;

  if (peRatio !== null && peRatio > 0) {
    if (peRatio < 15) score += 2;
    else if (peRatio < 25) score += 1;
  }

  if (profitMargin !== null && profitMargin > 10) score += 2;
  if (quarterlyPerformance > 5) score += 2;
  else if (quarterlyPerformance > 0) score += 1;

  if (score >= 5) return 'A';
  if (score >= 4) return 'B+';
  if (score >= 3) return 'B';
  if (score >= 2) return 'C+';
  return 'C';
}

// Generate historical prices based on current price and performance
function generateHistoricalPrices(
  currentPrice: number,
  quarterlyPerformance: number
): { date: string; price: number }[] {
  const prices: { date: string; price: number }[] = [];
  const today = new Date();

  // Work backwards from current price
  const dailyChange = quarterlyPerformance / 90 / 100;
  let price = currentPrice;

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Add some randomness
    const randomFactor = 1 + (Math.random() - 0.5) * 0.02;
    price = price / (1 + dailyChange) * randomFactor;

    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(price, currentPrice * 0.7),
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
        console.warn(`Retry ${retry + 1}/${maxRetries} for ${url} (proxy ${proxyIndex + 1}): ${lastError.message}`);

        if (retry < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error('All fetch attempts failed');
}

// Fetch stock quote and key statistics from Yahoo Finance
async function fetchYahooStockData(symbol: string): Promise<{
  price: number;
  marketCap: number;
  peRatio: number | null;
  weeklyChange: number;
  monthlyChange: number;
  quarterlyChange: number;
  grossMargin: number | null;
  operatingMargin: number | null;
  profitMargin: number | null;
  revenueGrowth: number | null;
  roe: number | null;
  debtEquity: number | null;
} | null> {
  try {
    // Fetch quote data with retry logic
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`;
    const response = await fetchWithRetry(quoteUrl);

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      console.error(`No chart data for ${symbol}`);
      return null;
    }

    const meta = result.meta;
    const prices = result.indicators?.quote?.[0]?.close || [];
    const currentPrice = meta.regularMarketPrice || prices[prices.length - 1];

    if (!currentPrice || currentPrice <= 0) {
      console.error(`Invalid price for ${symbol}`);
      return null;
    }

    // Filter out null prices
    const validPrices = prices.filter((p: number | null) => p !== null && p > 0);

    // Calculate performance over different periods
    const weekAgoPrice = validPrices[validPrices.length - 6] || currentPrice;
    const monthAgoPrice = validPrices[validPrices.length - 22] || validPrices[0] || currentPrice;
    const quarterAgoPrice = validPrices[0] || currentPrice;

    const weeklyChange = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;
    const monthlyChange = ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100;
    const quarterlyChange = ((currentPrice - quarterAgoPrice) / quarterAgoPrice) * 100;

    // Initialize financial data
    let financialData = {
      marketCap: meta.marketCap || 0,
      peRatio: null as number | null,
      grossMargin: null as number | null,
      operatingMargin: null as number | null,
      profitMargin: null as number | null,
      revenueGrowth: null as number | null,
      roe: null as number | null,
      debtEquity: null as number | null,
    };

    // Try to get key statistics (with shorter timeout, don't fail if this fails)
    try {
      const statsUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,financialData`;
      const statsResponse = await fetchWithRetry(statsUrl, 2, 300);

      const statsData = await statsResponse.json();
      const keyStats = statsData.quoteSummary?.result?.[0]?.defaultKeyStatistics;
      const finData = statsData.quoteSummary?.result?.[0]?.financialData;

      if (keyStats) {
        financialData.peRatio = keyStats.forwardPE?.raw || keyStats.trailingPE?.raw || null;
      }

      if (finData) {
        financialData.grossMargin = finData.grossMargins?.raw ? finData.grossMargins.raw * 100 : null;
        financialData.operatingMargin = finData.operatingMargins?.raw ? finData.operatingMargins.raw * 100 : null;
        financialData.profitMargin = finData.profitMargins?.raw ? finData.profitMargins.raw * 100 : null;
        financialData.revenueGrowth = finData.revenueGrowth?.raw ? finData.revenueGrowth.raw * 100 : null;
        financialData.roe = finData.returnOnEquity?.raw ? finData.returnOnEquity.raw * 100 : null;
        financialData.debtEquity = finData.debtToEquity?.raw ? finData.debtToEquity.raw / 100 : null;
      }
    } catch (statsError) {
      console.warn(`Could not fetch financial stats for ${symbol}, using basic data`);
    }

    return {
      price: currentPrice,
      marketCap: financialData.marketCap,
      peRatio: financialData.peRatio,
      weeklyChange,
      monthlyChange,
      quarterlyChange,
      grossMargin: financialData.grossMargin,
      operatingMargin: financialData.operatingMargin,
      profitMargin: financialData.profitMargin,
      revenueGrowth: financialData.revenueGrowth,
      roe: financialData.roe,
      debtEquity: financialData.debtEquity,
    };
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

// Fetch a single supplier's data
async function fetchSingleSupplier(
  ticker: string,
  meta: typeof SUPPLIERS[string]
): Promise<SupplierData> {
  try {
    const stockData = await fetchYahooStockData(ticker);

    if (stockData && stockData.price > 0) {
      const financialHealth = calculateFinancialHealth(
        stockData.profitMargin,
        stockData.debtEquity,
        stockData.roe
      );

      const investmentGrade = calculateInvestmentGrade(
        stockData.peRatio,
        stockData.profitMargin,
        stockData.quarterlyChange
      );

      console.log(`✓ ${ticker} (${meta.company}): $${stockData.price.toFixed(2)} (${stockData.quarterlyChange > 0 ? '+' : ''}${stockData.quarterlyChange.toFixed(2)}% QTD)`);

      return {
        id: ticker.toLowerCase(),
        ticker,
        company: meta.company,
        focusArea: meta.focusArea,
        socalPresence: meta.socalPresence,
        keyProducts: meta.keyProducts,
        marketCap: formatMarketCap(stockData.marketCap),
        grossMargin: stockData.grossMargin,
        operatingMargin: stockData.operatingMargin,
        profitMargin: stockData.profitMargin,
        revenueGrowth: stockData.revenueGrowth,
        roe: stockData.roe,
        peRatio: stockData.peRatio,
        debtEquity: stockData.debtEquity,
        weeklyPerformance: stockData.weeklyChange,
        monthlyPerformance: stockData.monthlyChange,
        quarterlyPerformance: stockData.quarterlyChange,
        pricingPowerAssessment: meta.pricingPowerAssessment,
        financialHealth,
        socalRelevanceScore: meta.socalRelevanceScore,
        investmentGrade,
        news: [],
        lastUpdated: new Date().toISOString(),
        historicalPrices: generateHistoricalPrices(stockData.price, stockData.quarterlyChange),
      };
    }

    throw new Error('No valid stock data');
  } catch (error) {
    console.error(`✗ ${ticker}: Failed -`, error instanceof Error ? error.message : 'Unknown error');

    // Return placeholder data for failed fetch
    return {
      id: ticker.toLowerCase(),
      ticker,
      company: meta.company,
      focusArea: meta.focusArea,
      socalPresence: meta.socalPresence,
      keyProducts: meta.keyProducts,
      marketCap: 'N/A',
      grossMargin: null,
      operatingMargin: null,
      profitMargin: null,
      revenueGrowth: null,
      roe: null,
      peRatio: null,
      debtEquity: null,
      weeklyPerformance: 0,
      monthlyPerformance: 0,
      quarterlyPerformance: 0,
      pricingPowerAssessment: meta.pricingPowerAssessment,
      financialHealth: 'Unknown',
      socalRelevanceScore: meta.socalRelevanceScore,
      investmentGrade: 'N/A',
      news: [],
      lastUpdated: new Date().toISOString(),
      historicalPrices: [],
    };
  }
}

// Process suppliers in batches to avoid overwhelming the proxies
async function processBatch(
  batch: [string, typeof SUPPLIERS[string]][],
  delayBetween: number = 800
): Promise<SupplierData[]> {
  const results: SupplierData[] = [];

  for (const [ticker, meta] of batch) {
    const result = await fetchSingleSupplier(ticker, meta);
    results.push(result);

    // Add delay between requests in the same batch
    if (batch.indexOf([ticker, meta] as [string, typeof SUPPLIERS[string]]) < batch.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }

  return results;
}

export async function fetchSupplierData(): Promise<SupplierData[]> {
  console.log('Fetching supplier data from Yahoo Finance...');

  const entries = Object.entries(SUPPLIERS);

  // Split into batches of 3 to process more safely
  const batchSize = 3;
  const batches: [string, typeof SUPPLIERS[string]][][] = [];

  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize) as [string, typeof SUPPLIERS[string]][]);
  }

  const allResults: SupplierData[] = [];

  // Process batches sequentially with delay between batches
  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i + 1}/${batches.length}...`);

    const batchResults = await processBatch(batches[i], 600);
    allResults.push(...batchResults);

    // Add longer delay between batches
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successCount = allResults.filter(s => s.marketCap !== 'N/A').length;
  console.log(`Supplier fetch complete: ${successCount}/${allResults.length} successful`);

  return allResults;
}
