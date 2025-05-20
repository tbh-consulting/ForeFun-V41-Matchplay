import React from 'react';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { useGolfNews } from '../../hooks/useGolfNews';
import { Button } from '@/components/shared/Button';

export function GolfNewsFeed() {
  const { news, isLoading, error, refresh } = useGolfNews();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">Latest Golf News</h2>
            </div>
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        </div>
        <div className="p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0 border-b last:border-0 border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">Latest Golf News</h2>
            </div>
            <Button variant="secondary" onClick={refresh} className="!p-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">Unable to load news at this time.</p>
          <Button variant="secondary" onClick={refresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">Latest Golf News</h2>
          </div>
          <Button variant="secondary" onClick={refresh} className="!p-2">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {news.map((item) => (
          <a
            key={item.guid || item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 hover:bg-gray-50/80 transition-all duration-200 group"
          >
            <article className="space-y-2">
              <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors duration-200 line-clamp-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <time dateTime={item.pubDate}>{item.pubDate}</time>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </article>
          </a>
        ))}
      </div>
    </div>
  );
}