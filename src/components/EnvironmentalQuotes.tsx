import React, { useState, useEffect } from 'react';
import { Leaf, RefreshCw } from 'lucide-react';

const EnvironmentalQuotes: React.FC = () => {
  const quotes = [
    {
      text: "The forest is not a resource for us, it is life itself. It is the only way for us to live.",
      author: "Evaristo Nugkuag"
    },
    {
      text: "In every walk with nature, one receives far more than they seek.",
      author: "John Muir"
    },
    {
      text: "The clearest way into the Universe is through a forest wilderness.",
      author: "John Muir"
    },
    {
      text: "What we are doing to the forests of the world is but a mirror reflection of what we are doing to ourselves.",
      author: "Chris Maser"
    },
    {
      text: "A nation that destroys its soils destroys itself. Forests are the lungs of our land.",
      author: "Franklin D. Roosevelt"
    },
    {
      text: "The forest is a quiet place if only the best birds sing.",
      author: "Kay Johnson"
    },
    {
      text: "Every forest is a living library of the most ancient stories on Earth.",
      author: "Unknown"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  useEffect(() => {
    const interval = setInterval(getRandomQuote, 30000); // Change quote every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Leaf className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Environmental Wisdom</h3>
        </div>
        <button 
          onClick={getRandomQuote}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Get new quote"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <blockquote className="text-lg leading-relaxed mb-3 italic">
        "{currentQuote.text}"
      </blockquote>
      <cite className="text-green-200 text-sm">— {currentQuote.author}</cite>
      
      <div className="mt-4 pt-4 border-t border-green-500/30">
        <div className="text-sm text-green-200">
          💡 <strong>Conservation Tip:</strong> Forests absorb 2.6 billion tons of CO₂ annually. 
          Every tree protected helps combat climate change and reduces fire risks.
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalQuotes;