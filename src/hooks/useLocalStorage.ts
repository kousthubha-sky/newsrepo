import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useReadArticles = () => {
  const [readArticles, setReadArticles] = useLocalStorage<string[]>('readArticles', []);
  
  const markAsRead = (articleId: string) => {
    setReadArticles(prev => {
      if (prev.includes(articleId)) return prev;
      const updated = [...prev, articleId];
      
      // Simulate background sync
      setTimeout(() => {
        console.log(`Background sync: Article ${articleId} marked as read`);
      }, 1000);
      
      return updated;
    });
  };

  const isRead = (articleId: string) => readArticles.includes(articleId);

  const unmarkAsRead = (articleId: string) => {
    setReadArticles(prev => prev.filter(id => id !== articleId));
  };

  return {
    readArticles,
    markAsRead,
    isRead,
    unmarkAsRead,
  };
};