import React, { useState } from 'react';
import { Menu, X, Search, Filter } from 'lucide-react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/form-input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/layout';
import { LocationFilter } from './LocationFilter';
import { NetworkStatus } from './NetworkStatus';
import { ThemeToggle } from './ThemeToggle';

interface MobileMenuProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onLocationChange: (latitude: number | null, longitude: number | null) => void;
  locationFilterEnabled: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  onLocationChange,
  locationFilterEnabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden relative overflow-hidden group"
        >
          <Menu className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Menu
            </span>
            <ThemeToggle />
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Network Status */}
          <div className="animate-fade-in">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Network Status</h3>
            <NetworkStatus />
          </div>

          {/* Search */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 transition-all duration-300 focus:scale-[1.02]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Category</h3>
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Select category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-md">
                {categories.map((category) => (
                  <SelectItem 
                    key={category} 
                    value={category}
                    className="transition-colors duration-200 hover:bg-primary/10"
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Location</h3>
            <LocationFilter
              onLocationChange={onLocationChange}
              isEnabled={locationFilterEnabled}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};