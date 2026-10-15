const basePath = import.meta.env.BASE_URL;

// Content JSON and images are served by the frontend as static files.
export const ASSET_BASE_URL = basePath.replace(/\/$/, "");
export const HOME_DATA_URL = `${basePath}data/home.json`;
export const ABOUT_URL = `${basePath}data/about.json`;
export const SHOP_URL = `${basePath}data/shop.json`;
export const PRODUCT_DETAILS_URL = `${basePath}data/products/`;
export const EDITORIAL_DATA_URL = `${basePath}data/editorial.json`;

export const getAppHref = (href) => {
    if (typeof href !== "string" || !href) return basePath;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) || href.startsWith("#")) return href;

    const appPath = href.startsWith("/") ? href : `/${href}`;
    return `${ASSET_BASE_URL}${appPath}`;
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    return `${ASSET_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};
