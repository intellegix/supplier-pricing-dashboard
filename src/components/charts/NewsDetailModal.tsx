import { X, ExternalLink, Clock, Newspaper, Link2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NewsArticle } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  relatedArticles?: NewsArticle[];
  onClose: () => void;
}

export function NewsDetailModal({ article, relatedArticles = [], onClose }: NewsDetailModalProps) {
  if (!article) return null;

  const handleOpenArticle = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.url);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Get related articles from the same source (excluding current article)
  const sameSourceArticles = relatedArticles
    .filter(a => a.source === article.source && a.title !== article.title)
    .slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="terminal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-terminal-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary">News Article</h2>
                <p className="text-sm text-text-muted">Construction Market Intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-terminal-surface border border-terminal-border flex items-center justify-center hover:bg-terminal-border transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Article Content */}
          <div className="p-6">
            {/* Source & Time */}
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 rounded-lg text-sm font-mono uppercase">
                {article.source}
              </span>
              <div className="flex items-center gap-2 text-sm text-text-muted font-mono">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(article.published_at)}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display text-2xl font-bold text-text-primary mb-6 leading-tight">
              {article.title}
            </h3>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleOpenArticle}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-cyan text-terminal-bg font-bold rounded-lg hover:bg-accent-cyan/90 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Read Full Article
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-terminal-surface border border-terminal-border rounded-lg hover:bg-terminal-border transition-colors"
                title="Copy link"
              >
                <Link2 className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Source Info */}
            <div className="p-4 bg-terminal-surface rounded-lg mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-accent-cyan" />
                <span className="font-mono text-sm text-text-primary">Source Information</span>
              </div>
              <p className="text-sm text-text-secondary">
                This article is provided by <span className="text-accent-cyan">{article.source}</span>.
                Click "Read Full Article" to view the complete story on their website.
              </p>
            </div>

            {/* Related Articles from Same Source */}
            {sameSourceArticles.length > 0 && (
              <div className="border-t border-terminal-border pt-6">
                <h4 className="text-sm font-mono uppercase text-text-secondary mb-4">
                  More from {article.source}
                </h4>
                <div className="space-y-3">
                  {sameSourceArticles.map((related, index) => (
                    <a
                      key={index}
                      href={related.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-terminal-surface rounded-lg hover:bg-terminal-border transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-text-primary group-hover:text-accent-cyan transition-colors line-clamp-2">
                          {related.title}
                        </p>
                        <ExternalLink className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-text-muted font-mono mt-1">
                        {formatRelativeTime(related.published_at)}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
