export const getProductVariants = (product) => {
    if (Array.isArray(product?.variants) && product.variants.length) return product.variants;
    return product?.weight != null && product?.price != null
        ? [{ weight: product.weight, price: product.price, originalPrice: product.originalPrice }]
        : [];
};

export const getProductVariant = (product, weight) => (
    getProductVariants(product).find((variant) => variant.weight === weight) ||
    getProductVariants(product)[0] ||
    { weight: product?.weight || "", price: product?.price ?? 0, originalPrice: product?.originalPrice }
);

export const withProductVariant = (product, variant) => ({
    ...product,
    weight: variant.weight,
    price: variant.price,
    ...(variant.originalPrice == null ? { originalPrice: undefined } : { originalPrice: variant.originalPrice }),
});

export const getDiscountPercentage = (price, originalPrice) => {
    const current = Number(price);
    const original = Number(originalPrice);
    if (!Number.isFinite(current) || !Number.isFinite(original) || original <= current || original <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
};

export const getBagLineKey = (product) => `${product?.id || ""}::${product?.weight || ""}`;
