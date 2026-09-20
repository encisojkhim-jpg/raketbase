const https = require('https');

// In-memory cache: stores { rates, timestamp } so we hit the external API at most
// once per hour.  Falls back to hardcoded rates when the network is unreachable.
let cache = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const FALLBACK_RATES = {
  PHP: 1,
  USD: 0.0178,
  EUR: 0.0163,
  JPY: 2.68,
  GBP: 0.014,
  SGD: 0.024,
};

function fetchRatesFromApi() {
  return new Promise((resolve, reject) => {
    https
      .get('https://open.er-api.com/v6/latest/PHP', (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.result !== 'success' || !json.rates) {
              return reject(new Error('Unexpected API response'));
            }
            resolve(json.rates);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

// GET /api/v1/rates
// Returns exchange rates relative to PHP.  The response always contains at
// least { PHP, USD, EUR, JPY, GBP, SGD } — either live or fallback.
exports.getRates = async (req, res) => {
  try {
    // Serve from cache if still fresh
    if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, source: 'cache', data: cache.rates });
    }

    // Try fetching live rates
    const allRates = await fetchRatesFromApi();
    // Only expose the currencies the platform cares about
    const rates = {
      PHP: 1,
      USD: allRates.USD,
      EUR: allRates.EUR,
      JPY: allRates.JPY,
      GBP: allRates.GBP,
      SGD: allRates.SGD,
    };
    cache = { rates, timestamp: Date.now() };
    return res.status(200).json({ success: true, source: 'live', data: rates });
  } catch (err) {
    console.error('Currency API error, using fallback rates:', err.message);
    // Return hardcoded fallback so the frontend never breaks
    return res.status(200).json({ success: true, source: 'fallback', data: FALLBACK_RATES });
  }
};
