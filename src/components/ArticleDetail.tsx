import React from 'react';
import { ArrowLeft, Clock, MapPin, User, Tag, Share2, Bookmark } from 'lucide-react';
import { Button } from './ui/form-input';
import { LazyImage } from './LazyImage';
import { Article } from './NewsCard';
import { useReadArticles } from '../hooks/useLocalStorage';
import { cn } from '../lib/utils';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  distance?: number;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, distance }) => {
  const { isRead, markAsRead } = useReadArticles();
  const isArticleRead = isRead(article.id);

  React.useEffect(() => {
    if (!isArticleRead) {
      markAsRead(article.id);
    }
  }, [article.id, isArticleRead, markAsRead]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <article className="max-w-4xl mx-auto slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Breaking news indicator */}
      {article.isBreaking && (
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-2 bg-news-urgent text-white rounded-lg font-bold text-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          BREAKING NEWS
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-news-unread mb-4 leading-tight">
        {article.title}
      </h1>

      {/* Summary */}
      <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
        {article.summary}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-medium">{article.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{article.readTime} minute read</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{article.location.city}, {article.location.country}</span>
          {distance !== undefined && (
            <span className="font-medium">
              ({distance < 1 ? '<1 km' : `${Math.round(distance)} km`} away)
            </span>
          )}
        </div>
      </div>

      {/* Category and Tags */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          <Tag className="w-4 h-4" />
          {article.category}
        </span>
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Image */}
      <div className="mb-8">
        <LazyImage
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-64 sm:h-96 rounded-lg"
        />
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-6 text-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Article read and synced in background
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Article
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};