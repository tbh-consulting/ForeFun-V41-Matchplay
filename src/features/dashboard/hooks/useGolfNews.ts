import { useState, useEffect } from 'react';
import { RssItem, parseRssFeed } from '../utils/rss-parser';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const GOLF_RSS_URL = 'https://golf.com/feed/';

export function useGolfNews() {
  const [news, setNews] = useState<RssItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(CORS_PROXY + encodeURIComponent(GOLF_RSS_URL));
      if (!response.ok) throw new Error('Failed to fetch news feed');
      
      const xml = await response.text();
      const items = await parseRssFeed(xml);
      
      setNews(items.slice(0, 5)); // Only show latest 5 news items
    } catch (err) {
      console.error('Error fetching golf news:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch news'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    isLoading,
    error,
    refresh: fetchNews
  };
}