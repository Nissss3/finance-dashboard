import React from 'react';
import { ExternalLink } from 'lucide-react';
import { MarketNews } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: MarketNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="relative h-48">
        <img
          src={news.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80'}
          alt={news.headline}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {news.source}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{news.headline}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{news.summary}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {formatDistanceToNow(new Date(news.datetime * 1000), { addSuffix: true })}
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </a>
  );
};

export default NewsCard;