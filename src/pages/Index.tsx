import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Filter, Search, RefreshCw } from 'lucide-react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/form-input';
import { NewsCard, Article } from '../components/NewsCard';
import { ArticleDetail } from '../components/ArticleDetail';
import { LocationFilter } from '../components/LocationFilter';
import { NetworkStatus } from '../components/NetworkStatus';
import { MobileMenu } from '../components/MobileMenu';
import { ThemeToggle } from '../components/ThemeToggle';
import { calculateDistance } from '../hooks/useGeolocation';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(false);
  const { toast } = useToast();

  // Load articles from JSON file
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/news.json');
        const data = await response.json();
        setArticles(data.articles);
        setLoading(false);
        toast({
          title: "News loaded",
          description: `${data.articles.length} articles available`,
        });
      } catch (error) {
        console.error('Failed to load articles:', error);
        setLoading(false);
        toast({
          title: "Error loading news",
          description: "Failed to fetch articles. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadArticles();
  }, [toast]);

  // Handle location changes
  const handleLocationChange = React.useCallback((latitude: number | null, longitude: number | null) => {
    if (latitude && longitude) {
      setUserLocation({ latitude, longitude });
      setLocationFilterEnabled(true);
    } else {
      setUserLocation(null);
      setLocationFilterEnabled(false);
    }
  }, []);

  // Calculate distances and filter articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    // Add distance calculations
    const articlesWithDistance = filtered.map(article => ({
      ...article,
      distance: userLocation
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            article.location.latitude,
            article.location.longitude
          )
        : undefined,
    }));

    // Sort by distance if location filter is enabled, otherwise by date
    if (locationFilterEnabled && userLocation) {
      return articlesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
      return articlesWithDistance.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
  }, [articles, searchTerm, categoryFilter, userLocation, locationFilterEnabled]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const unique = Array.from(new Set(articles.map(article => article.category)));
    return ['all', ...unique];
  }, [articles]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate network request delay
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "News refreshed",
        description: "Articles have been updated",
      });
    }, 1000);
  };

  if (selectedArticle) {
    const articleWithDistance = filteredArticles.find(a => a.id === selectedArticle.id);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ArticleDetail
            article={selectedArticle}
            distance={articleWithDistance?.distance}
            onBack={() => setSelectedArticle(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl animate-glow">
                <Newspaper className="w-6 h-6 text-primary animate-float" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Smart News
                </h1>
                <p className="text-sm text-muted-foreground">Location-aware news reader</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MobileMenu
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                categories={categories}
                onLocationChange={handleLocationChange}
                locationFilterEnabled={locationFilterEnabled}
              />
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Network Status - Desktop Only */}
          <div className="mb-4 hidden lg:block animate-fade-in">
            <NetworkStatus />
          </div>

          {/* Search and Filters - Desktop Only */}
          <div className="hidden lg:flex flex-col sm:flex-row gap-4 animate-slide-up">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Select category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover/95 backdrop-blur-md border border-border/50 shadow-xl animate-slide-down">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="transition-all duration-200 hover:bg-primary/10 hover:scale-[1.02] cursor-pointer"
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <LocationFilter
                onLocationChange={handleLocationChange}
                isEnabled={locationFilterEnabled}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="news-card">
                <div className="h-48 sm:h-56 shimmer rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 shimmer rounded w-1/3" />
                  <div className="h-6 shimmer rounded" />
                  <div className="h-4 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No articles available at the moment'}
            </p>
          </div>
        ) : (
          <>
            {/* Results summary */}
            <div className="mb-6 text-sm text-muted-foreground animate-fade-in">
              Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              {locationFilterEnabled && ' sorted by distance'}
              {searchTerm && ` matching "${searchTerm}"`}
              {categoryFilter !== 'all' && ` in ${categoryFilter}`}
            </div>

            {/* Articles grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="animate-bounce-in hover:animate-float"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <NewsCard
                    article={article}
                    distance={article.distance}
                    onClick={setSelectedArticle}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;