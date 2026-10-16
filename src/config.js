const basePath = import.meta.env.BASE_URL;

// Content JSON and images are served by the frontend as static files.
export const ASSET_BASE_URL = basePath.replace(/\/$/, "");
export const HOME_DATA_URL = `${basePath}data/home.json`;
export const ABOUT_URL = `${basePath}data/about.json`;
export const SHOP_URL = `${basePath}data/shop.json`;
export const PRODUCT_DETAILS_URL = `${basePath}data/products/`;
export const EDITORIAL_DATA_URL = `${basePath}data/editorial.json`;
export const ADMIN_SETTINGS_URL = `${basePath}data/admin-settings.json`;

// These assets were converted from PNG to WebP. Map old URLs too, because an
// admin browser draft can outlive the original files in public/images.
const convertedImageNames = new Set([
    "Discover the Magic of Cardamom2.png",
    "Cardamom Heritage by the Riverside.png",
    "pioneer.png",
    "yellow-cardamom-pouch-and-bowl-1792145329272.png",
    "Anupama’s Favorite Cardamom Delight.png",
    "Cardamom Gift Basket in Bengali Branding.png",
    "doctor.png",
    "elacher_ghor_logo.png",
    "elacher_ghor_logo0.png",
    "elacher_ghor_logo1.png",
    "Family’s Cardamom Tradition.png",
    "green-card.png",
    "hero1.png",
    "hero2.png",
    "orange-card.png",
    "pink-card.png",
    "purple-card.png",
    "red-card.png",
    "rosomalai-1.png",
    "rosomalai-3.png",
    "rosomalai-4.png",
    "এলাচের ঘর in a Misty Cardamom Forest.png",
    "cardamom-packs-banner.png",
]);

export const migrateImagePath = (imagePath) => {
    if (typeof imagePath !== "string" || /^https?:\/\//i.test(imagePath)) return imagePath;
    const splitAt = imagePath.search(/[?#]/);
    const path = splitAt < 0 ? imagePath : imagePath.slice(0, splitAt);
    const suffix = splitAt < 0 ? "" : imagePath.slice(splitAt);
    const fileName = path.slice(path.lastIndexOf("/") + 1);
    if (!convertedImageNames.has(fileName)) return imagePath;
    return `${path.slice(0, path.length - fileName.length)}${fileName.replace(/\.png$/i, ".webp")}${suffix}`;
};

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

    const normalizedPath = migrateImagePath(imagePath);
    return `${ASSET_BASE_URL}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
};
