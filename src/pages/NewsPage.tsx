import { useState } from 'react';
import { ExternalLink, Clock, Newspaper, RefreshCw, Wifi } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { formatRelativeTime } from '../utils/formatters';
import { NewsDetailModal } from '../components/charts/NewsDetailModal';
import { motion } from 'framer-motion';
import type { NewsArticle } from '../types';

export function NewsPage() {
  const { news, commodities, suppliers, isLoadingNews, fetchNews } = useDashboardStore();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Check if we have real news (Yahoo Finance URLs contain finance.yahoo.com)
  const hasRealNews = news.some((article) => article.url.includes('yahoo.com') || article.url.includes('finance.'));

  // Combine all news from different sources
  const allNews = [
    ...news,
    ...commodities.flatMap((c) => c.news),
    ...suppliers.flatMap((s) => s.news)
  ]
    // Remove duplicates by title
    .filter((article, index, self) =>
      index === self.findIndex((a) => a.title === article.title)
    )
    // Sort by date
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="terminal-card p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                Construction Market News
              </h2>
              <p className="text-sm text-text-muted font-mono">
                {allNews.length} articles from industry sources
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasRealNews && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/30 rounded-full">
                <Wifi className="w-3 h-3 text-accent-green" />
                <span className="text-xs font-mono text-accent-green">LIVE</span>
              </div>
            )}
            <button
              onClick={() => fetchNews()}
              disabled={isLoadingNews}
              className="btn-terminal flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingNews ? 'animate-spin' : ''}`} />
              {isLoadingNews ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allNews.map((article, index) => (
          <motion.div
            key={`${article.title}-${index}`}
            onClick={() => setSelectedArticle(article)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="terminal-card p-4 group hover:border-accent-cyan/30 transition-all duration-300 cursor-pointer"
          >
            {/* Source Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 rounded text-[10px] font-mono uppercase">
                {article.source}
              </span>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-accent-cyan transition-colors" />
            </div>

            {/* Title */}
            <h3 className="font-medium text-text-primary mb-3 line-clamp-2 group-hover:text-accent-cyan transition-colors">
              {article.title}
            </h3>

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(article.published_at)}
            </div>

            {/* Hover glow effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.05) 0%, transparent 70%)'
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {allNews.length === 0 && (
        <div className="terminal-card p-12 text-center">
          <Newspaper className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">No news articles available</p>
        </div>
      )}

      {/* News Detail Modal */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          relatedArticles={allNews}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
