# Elacher Ghor — Frontend Only

This React and Vite project runs without the Express backend. Site content is served from static JSON files and public images.

## Run locally

1. Install Node.js.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL shown by Vite.

To create a production build, run `npm run build`. The generated site is in `dist/`.

## Update content

- Home content and product listings: `public/data/home.json`
- About page content: `public/data/about.json`
- Shop banner: `public/data/shop.json`
- All 51 archive recipes: `public/data/recipe.json` (`localRecipes` preserves three additional recipes already in the project)
- Journal articles: `public/data/blog.json`
- CSR page: `public/data/editorial.json`
- Images and video: `public/images/` (editorial photography is linked from Unsplash in the JSON)

## Admin dashboard

Run the project locally and open `/admin` to manage products, stock, homepage content, recipes, blogs, and the low-stock threshold. See [`src/admin-tool/README.md`](src/admin-tool/README.md) for save instructions and current limits. Orders and customer accounts need a backend and are not available in this frontend-only project.

Recipe cards open their own pages. Journal cards open full articles. The Recipes, Blogs and CSR pages are linked in the navbar.

The JSON files and images are public. Anyone who can access the deployed site can view them. The newsletter form is presentation-only and does not send or store email addresses; saving submissions or processing orders requires a service that can receive and store that information.
