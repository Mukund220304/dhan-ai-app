import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
};

const CurrencyContext = createContext({ symbol: '₹', code: 'INR', format: (n) => `₹${n}`, CURRENCIES });

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹' });

  useEffect(() => {
    if (user?.preferences?.currency) {
      const c = user.preferences.currency;
      setCurrency({ code: c, symbol: CURRENCIES[c]?.symbol || '₹' });
    }
  }, [user]);

  const format = (amount) => {
    const n = parseFloat(amount) || 0;
    return `${currency.symbol}${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const updateCurrency = (code) => {
    const c = CURRENCIES[code];
    if (c) setCurrency({ code, symbol: c.symbol });
  };

  return (
    <CurrencyContext.Provider value={{ ...currency, format, updateCurrency, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
