import React from 'react';
import { StockQuote } from '../types';

interface MarketTickerProps {
  quotes: Record<string, StockQuote>;
}

const MarketTicker: React.FC<MarketTickerProps> = ({ quotes }) => {
  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        {Object.entries(quotes).map(([symbol, quote]) => {
          const change = quote.c - quote.pc;
          const changePercent = (change / quote.pc) * 100;
          const isPositive = change >= 0;

          return (
            <div key={symbol} className="mx-4 flex items-center">
              <span className="font-semibold">{symbol}</span>
              <span className="ml-2">${quote.c.toFixed(2)}</span>
              <span className={`ml-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketTicker;