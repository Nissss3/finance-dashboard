import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { StockQuote } from '../types';

interface StockCardProps {
  symbol: string;
  quote: StockQuote;
}

const StockCard: React.FC<StockCardProps> = ({ symbol, quote }) => {
  const priceChange = quote.c - quote.pc;
  const percentageChange = (priceChange / quote.pc) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <p className="text-2xl font-bold mt-1">${quote.c.toFixed(2)}</p>
        </div>
        <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
          <span className="ml-1 font-semibold">
            {percentageChange.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <p>Open</p>
          <p className="font-medium">${quote.o.toFixed(2)}</p>
        </div>
        <div>
          <p>Previous Close</p>
          <p className="font-medium">${quote.pc.toFixed(2)}</p>
        </div>
        <div>
          <p>High</p>
          <p className="font-medium">${quote.h.toFixed(2)}</p>
        </div>
        <div>
          <p>Low</p>
          <p className="font-medium">${quote.l.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockCard;