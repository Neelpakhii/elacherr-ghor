const STORAGE_KEY = "elacher-ghor-recent-search-products";
const MAX_RECENT_PRODUCTS = 3;

export const getRecentlySearchedProductIds = () => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(stored) ? stored.filter((id) => typeof id === "string").slice(0, MAX_RECENT_PRODUCTS) : [];
    } catch {
        return [];
    }
};

export const recordRecentlySearchedProduct = (productId) => {
    if (typeof productId !== "string" || !productId) return [];

    const next = [productId, ...getRecentlySearchedProductIds().filter((id) => id !== productId)].slice(0, MAX_RECENT_PRODUCTS);
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("elacher:recent-search-products-change", { detail: next }));
    } catch {
        // The feature is optional when browser storage is unavailable.
    }
    return next;
};

export const clearRecentlySearchedProducts = () => {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("elacher:recent-search-products-change", { detail: [] }));
    } catch {
        // The feature is optional when browser storage is unavailable.
    }
    return [];
};
