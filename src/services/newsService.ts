import type { NewsArticle } from '../types';

// Construction-focused ticker symbols only
const CONSTRUCTION_TICKERS = [
  'HD',    // Home Depot
  'LOW',   // Lowe's
  'BLDR',  // Builders FirstSource
  'VMC',   // Vulcan Materials
  'MLM',   // Martin Marietta
  'OC',    // Owens Corning
  'MAS',   // Masco
  'LEN',   // Lennar (homebuilder)
  'DHI',   // D.R. Horton (homebuilder)
  'TOL',   // Toll Brothers
  'PHM',   // PulteGroup
  'XHB',   // Homebuilders ETF
];

// Construction-related keywords for filtering
const CONSTRUCTION_KEYWORDS = [
  'construction', 'building', 'builder', 'homebuilder', 'home depot', 'lowe\'s',
  'housing', 'house', 'home', 'residential', 'commercial building',
  'lumber', 'wood', 'timber', 'steel', 'copper', 'cement', 'concrete',
  'roofing', 'insulation', 'drywall', 'plywood', 'materials',
  'infrastructure', 'renovation', 'remodel', 'contractor',
  'real estate', 'property', 'development', 'developer',
  'permit', 'starts', 'mortgage', 'interest rate',
  'lennar', 'pulte', 'toll brothers', 'horton', 'vulcan', 'martin marietta',
  'owens corning', 'masco', 'builders firstsource',
  'california', 'socal', 'southern california', 'los angeles', 'san diego',
];

// Sources that require subscriptions - filter these out
const BLOCKED_SOURCES = [
  'wall street journal', 'wsj', 'bloomberg', 'barron\'s', 'barrons',
  'financial times', 'ft.com', 'economist', 'investor\'s business daily',
  'marketwatch premium', 'morningstar premium', 'seeking alpha premium',
];

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

// Check if article is from a blocked (subscription-required) source
function isBlockedSource(source: string, url: string): boolean {
  const lowerSource = source.toLowerCase();
  const lowerUrl = url.toLowerCase();

  return BLOCKED_SOURCES.some(blocked =>
    lowerSource.includes(blocked) || lowerUrl.includes(blocked)
  );
}

// Check if article is construction-related
function isConstructionRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return CONSTRUCTION_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

// Convert Yahoo news items to our NewsArticle format
function convertToNewsArticle(item: YahooNewsItem): NewsArticle | null {
  // Filter out blocked sources
  if (isBlockedSource(item.source || '', item.link)) {
    return null;
  }

  return {
    title: item.title,
    url: item.link,
    source: item.source || 'Yahoo Finance',
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
  };
}

// Fetch construction-related news from ticker feeds
export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    console.log('Fetching construction-related news...');
    const allNews: NewsArticle[] = [];

    // Fetch news for construction-related tickers only
    const tickerPromises = CONSTRUCTION_TICKERS.map(fetchTickerNews);
    const tickerResults = await Promise.all(tickerPromises);

    tickerResults.forEach((items) => {
      items.forEach((item) => {
        const article = convertToNewsArticle(item);
        if (article) {
          allNews.push(article);
        }
      });
    });

    // Filter to only include construction-related content
    const constructionNews = allNews.filter((article) =>
      isConstructionRelated(article.title)
    );

    // Remove duplicates by title
    const uniqueNews = constructionNews.filter((article, index, self) =>
      index === self.findIndex((a) => a.title === article.title)
    );

    // Sort by date (newest first) and limit
    const sortedNews = uniqueNews
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 25);

    console.log(`Found ${sortedNews.length} construction-related news articles`);
    return sortedNews;
  } catch (error) {
    console.error('Error fetching construction news:', error);
    return [];
  }
}

// Fetch news for a specific ticker (with filtering)
export async function fetchNewsForTicker(ticker: string): Promise<NewsArticle[]> {
  const items = await fetchTickerNews(ticker);
  return items
    .map(convertToNewsArticle)
    .filter((article): article is NewsArticle =>
      article !== null && isConstructionRelated(article.title)
    )
    .slice(0, 5);
}
