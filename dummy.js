// Path: dummy.js

const API_URL = 'http://localhost:3000';


async function fetchEndpoint(endpoint) {
  console.log(`\n📊 Fetching ${endpoint}...`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}


async function addToWatchlist(symbol) {
  console.log(`\n🔖 Adding ${symbol} to watchlist...`);
  
  try {
    const response = await fetch(`${API_URL}/api/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Function to remove a stock from watchlist using DELETE
async function removeFromWatchlist(symbol) {
  console.log(`\n🗑️ Removing ${symbol} from watchlist...`);
  
  try {
    const response = await fetch(`${API_URL}/api/watchlist/${symbol}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Main function to test all endpoints
async function testAllEndpoints() {
  console.log('🚀 Starting API test for', API_URL);
  
  // Test basic endpoints
  await fetchEndpoint('/');
  await fetchEndpoint('/api/stocks');
  await fetchEndpoint('/api/stocks/NIFTY50');
  await fetchEndpoint('/api/stocks/AAPL/history');
  await fetchEndpoint('/api/stocks/AAPL/history?range=5d');
  await fetchEndpoint('/api/stocks/AAPL/intraday');
  await fetchEndpoint('/api/stocks/AAPL/news');
  await fetchEndpoint('/api/market/summary');
  
  // Test watchlist functionality
  await fetchEndpoint('/api/watchlist');
  await addToWatchlist('AAPL');
  await addToWatchlist('MSFT');
  await fetchEndpoint('/api/watchlist');
  await removeFromWatchlist('AAPL');
  await fetchEndpoint('/api/watchlist');
  
  console.log('\n🏁 API testing completed!');
}

// Run all tests
testAllEndpoints();

// If you want to test specific endpoints only:
// fetchEndpoint('/api/stocks');
// fetchEndpoint('/api/stocks/GOOGL');
// fetchEndpoint('/api/market/summary');