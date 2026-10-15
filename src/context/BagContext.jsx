import { useCallback, useMemo, useState } from "react";
import BagContext from "./bagContext.js";

const STORAGE_KEY = "elacher-ghor-bag";

const readSavedItems = () => {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
};

export const BagProvider = ({ children }) => {
    const [items, setItems] = useState(readSavedItems);

    const persist = useCallback((nextItems) => {
        setItems(nextItems);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
        } catch {
            // The bag remains usable for this session if storage is unavailable.
        }
    }, []);

    const addItem = useCallback((product, quantity = 1) => {
        if (!product?.id) return;
        const amount = Math.max(1, Number(quantity) || 1);
        setItems((currentItems) => {
            const existing = currentItems.find((item) => item.product.id === product.id);
            const nextItems = existing
                ? currentItems.map((item) => item.product.id === product.id
                    ? { ...item, quantity: item.quantity + amount }
                    : item)
                : [...currentItems, { product, quantity: amount }];
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
            } catch {
                // Keep the in-memory bag available when storage is unavailable.
            }
            return nextItems;
        });
    }, []);

    const removeItem = useCallback((productId) => {
        persist(items.filter((item) => item.product.id !== productId));
    }, [items, persist]);

    const setQuantity = useCallback((productId, quantity) => {
        const amount = Math.max(1, Number(quantity) || 1);
        persist(items.map((item) => item.product.id === productId
            ? { ...item, quantity: amount }
            : item));
    }, [items, persist]);

    const clearBag = useCallback(() => persist([]), [persist]);

    const value = useMemo(() => ({
        items,
        addItem,
        removeItem,
        setQuantity,
        clearBag,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        subtotal: items.reduce((total, item) => total + Number(item.product.price || 0) * item.quantity, 0),
    }), [items, addItem, removeItem, setQuantity, clearBag]);

    return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
};
