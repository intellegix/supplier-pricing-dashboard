import type { NewsArticle } from '../types';

// Yahoo Finance RSS feed URLs for different categories
const YAHOO_FEEDS = {
  commodities: 'https://finance.yahoo.com/rss/topstories',
  markets: 'https://finance.yahoo.com/rss/topfinstories',
};

// Ticker symbols to search news for
const COMMODITY_TICKERS = ['LBR=F', 'HG=F', 'CL=F', 'NG=F', 'GC=F', 'SI=F', 'DX-Y.NYB'];
const SUPPLIER_TICKERS = ['HD', 'LOW', 'BLDR', 'FAST', 'MAS', 'CARR', 'JCI', 'OC', 'SHW', 'VMC', 'MLM'];

// CORS proxy for browser requests
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface YahooNewsItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
}

// Fetch news from Yahoo Finance RSS feed
async function fetchYahooRSS(feedUrl: string): Promise<YahooNewsItem[]> {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);
    if (!response.ok) throw new Error('RSS fetch failed');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const items = xmlDoc.querySelectorAll('item');
    const newsItems: YahooNewsItem[] = [];

    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const source = item.querySelector('source')?.textContent || 'Yahoo Finance';

      if (title && link) {
        newsItems.push({ title, link, pubDate, source });
      }
    });

    return newsItems;
  } catch (error) {
    console.error('Error fetching Yahoo RSS:', error);
    return [];
  }
}

// Fetch news for a specific ticker symbol
async function fetchTickerNews(ticker: string): Promise<YahooNewsItem[]> {
  try {
    const url = `https://finance.yahoo.com/rss/headline?s=${ticker}`;
    return await fetchYahooRSS(url);
  } catch (error) {
    console.error(`Error fetching news for ${ticker}:`, error);
    return [];
  }
}

// Convert Yahoo news items to our NewsArticle format
function convertToNewsArticle(item: YahooNewsItem): NewsArticle {
  return {
    title: item.title,
    url: item.link,
    source: item.source || 'Yahoo Finance',
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
  };
}

// Fetch all commodity-related news
export async function fetchCommodityNews(): Promise<NewsArticle[]> {
  const allNews: NewsArticle[] = [];

  // Fetch from general commodities feed
  const generalNews = await fetchYahooRSS(YAHOO_FEEDS.commodities);
  allNews.push(...generalNews.map(convertToNewsArticle));

  // Fetch news for each commodity ticker (limit to avoid rate limiting)
  const tickerPromises = COMMODITY_TICKERS.slice(0, 3).map(fetchTickerNews);
  const tickerResults = await Promise.all(tickerPromises);

  tickerResults.forEach((items) => {
    allNews.push(...items.map(convertToNewsArticle));
  });

  // Remove duplicates by title
  const uniqueNews = allNews.filter((article, index, self) =>
    index === self.findIndex((a) => a.title === article.title)
  );

  // Sort by date (newest first)
  return uniqueNews.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

// Fetch all supplier/stock-related news
export async function fetchSupplierNews(): Promise<NewsArticle[]> {
  const allNews: NewsArticle[] = [];

  // Fetch from general markets feed
  const generalNews = await fetchYahooRSS(YAHOO_FEEDS.markets);
  allNews.push(...generalNews.map(convertToNewsArticle));

  // Fetch news for top supplier tickers
  const tickerPromises = SUPPLIER_TICKERS.slice(0, 4).map(fetchTickerNews);
  const tickerResults = await Promise.all(tickerPromises);

  tickerResults.forEach((items) => {
    allNews.push(...items.map(convertToNewsArticle));
  });

  // Remove duplicates
  const uniqueNews = allNews.filter((article, index, self) =>
    index === self.findIndex((a) => a.title === article.title)
  );

  return uniqueNews.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

// Fetch all news (combined)
export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    const [commodityNews, supplierNews] = await Promise.all([
      fetchCommodityNews(),
      fetchSupplierNews(),
    ]);

    const allNews = [...commodityNews, ...supplierNews];

    // Remove duplicates
    const uniqueNews = allNews.filter((article, index, self) =>
      index === self.findIndex((a) => a.title === article.title)
    );

    // Sort and limit
    return uniqueNews
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 30);
  } catch (error) {
    console.error('Error fetching all news:', error);
    return [];
  }
}

// Fetch news for a specific ticker
export async function fetchNewsForTicker(ticker: string): Promise<NewsArticle[]> {
  const items = await fetchTickerNews(ticker);
  return items.map(convertToNewsArticle).slice(0, 5);
}
