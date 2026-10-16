export const hasTrackedStock = (product) => product?.stockQty !== ""
    && product?.stockQty != null
    && Number.isFinite(Number(product.stockQty));

export const isProductOutOfStock = (product) => hasTrackedStock(product) && Number(product.stockQty) <= 0;

export const isProductAvailable = (product) => product?.available !== false && !isProductOutOfStock(product);
