import React from 'react';
import { Clock, MapPin, User, Tag } from 'lucide-react';
import { useReadArticles } from '../hooks/useLocalStorage';
import { cn } from '../lib/utils';
import { CanvasImage } from './CanvasImage';
import { useBackgroundTask } from '../hooks/useBackgroundTask';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  readTime: number;
  isBreaking: boolean;
  tags: string[];
}

interface NewsCardProps {
  article: Article;
  onClick: (article: Article) => void;
  distance?: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick, distance }) => {
  const { isRead, markAsRead } = useReadArticles();
  const { scheduleTask } = useBackgroundTask();
  const isArticleRead = isRead(article.id);

  const handleClick = () => {
    if (!isArticleRead) {
      // Schedule analytics processing in background
      scheduleTask({
        task: () => {
          markAsRead(article.id);
          // Other analytics processing can go here
        },
        timeout: 2000,
        priority: 'low'
      });
    }
    onClick(article);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <article 
      className={cn(
        "news-card cursor-pointer group fade-in transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10",
        isArticleRead && "opacity-75"
      )}
      onClick={handleClick}
    >
      {/* Breaking news indicator */}
      {article.isBreaking && (
        <div className="absolute top-3 left-3 z-10 bg-news-urgent text-white px-2 py-1 rounded-full text-xs font-bold">
          BREAKING
        </div>
      )}

      {/* Image with Canvas */}
      <div className="relative h-48 sm:h-56">
        <CanvasImage
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full rounded-t-lg"
          effects={{
            grayscale: isArticleRead,
            brightness: isArticleRead ? 0.8 : 1
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category and read status */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <Tag className="w-3 h-3" />
            {article.category}
          </span>
          {isArticleRead && (
            <span className="text-xs text-news-read font-medium">Read</span>
          )}
        </div>

        {/* Title */}
        <h2 className={cn(
          "font-bold text-lg leading-tight group-hover:text-primary transition-colors",
          isArticleRead ? "text-news-read" : "text-news-unread"
        )}>
          {article.title}
        </h2>

        {/* Summary */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {article.summary}
        </p>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.readTime} min read</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{article.location.city}, {article.location.country}</span>
            </div>
            {distance !== undefined && (
              <span className="font-medium">
                {distance < 1 ? '<1 km' : `${Math.round(distance)} km`} away
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              +{article.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </article>
  );
};