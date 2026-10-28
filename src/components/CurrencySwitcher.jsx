import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext.jsx";
import "./CurrencySwitcher.css";

const CurrencySwitcher = () => {
    const { currency, currencyOptions, ratesLoading, ratesError, retryRates, chooseCurrency } = useCurrency();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);
    const searchRef = useRef(null);

    const filteredOptions = useMemo(() => {
        const term = query.trim().toLocaleLowerCase();
        if (!term) return currencyOptions;
        return currencyOptions.filter(({ code, name }) => `${code} ${name}`.toLocaleLowerCase().includes(term));
    }, [currencyOptions, query]);

    useEffect(() => {
        if (!open) return undefined;
        searchRef.current?.focus();
        const closeOnOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    const choose = (code) => {
        chooseCurrency(code);
        setOpen(false);
        setQuery("");
    };

    return (
        <div className="currency-switcher" ref={rootRef}>
            <button
                className="currency-switcher__trigger"
                type="button"
                aria-label={`Currency: ${currency}. Change currency`}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen((current) => !current)}
                title="Choose display currency"
                translate="no"
            >
                <span className="notranslate">{currency}</span>
                <ChevronDown size={13} aria-hidden="true" />
            </button>
            {open && (
                <div className="currency-switcher__panel" role="dialog" aria-label="Choose a currency">
                    <label className="currency-switcher__search">
                        <Search size={16} aria-hidden="true" />
                        <input
                            ref={searchRef}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search currency or code"
                            aria-label="Search currencies"
                        />
                    </label>
                    <p className="currency-switcher__hint">
                        {ratesLoading ? "Loading exchange rates…" : ratesError ? (
                            <>
                                Exchange rates could not load.
                                <button className="currency-switcher__retry" type="button" onClick={retryRates}>Try again</button>
                            </>
                        ) : `${currencyOptions.length} currencies`}
                    </p>
                    <div className="currency-switcher__list" role="listbox" aria-label="Currencies">
                        {filteredOptions.map(({ code, name }) => (
                            <button
                                className={`currency-switcher__option${currency === code ? " is-selected" : ""}`}
                                type="button"
                                role="option"
                                aria-selected={currency === code}
                                key={code}
                                onClick={() => choose(code)}
                            >
                                <span className="currency-switcher__code notranslate" translate="no">{code}</span>
                                <span className="currency-switcher__name">{name}</span>
                                {currency === code && <Check size={15} aria-hidden="true" />}
                            </button>
                        ))}
                        {filteredOptions.length === 0 && <p className="currency-switcher__empty">No currency found.</p>}
                    </div>
                    <p className="currency-switcher__footnote">Display estimate using daily reference rates.</p>
                </div>
            )}
        </div>
    );
};

export default CurrencySwitcher;
