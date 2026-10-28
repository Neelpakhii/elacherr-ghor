import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CurrencyContext = createContext(null);
const CURRENCY_STORAGE_KEY = "elacher-ghor-currency";
const LANGUAGE_STORAGE_KEY = "elacher-ghor-language";
// Bump the cache key so older cached responses with an incompatible shape are ignored.
const RATE_STORAGE_KEY = "elacher-ghor-reference-rates-v2";
const RATES_URL = "https://api.frankfurter.dev/v2/rates?base=INR";
const RATE_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const PRICE_NUMBER_LOCALE = "en-IN";

const readStorage = (key, fallback) => {
    try {
        return window.localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
};

const readRateCache = () => {
    try {
        const cache = JSON.parse(window.localStorage.getItem(RATE_STORAGE_KEY) || "null");
        const rates = cache?.rates;
        const hasUsableRates = rates && typeof rates === "object" &&
            rates.INR === 1 && Object.entries(rates).some(([code, rate]) =>
                code !== "INR" && /^[A-Z]{3}$/.test(code) && Number.isFinite(Number(rate)) && Number(rate) > 0
            );
        if (hasUsableRates && cache?.savedAt && Date.now() - cache.savedAt < RATE_CACHE_MAX_AGE) return cache;
    } catch {
        // Ignore stale or unavailable browser storage and refresh below.
    }
    return null;
};

const localeForLanguage = (language) => {
    const regions = { en: "IN", bn: "IN", gu: "IN", hi: "IN", kn: "IN", ml: "IN", mr: "IN", ne: "NP", pa: "IN", sd: "IN", ta: "IN", te: "IN", ur: "IN" };
    return `${language || "en"}-${regions[language] || "IN"}`;
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => readStorage(CURRENCY_STORAGE_KEY, "INR"));
    const [language, setLanguage] = useState(() => readStorage(LANGUAGE_STORAGE_KEY, "en"));
    const [rateData, setRateData] = useState(readRateCache);
    const [ratesLoading, setRatesLoading] = useState(() => !readRateCache());
    const [ratesError, setRatesError] = useState(false);

    const loadRates = useCallback(async (signal) => {
        const cached = readRateCache();
        if (cached) {
            setRateData(cached);
            setRatesLoading(false);
            setRatesError(false);
            return;
        }

        setRatesLoading(true);
        setRatesError(false);
        try {
            const response = await fetch(RATES_URL, { signal, cache: "no-store" });
            if (!response.ok) throw new Error("Exchange rates are temporarily unavailable.");
            const rows = await response.json();
            if (!Array.isArray(rows)) throw new Error("Unexpected exchange rate response.");
            const nextRates = Object.fromEntries(rows
                .map((row) => [String(row.quote || row.currency || "").toUpperCase(), Number(row.rate)])
                .filter(([code, rate]) => /^[A-Z]{3}$/.test(code) && Number.isFinite(rate) && rate > 0));
            if (Object.keys(nextRates).length < 5) throw new Error("Exchange rate response did not contain usable currencies.");
            nextRates.INR = 1;
            const nextData = { rates: nextRates, date: rows[0]?.date || "", savedAt: Date.now() };
            setRateData(nextData);
            try {
                window.localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(nextData));
            } catch {
                // The latest rates remain available for this visit.
            }
        } catch (error) {
            if (error.name !== "AbortError") setRatesError(true);
        } finally {
            if (!signal?.aborted) setRatesLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        loadRates(controller.signal);
        return () => {
            controller.abort();
        };
    }, [loadRates]);

    useEffect(() => {
        const handleLanguageChange = (event) => {
            const nextLanguage = event.detail?.language || "en";
            setLanguage(nextLanguage);
            try {
                window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
            } catch {
                // Locale follows the selected widget language for this visit.
            }
        };
        window.addEventListener("elacher:language-change", handleLanguageChange);
        return () => window.removeEventListener("elacher:language-change", handleLanguageChange);
    }, []);

    const chooseCurrency = useCallback((nextCurrency) => {
        if (!rateData?.rates?.[nextCurrency]) return;
        setCurrency(nextCurrency);
        try {
            window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
        } catch {
            // Currency remains selected for this visit.
        }
    }, [rateData]);

    const activeCurrency = rateData?.rates?.[currency] ? currency : "INR";

    const formatPrice = useCallback((inrAmount) => {
        const amount = Number(inrAmount || 0);
        const rate = rateData?.rates?.[activeCurrency];
        const converted = rate ? amount * rate : amount;
        const displayCurrency = rate ? activeCurrency : "INR";
        try {
            // Keep price formatting independent from the translated page locale.
            // Language translation must not change the selected currency or its
            // number format; only the currency selector controls converted prices.
            return new Intl.NumberFormat(PRICE_NUMBER_LOCALE, {
                style: "currency",
                currency: displayCurrency,
                maximumFractionDigits: 2,
            }).format(converted);
        } catch {
            return `${displayCurrency} ${converted.toFixed(2)}`;
        }
    }, [activeCurrency, rateData]);

    const currencyOptions = useMemo(() => {
        const codes = Object.keys(rateData?.rates || { INR: 1 }).sort((a, b) => a.localeCompare(b));
        const displayNames = (() => {
            try { return new Intl.DisplayNames([localeForLanguage(language)], { type: "currency" }); }
            catch { return null; }
        })();
        return codes.map((code) => {
            let name = code;
            try {
                name = displayNames?.of(code) || code;
            } catch {
                // Some rate-provider codes are not recognized by this browser's
                // Intl data; keep those selectable by displaying the ISO code.
            }
            return { code, name };
        });
    }, [language, rateData]);

    const value = useMemo(() => ({
        currency: activeCurrency,
        language,
        currencyOptions,
        ratesLoading,
        ratesError,
        retryRates: () => loadRates(undefined),
        rateDate: rateData?.date || "",
        chooseCurrency,
        formatPrice,
    }), [activeCurrency, language, currencyOptions, ratesLoading, ratesError, rateData, chooseCurrency, formatPrice, loadRates]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency must be used inside CurrencyProvider.");
    return context;
};
