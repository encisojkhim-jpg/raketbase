import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const SYMBOLS = { PHP: '₱', USD: '$', EUR: '€', JPY: '¥', GBP: '£', SGD: 'S$' };
const SUPPORTED = Object.keys(SYMBOLS);

const CurrencyContext = createContext({
  currency: 'PHP',
  rates: null,
  setCurrency: () => {},
  convertAmount: () => '',
  formatPhp: () => '',
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('raketbase_currency') || 'PHP';
  });
  const [rates, setRates] = useState(null);

  // Persist selection
  function setCurrency(c) {
    setCurrencyState(c);
    localStorage.setItem('raketbase_currency', c);
  }

  // Fetch rates once on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/rates`);
        const body = await res.json();
        if (!cancelled && body.success) setRates(body.data);
      } catch {
        // Rates unavailable — convertAmount will just show PHP
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Convert a PHP amount to the currently selected currency.
  // Returns a formatted string like "$270.00 USD" or "₱15,000 PHP".
  const convertAmount = useCallback(
    (phpAmount) => {
      const num = Number(phpAmount) || 0;
      if (!rates || currency === 'PHP') {
        return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
      const rate = rates[currency];
      if (!rate) return `₱${num.toLocaleString()}`;
      const converted = num * rate;
      const symbol = SYMBOLS[currency] || '';
      // JPY has no decimals
      const decimals = currency === 'JPY' ? 0 : 2;
      return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`;
    },
    [rates, currency]
  );

  // Always-PHP formatter for tooltips
  const formatPhp = useCallback((phpAmount) => {
    const num = Number(phpAmount) || 0;
    return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, rates, setCurrency, convertAmount, formatPhp, supported: SUPPORTED }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
