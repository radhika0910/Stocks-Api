// Path: app.js
// mock-stock-api/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// In-memory database for our mock stocks
const stockData = {
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financials' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
    { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples' }
  ],
  priceHistory: {},
  news: {}
};

// Initialize price history with random data for the past 30 days
function initializePriceHistory() {
  const now = new Date();
  
  stockData.stocks.forEach(stock => {
    // Set a base price for each stock that makes sense for its characteristics
    let basePrice;
    switch(stock.symbol) {
      case 'AAPL': basePrice = 175; break;
      case 'MSFT': basePrice = 330; break;
      case 'AMZN': basePrice = 140; break;
      case 'GOOGL': basePrice = 175; break;
      case 'META': basePrice = 300; break;
      case 'TSLA': basePrice = 250; break;
      case 'JPM': basePrice = 150; break;
      case 'V': basePrice = 240; break;
      case 'JNJ': basePrice = 160; break;
      case 'WMT': basePrice = 65; break;
      default: basePrice = 100;
    }
    
    stockData.priceHistory[stock.symbol] = [];
    
    // Generate 30 days of price history
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Add some randomness but with a general trend
      const randomFactor = 0.98 + Math.random() * 0.04; // Between 0.98 and 1.02
      if (i === 30) {
        // First day uses base price
        stockData.priceHistory[stock.symbol].push({
          date: date.toISOString().split('T')[0],
          open: basePrice,
          high: basePrice * (1 + Math.random() * 0.02),
          low: basePrice * (1 - Math.random() * 0.02),
          close: basePrice * randomFactor,
          volume: Math.floor(1000000 + Math.random() * 10000000)
        });
      } else {
        // Following days use previous day's close as reference
        const prevDay = stockData.priceHistory[stock.symbol][stockData.priceHistory[stock.symbol].length - 1];
        const prevClose = prevDay.close;
        const open = prevClose * (0.99 + Math.random() * 0.02);
        const close = open * randomFactor;
        const high = Math.max(open, close) * (1 + Math.random() * 0.015);
        const low = Math.min(open, close) * (1 - Math.random() * 0.015);
        
        stockData.priceHistory[stock.symbol].push({
          date: date.toISOString().split('T')[0],
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: Math.floor(1000000 + Math.random() * 10000000)
        });
      }
    }
  });
}

// Initialize news data
function initializeNewsData() {
  const newsTemplates = [
    "{company} Reports Strong Quarterly Earnings, Exceeding Analyst Expectations",
    "{company} Announces New Product Line to Launch Next Quarter",
    "{company} CEO Discusses Future Growth Strategy in Interview",
    "{company} Expands Operations to New Markets in Asia",
    "Investors Remain Bullish on {company} Despite Market Uncertainty",
    "{company} Partners with Tech Giant for New Initiative",
    "Analysts Upgrade {company} Stock Rating to 'Buy'",
    "{company} Faces Regulatory Scrutiny Over Recent Business Practices",
    "{company} Announces Stock Split, Shareholders Approve",
    "{company} Invests Heavily in Sustainable Technology"
  ];
  
  stockData.stocks.forEach(stock => {
    stockData.news[stock.symbol] = [];
    
    // Generate 5 random news items for each stock
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Random day in the last week
      
      const templateIndex = Math.floor(Math.random() * newsTemplates.length);
      const headline = newsTemplates[templateIndex].replace("{company}", stock.name);
      
      stockData.news[stock.symbol].push({
        id: `${stock.symbol}-news-${i}`,
        date: date.toISOString(),
        headline: headline,
        source: ["Bloomberg", "Reuters", "CNBC", "Financial Times", "Wall Street Journal"][Math.floor(Math.random() * 5)],
        url: `https://example.com/news/${stock.symbol.toLowerCase()}/${i}`,
        summary: `This article discusses the latest developments at ${stock.name} and what it means for investors. Analysis suggests potential impact on stock performance.`
      });
    }
  });
}

// Update current prices every minute to simulate live market
function updateCurrentPrices() {
  stockData.stocks.forEach(stock => {
    const history = stockData.priceHistory[stock.symbol];
    const lastPrice = history[history.length - 1].close;
    
    // Random change between -1.5% and +1.5%
    const changePercent = -1.5 + Math.random() * 3;
    const newPrice = parseFloat((lastPrice * (1 + changePercent / 100)).toFixed(2));
    
    // Update the last entry with new price
    history[history.length - 1].close = newPrice;
  });
}

// API Routes

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    name: "Mock Stock Market API",
    version: "1.0.0",
    endpoints: [
      { path: "/api/stocks", description: "Get list of all available stocks" },
      { path: "/api/stocks/:symbol", description: "Get details for a specific stock" },
      { path: "/api/stocks/:symbol/history", description: "Get price history for a stock" },
      { path: "/api/stocks/:symbol/intraday", description: "Get intraday price data" },
      { path: "/api/stocks/:symbol/news", description: "Get news related to a stock" },
      { path: "/api/market/summary", description: "Get overall market summary" },
      { path: "/api/watchlist", description: "Manage user watchlist (POST to add, DELETE to remove)" }
    ]
  });
});

// Get all stocks
app.get('/api/stocks', (req, res) => {
  const currentPrices = {};
  
  stockData.stocks.forEach(stock => {
    const history = stockData.priceHistory[stock.symbol];
    const lastPrice = history[history.length - 1].close;
    const prevPrice = history[history.length - 2].close;
    const change = parseFloat((lastPrice - prevPrice).toFixed(2));
    const changePercent = parseFloat(((change / prevPrice) * 100).toFixed(2));
    
    currentPrices[stock.symbol] = {
      price: lastPrice,
      change,
      changePercent,
      updatedAt: new Date().toISOString()
    };
  });
  
  res.json({
    success: true,
    data: stockData.stocks.map(stock => ({
      ...stock,
      ...currentPrices[stock.symbol]
    }))
  });
});

// Get specific stock details
app.get('/api/stocks/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = stockData.stocks.find(s => s.symbol === symbol);
  
  if (!stock) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }
  
  const history = stockData.priceHistory[symbol];
  const lastPrice = history[history.length - 1].close;
  const prevPrice = history[history.length - 2].close;
  const change = parseFloat((lastPrice - prevPrice).toFixed(2));
  const changePercent = parseFloat(((change / prevPrice) * 100).toFixed(2));
  
  // Generate market cap using price and a random multiplier
  const marketCap = parseFloat((lastPrice * (Math.random() * 5 + 10) * 1000000000).toFixed(2));
  const pe = parseFloat((15 + Math.random() * 20).toFixed(2));
  const eps = parseFloat((lastPrice / pe).toFixed(2));
  const dividend = parseFloat((lastPrice * (Math.random() * 0.03)).toFixed(2));
  const dividendYield = parseFloat(((dividend / lastPrice) * 100).toFixed(2));
  
  res.json({
    success: true,
    data: {
      ...stock,
      price: lastPrice,
      change,
      changePercent,
      marketCap,
      pe,
      eps,
      dividend,
      dividendYield,
      high52Week: parseFloat((lastPrice * 1.2).toFixed(2)),
      low52Week: parseFloat((lastPrice * 0.8).toFixed(2)),
      volume: history[history.length - 1].volume,
      avgVolume: Math.floor(history.reduce((sum, day) => sum + day.volume, 0) / history.length),
      updatedAt: new Date().toISOString()
    }
  });
});

// Get price history for a stock
app.get('/api/stocks/:symbol/history', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const { range = '1m' } = req.query;
  
  const stock = stockData.stocks.find(s => s.symbol === symbol);
  if (!stock) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }
  
  let historyData = stockData.priceHistory[symbol];
  
  // Filter based on range parameter
  switch(range) {
    case '1d':
      historyData = historyData.slice(-1);
      break;
    case '5d':
      historyData = historyData.slice(-5);
      break;
    case '1m':
      historyData = historyData.slice(-30);
      break;
    case '3m':
      // Since we only have 30 days of data, we'll just duplicate and modify slightly
      const threeMonthData = [...historyData];
      for (let i = 0; i < 2; i++) {
        const additionalData = historyData.map(day => {
          const newDate = new Date(day.date);
          newDate.setMonth(newDate.getMonth() - (i + 1));
          return {
            ...day,
            date: newDate.toISOString().split('T')[0],
            open: day.open * (0.95 + Math.random() * 0.1),
            high: day.high * (0.95 + Math.random() * 0.1),
            low: day.low * (0.95 + Math.random() * 0.1),
            close: day.close * (0.95 + Math.random() * 0.1),
          };
        });
        threeMonthData.unshift(...additionalData);
      }
      historyData = threeMonthData;
      break;
    default:
      // Use all available data
  }
  
  res.json({
    success: true,
    data: {
      symbol,
      name: stock.name,
      history: historyData
    }
  });
});

// Get intraday price data (simulated)
app.get('/api/stocks/:symbol/intraday', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  const stock = stockData.stocks.find(s => s.symbol === symbol);
  if (!stock) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }
  
  const history = stockData.priceHistory[symbol];
  const lastClose = history[history.length - 1].close;
  
  // Generate simulated intraday data based on the last closing price
  const intradayData = [];
  const now = new Date();
  const marketOpen = new Date(now);
  marketOpen.setHours(9, 30, 0, 0);
  
  // If current time is before market open, use previous day
  if (now.getHours() < 9 || (now.getHours() === 9 && now.getMinutes() < 30)) {
    marketOpen.setDate(marketOpen.getDate() - 1);
  }
  
  // Create data points for every 5 minutes
  let price = lastClose;
  for (let i = 0; i < 78; i++) { // 78 5-minute intervals in 6.5 hour trading day
    const timestamp = new Date(marketOpen);
    timestamp.setMinutes(marketOpen.getMinutes() + i * 5);
    
    // Don't generate future data points
    if (timestamp > now) break;
    
    // Random price movement
    price = price * (0.998 + Math.random() * 0.004);
    
    intradayData.push({
      timestamp: timestamp.toISOString(),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 100000)
    });
  }
  
  res.json({
    success: true,
    data: {
      symbol,
      name: stock.name,
      interval: "5min",
      intraday: intradayData
    }
  });
});

// Get news for a stock
app.get('/api/stocks/:symbol/news', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  
  const stock = stockData.stocks.find(s => s.symbol === symbol);
  if (!stock) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }
  
  res.json({
    success: true,
    data: stockData.news[symbol]
  });
});

// Get market summary
app.get('/api/market/summary', (req, res) => {
  const indices = [
    { symbol: "^DJI", name: "Dow Jones Industrial Average", price: 38000 + Math.random() * 1000 },
    { symbol: "^SPX", name: "S&P 500", price: 5000 + Math.random() * 100 },
    { symbol: "^IXIC", name: "NASDAQ Composite", price: 16000 + Math.random() * 500 }
  ];
  
  // Calculate simple market performance metrics
  const marketPerformance = indices.map(index => {
    const change = parseFloat((index.price * (Math.random() * 0.02 - 0.01)).toFixed(2));
    const changePercent = parseFloat(((change / index.price) * 100).toFixed(2));
    
    return {
      ...index,
      price: parseFloat(index.price.toFixed(2)),
      change,
      changePercent
    };
  });
  
  // Count how many stocks are up vs down
  let upCount = 0;
  let downCount = 0;
  
  stockData.stocks.forEach(stock => {
    const history = stockData.priceHistory[stock.symbol];
    const lastPrice = history[history.length - 1].close;
    const prevPrice = history[history.length - 2].close;
    
    if (lastPrice > prevPrice) upCount++;
    else downCount++;
  });
  
  res.json({
    success: true,
    data: {
      indices: marketPerformance,
      marketStats: {
        advancers: upCount,
        decliners: downCount,
        unchanged: stockData.stocks.length - upCount - downCount,
        mostActive: stockData.stocks
          .map(stock => {
            const history = stockData.priceHistory[stock.symbol];
            return {
              symbol: stock.symbol,
              name: stock.name,
              price: history[history.length - 1].close,
              volume: history[history.length - 1].volume
            };
          })
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 3)
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Simple watchlist functionality (in-memory only)
const userWatchlists = {
  "default": []
};

app.get('/api/watchlist', (req, res) => {
  const userId = req.query.userId || "default";
  
  if (!userWatchlists[userId]) {
    userWatchlists[userId] = [];
  }
  
  // Get full details for watchlist stocks
  const watchlistData = userWatchlists[userId].map(symbol => {
    const stock = stockData.stocks.find(s => s.symbol === symbol);
    if (!stock) return null;
    
    const history = stockData.priceHistory[symbol];
    const lastPrice = history[history.length - 1].close;
    const prevPrice = history[history.length - 2].close;
    const change = parseFloat((lastPrice - prevPrice).toFixed(2));
    const changePercent = parseFloat(((change / prevPrice) * 100).toFixed(2));
    
    return {
      ...stock,
      price: lastPrice,
      change,
      changePercent
    };
  }).filter(stock => stock !== null);
  
  res.json({
    success: true,
    data: watchlistData
  });
});

app.post('/api/watchlist', (req, res) => {
  const userId = req.query.userId || "default";
  const { symbol } = req.body;
  
  if (!symbol) {
    return res.status(400).json({ success: false, message: "Symbol is required" });
  }
  
  const stockSymbol = symbol.toUpperCase();
  const stock = stockData.stocks.find(s => s.symbol === stockSymbol);
  
  if (!stock) {
    return res.status(404).json({ success: false, message: "Stock not found" });
  }
  
  if (!userWatchlists[userId]) {
    userWatchlists[userId] = [];
  }
  
  if (!userWatchlists[userId].includes(stockSymbol)) {
    userWatchlists[userId].push(stockSymbol);
  }
  
  res.json({
    success: true,
    message: `${stockSymbol} added to watchlist`,
    data: userWatchlists[userId]
  });
});

app.delete('/api/watchlist/:symbol', (req, res) => {
  const userId = req.query.userId || "default";
  const symbol = req.params.symbol.toUpperCase();
  
  if (!userWatchlists[userId]) {
    return res.status(404).json({ success: false, message: "Watchlist not found" });
  }
  
  userWatchlists[userId] = userWatchlists[userId].filter(s => s !== symbol);
  
  res.json({
    success: true,
    message: `${symbol} removed from watchlist`,
    data: userWatchlists[userId]
  });
});

// Initialize data
initializePriceHistory();
initializeNewsData();

// Update prices periodically (every minute)
setInterval(updateCurrentPrices, 60000);

// Simple logger middleware to see requests in console
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Mock Stock API server running on port ${PORT}`);
  console.log(`Server started at: http://localhost:${PORT}`);
  console.log(`Try these endpoints:
  - http://localhost:${PORT}/api/stocks
  - http://localhost:${PORT}/api/stocks/AAPL
  - http://localhost:${PORT}/api/market/summary`);
});

module.exports = app;