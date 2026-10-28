import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const projectRoot = process.cwd();
const outputRoot = join(projectRoot, "dist");

const readJson = async (path) => JSON.parse(await readFile(join(projectRoot, path), "utf8"));
const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const escapeXml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const repository = process.env.GITHUB_REPOSITORY || "";
const [owner, repositoryName] = repository.split("/");
const siteBase = process.env.VITE_SITE_URL?.replace(/\/+$/, "")
    || (owner && repositoryName
        ? `https://${owner.toLowerCase()}.github.io/${repositoryName}`
        : "");
const sitemapBase = siteBase || "https://neelpakhii.github.io/elacherr-ghor";

const home = await readJson("public/data/home.json");
const productData = await readJson("public/data/products.json");
const products = productData.products || [];
const recipeData = await readJson("public/data/recipe.json");
const blogData = await readJson("public/data/blog.json");
const editorial = await readJson("public/data/editorial.json");

const routes = new Map();
const addRoute = (path, metadata) => routes.set(path, metadata);

addRoute("/", {
    title: "Elacher Ghor | Recipes, Stories & CSR",
    description: "Discover premium green cardamom at Elaicher Ghor. Shop fragrant grades, explore Bengali recipes and stories, and learn about our community initiatives.",
});
addRoute("/about", {
    title: "About Elacher Ghor | Our Cardamom Story",
    description: "Discover Elacher Ghor’s cardamom heritage, quality standards, and story of bringing premium Alleppey Green Cardamom to your kitchen.",
});
addRoute("/shop", {
    title: "Shop Premium Cardamom | Elacher Ghor",
    description: `Explore ${products.length || "our"} graded cardamom products from Elacher Ghor, with product details, prices, and availability.`,
});
addRoute("/recipes", {
    title: `${recipeData.recipesPage?.title || "Cardamom Recipes"} | Elacher Ghor`,
    description: recipeData.recipesPage?.description || "Explore recipes made with aromatic green cardamom.",
});
addRoute("/blogs", {
    title: `${blogData.blogsPage?.title || "Cardamom Stories"} | Elacher Ghor`,
    description: blogData.blogsPage?.description || "Read stories and useful guides about cardamom.",
});
addRoute("/csr", {
    title: `${editorial.csrPage?.title || "Community and Responsibility"} | Elacher Ghor`,
    description: editorial.csrPage?.description || "Learn about Elacher Ghor’s community and sustainability commitments.",
});
addRoute("/pages/faqs", {
    title: "Frequently Asked Questions | Elacher Ghor",
    description: "Find answers about Elacher Ghor cardamom, Aroma-Lock packaging, grades, selection, storage, and freshness.",
});
addRoute("/policies/refund-policy", {
    title: "Return and Refund Policy | Elacher Ghor",
    description: "Contact Elacher Ghor about return or refund requests, learn which purchase details to share, and where to seek help if another seller handled your order.",
});
addRoute("/policies/privacy-policy", {
    title: "Privacy Policy | Elacher Ghor",
    description: "Learn how this Elacher Ghor website handles browser-stored bag data, unsubmitted newsletter forms, and contact links, based on the current frontend today.",
});
addRoute("/policies/terms-of-service", {
    title: "Terms of Service | Elacher Ghor",
    description: "Review the terms for using Elacher Ghor’s website, including product information, its browser-based bag, and current online ordering limits for visitors.",
});
addRoute("/policies/shipping-policy", {
    title: "Shipping Policy | Elacher Ghor",
    description: "Find out how to ask Elacher Ghor about delivery availability, shipping fees, and estimated delivery for purchases arranged with customer care in advance.",
});

// These routes are supported by the app as aliases. Point their metadata to the
// canonical page so search engines do not treat each alias as a duplicate.
addRoute("/pages/csr", { ...routes.get("/csr"), canonical: "/csr" });
addRoute("/blogs/recipes", { ...routes.get("/recipes"), canonical: "/recipes" });
addRoute("/blogs/p", { ...routes.get("/blogs"), canonical: "/blogs" });
addRoute("/recipe", {
    title: "Cardamom Recipes | Elacher Ghor",
    description: recipeData.recipesPage?.description || "Explore recipes made with aromatic green cardamom.",
    canonical: "/recipes",
    noIndex: true,
});
addRoute("/bag", {
    title: "Shopping Bag | Elacher Ghor",
    description: "Review the cardamom products in your shopping bag.",
    noIndex: true,
});
addRoute("/cart", {
    title: "Shopping Bag | Elacher Ghor",
    description: "Review the cardamom products in your shopping bag.",
    canonical: "/bag",
    noIndex: true,
});
addRoute("/search", {
    title: "Search Cardamom Products | Elacher Ghor",
    description: "Search Elacher Ghor cardamom products.",
    noIndex: true,
});

for (const product of products) {
    if (!/^[a-z0-9-]+$/i.test(product.id || "")) continue;
    addRoute(`/products/${product.id}`, {
        title: `${product.name || "Cardamom"} | Elacher Ghor`,
        description: product.description || `${product.name || "Premium cardamom"} from Elacher Ghor. View product details, price, and availability.`,
    });
}

for (const recipe of [...(recipeData.recipes || []), ...(recipeData.localRecipes || [])]) {
    if (!/^[a-z0-9-]+$/i.test(recipe.slug || "")) continue;
    addRoute(`/recipes/${recipe.slug}`, {
        title: `${recipe.title || "Cardamom Recipe"} | Elacher Ghor`,
        description: recipe.excerpt || `Discover how to make ${recipe.title || "this recipe"} with aromatic cardamom.`,
    });
}

for (const story of blogData.blogs || []) {
    if (!/^[a-z0-9-]+$/i.test(story.slug || "")) continue;
    addRoute(`/blogs/${story.slug}`, {
        title: `${story.title || "Cardamom Story"} | Elacher Ghor`,
        description: story.excerpt || `Read ${story.title || "this story"} from Elacher Ghor.`,
    });
}

const template = await readFile(join(outputRoot, "index.html"), "utf8");
const updateHtml = (html, { title, description, canonical, noIndex }, route) => {
    let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    const descriptionTag = `<meta name="description" content="${escapeHtml(description)}" />`;
    if (/<meta\s+name=["']description["'][^>]*>/i.test(result)) {
        result = result.replace(/<meta\s+name=["']description["'][^>]*>/i, descriptionTag);
    } else {
        result = result.replace(/<\/head>/i, `  ${descriptionTag}\n  </head>`);
    }

    result = result.replace(/\s*<link\s+rel=["']canonical["'][^>]*>/i, "");
    if (siteBase) {
        const canonicalPath = canonical || route;
        const canonicalUrl = `${siteBase}${canonicalPath === "/" ? "/" : `${canonicalPath}/`}`;
        result = result.replace(/<\/head>/i, `  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n  </head>`);
    }

    result = result.replace(/\s*<meta\s+name=["']robots["'][^>]*>/i, "");
    if (noIndex) {
        result = result.replace(/<\/head>/i, '  <meta name="robots" content="noindex,follow" />\n  </head>');
    }
    return result;
};

for (const [route, metadata] of routes) {
    const routeFile = route === "/"
        ? join(outputRoot, "index.html")
        : join(outputRoot, ...route.split("/").filter(Boolean), "index.html");
    const routeHtml = updateHtml(template, metadata, route);
    await mkdir(dirname(routeFile), { recursive: true });
    await writeFile(routeFile, routeHtml, "utf8");
}

const sitemapUrls = [...routes.entries()]
    .filter(([, metadata]) => !metadata.noIndex && !metadata.canonical)
    .map(([route]) => `${sitemapBase}${route === "/" ? "/" : `${route}/`}`);
const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
    "",
].join("\n");
await writeFile(join(outputRoot, "sitemap.xml"), sitemapXml, "utf8");

console.log(`Generated ${routes.size} static route entry files.`);
console.log(`Generated sitemap.xml with ${sitemapUrls.length} indexable URLs.`);
