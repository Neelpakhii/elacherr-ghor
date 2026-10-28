# Elaichi Ghar admin dashboard

Open `/admin` while running the project locally. Sidebar links open the dashboard sections.

## Data connected today

- Products, grades, descriptions, prices, pack sizes, images, availability, and stock: `public/data/products.json`
- Homepage content: `public/data/home.json`
- Recipes: `public/data/recipe.json` (51 archive entries plus three pre-existing local additions)
- Blog stories: `public/data/blog.json`
- CSR content: `public/data/editorial.json`
- About and shop banner: `public/data/about.json` and `public/data/shop.json`
- Low-stock threshold: `public/data/admin-settings.json`, used by the dashboard and inventory view

Product edits update the existing storefront JSON. New products create their matching detail JSON file; deleting a product removes it from the shop and removes that detail file when changes are saved. Setting stock to zero marks the product unavailable on the homepage, Shop and search pages.

Recipe and blog posts support drafts and published status. Drafts are filtered out of the public recipe and blog pages. Image fields can use existing site image paths or upload a PNG, JPG, WebP, GIF or AVIF image into `public/images/admin-uploads/`.

## Save locally

Run `npm run dev` and open the local Vite URL. If Vite was already running when the local JSON writer was added or changed, restart it with `Ctrl+C` followed by `npm run dev`. The dashboard’s **Save changes** button writes JSON to the project’s `public/data/` files. Uploaded images go into `public/images/admin-uploads/`.

The dashboard keeps unsaved edits in this browser. You can download the selected JSON file from the relevant section. Refresh the storefront after saving to load updated static JSON.

## Data not available yet

This frontend has no checkout/order API, shared stock records, or customer account database. Orders, customers, revenue, pending orders, sales charts, and best-seller calculations show empty or unavailable states until a protected backend and persistent data store are connected. Stock quantities begin as untracked; the dashboard does not invent starting quantities.

The admin route does not have authentication. It is a local content editing tool, not a protected production administration service. A static GitHub Pages deployment cannot write changes back to the repository; edit locally, then publish the changed project files through your usual Git workflow.
