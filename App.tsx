import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockQuote, MarketNews, StockSymbol } from './types';
import StockCard from './components/StockCard';
import NewsCard from './components/NewsCard';
import MarketTicker from './components/MarketTicker';
import { Search, TrendingUp, Newspaper, BarChart3, X } from 'lucide-react';

const FINNHUB_API_KEY = 'api-key-here';
const FINNHUB_API = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: { token: FINNHUB_API_KEY }
});

function App() {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [news, setNews] = useState<MarketNews[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StockSymbol[]>([]);
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    quote: StockQuote;
    profile?: any;
    news?: MarketNews[];
  } | null>(null);

  const majorIndices = ['SPY', 'QQQ', 'DIA', 'IWM'];

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const responses = await Promise.all(
          majorIndices.map(symbol => 
            FINNHUB_API.get(`/quote`, { params: { symbol } })
          )
        );
        
        const newQuotes = responses.reduce((acc, response, index) => {
          acc[majorIndices[index]] = response.data;
          return acc;
        }, {} as Record<string, StockQuote>);
        
        setQuotes(newQuotes);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await FINNHUB_API.get('/news', {
          params: { category: 'general' }
        });
        setNews(response.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchQuotes();
    fetchNews();

    const interval = setInterval(fetchQuotes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await FINNHUB_API.get('/search', {
        params: { q: term }
      });
      setSearchResults(response.data.result.slice(0, 5));
    } catch (error) {
      console.error('Error searching symbols:', error);
    }
  };

  const handleStockSelect = async (symbol: string) => {
    try {
      const [quoteRes, profileRes, newsRes] = await Promise.all([
        FINNHUB_API.get(`/quote`, { params: { symbol } }),
        FINNHUB_API.get(`/stock/profile2`, { params: { symbol } }),
        FINNHUB_API.get(`/company-news`, { 
          params: { 
            symbol,
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
          }
        })
      ]);

      setSelectedStock({
        symbol,
        quote: quoteRes.data,
        profile: profileRes.data,
        news: newsRes.data.slice(0, 5)
      });
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <MarketTicker quotes={quotes} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Market Dashboard</h1>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-10">
                {searchResults.map((result) => (
                  <div
                    key={result.symbol}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleStockSelect(result.symbol)}
                  >
                    <div className="font-medium">{result.symbol}</div>
                    <div className="text-sm text-gray-600">{result.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedStock && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center">
                  {selectedStock.profile?.logo && (
                    <img 
                      src={selectedStock.profile.logo} 
                      alt={`${selectedStock.symbol} logo`}
                      className="w-12 h-12 mr-4 rounded"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStock.symbol}</h2>
                    <p className="text-gray-600">{selectedStock.profile?.name}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Current Price</p>
                <p className="text-2xl font-bold">${selectedStock.quote.c.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Change</p>
                <p className={`text-2xl font-bold ${
                  selectedStock.quote.c - selectedStock.quote.pc >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {((selectedStock.quote.c - selectedStock.quote.pc) / selectedStock.quote.pc * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Market Cap</p>
                <p className="text-2xl font-bold">
                  ${(selectedStock.profile?.marketCapitalization || 0).toLocaleString()}M
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Volume</p>
                <p className="text-2xl font-bold">{selectedStock.quote.t.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Company Profile</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Industry:</span> {selectedStock.profile?.finnhubIndustry}</p>
                  <p><span className="font-medium">Exchange:</span> {selectedStock.profile?.exchange}</p>
                  <p><span className="font-medium">IPO:</span> {selectedStock.profile?.ipo}</p>
                  <p className="line-clamp-4">{selectedStock.profile?.description}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Recent News</h3>
                <div className="space-y-4">
                  {selectedStock.news?.map((item) => (
                    <a 
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:bg-gray-50 p-2 rounded"
                    >
                      <p className="font-medium line-clamp-2">{item.headline}</p>
                      <p className="text-sm text-gray-600">{new Date(item.datetime * 1000).toLocaleDateString()}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {majorIndices.map((symbol) => (
            quotes[symbol] && <StockCard key={symbol} symbol={symbol} quote={quotes[symbol]} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Market Performance
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Object.entries(quotes).map(([symbol, quote]) => ({
                    name: symbol,
                    price: quote.c,
                    change: ((quote.c - quote.pc) / quote.pc) * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="change" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Newspaper className="w-6 h-6 mr-2" />
                Market News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Market Summary
              </h2>
              <div className="space-y-4">
                {Object.entries(quotes).map(([symbol, quote]) => {
                  const change = quote.c - quote.pc;
                  const changePercent = (change / quote.pc) * 100;
                  return (
                    <div key={symbol} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">{symbol}</div>
                        <div className="text-sm text-gray-600">${quote.c.toFixed(2)}</div>
                      </div>
                      <div className={`text-right ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <div>{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%</div>
                        <div className="text-sm">{change >= 0 ? '+' : ''}${change.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;