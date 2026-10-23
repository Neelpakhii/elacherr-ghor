import { useMemo, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import PhotoCredit from "../../components/editorial/PhotoCredit.jsx";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const EMPTY_LIST = [];

const RecipesPage = () => {
    const { data, error } = useEditorialData();
    const [category, setCategory] = useState("All recipes");
    const [query, setQuery] = useState("");
    const recipes = data?.recipes ?? EMPTY_LIST;
    const page = data?.recipesPage;

    const categories = useMemo(
        () => ["All recipes", ...new Set(recipes.map((recipe) => recipe.category))],
        [recipes]
    );

    const visibleRecipes = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return recipes.filter((recipe) => {
            const matchesCategory = category === "All recipes" || recipe.category === category;
            const matchesQuery = !normalizedQuery ||
                `${recipe.title} ${recipe.excerpt} ${recipe.category}`.toLowerCase().includes(normalizedQuery);
            return matchesCategory && matchesQuery;
        });
    }, [recipes, category, query]);

    const featured = visibleRecipes.find((recipe) => recipe.featured) || visibleRecipes[0];
    const remaining = visibleRecipes.filter((recipe) => recipe.slug !== featured?.slug);

    if (error) return <main className="editorial-message" role="alert">{error}</main>;
    if (!page) return <main className="editorial-message" aria-live="polite">Loading recipes…</main>;

    return (
        <main className="editorial-page recipes-page">
            <header className="editorial-hero editorial-hero--recipes">
                <img src={page.heroImage} alt={page.heroImageAlt || page.title || "Cardamom recipes"} title={page.heroImageTitle || page.heroImageAlt || page.title || "Cardamom recipes"} />
                <div className="editorial-hero__shade" />
                <div className="editorial-hero__content">
                    <h1>{page.title}</h1>
                    <p className="editorial-hero__description">{page.description}</p>
                    <a className="editorial-button editorial-button--light" href="#recipe-collection">
                        Explore the recipes <ArrowRight size={17} />
                    </a>
                    <PhotoCredit name={page.heroImageCredit} url={page.heroImageCreditUrl} />
                </div>
            </header>

            <section className="editorial-section" id="recipe-collection">
                <div className="editorial-section__heading editorial-section__heading--row">
                    <div>
                        <p className="editorial-eyebrow editorial-eyebrow--green">Made to be shared</p>
                        <h2>Find your next favourite</h2>
                        <p>Small rituals, special occasions, and everything delicious in between.</p>
                    </div>
                    <label className="editorial-search">
                        <Search size={18} aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search recipes"
                            aria-label="Search recipes"
                        />
                    </label>
                </div>

                <div className="editorial-filters" aria-label="Filter recipes by category">
                    <span><SlidersHorizontal size={16} /> Browse:</span>
                    {categories.map((item) => (
                        <button
                            type="button"
                            key={item}
                            className={category === item ? "is-active" : ""}
                            onClick={() => setCategory(item)}
                            aria-pressed={category === item}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {featured ? (
                    <article className="editorial-featured-card">
                        <Link className="editorial-featured-card__image" to={`/recipes/${featured.slug}`}>
                            <img src={featured.image} alt={featured.imageAlt || featured.title || "Featured cardamom recipe"} title={featured.imageTitle || featured.imageAlt || featured.title || "Featured cardamom recipe"} loading="lazy" />
                        </Link>
                        <div className="editorial-featured-card__body">
                            <p className="editorial-card-kicker">Featured recipe <span>·</span> {featured.category}</p>
                            <h3><Link to={`/recipes/${featured.slug}`}>{featured.title}</Link></h3>
                            <p className="editorial-card-copy">{featured.excerpt}</p>
                            <div className="recipe-meta recipe-meta--compact">
                                <span>{featured.prepTime} prep</span><span>{featured.servings}</span>
                            </div>
                            <Link className="editorial-text-link" to={`/recipes/${featured.slug}`}>
                                Get the recipe <ArrowRight size={16} />
                            </Link>
                            <PhotoCredit name={featured.imageCredit} url={featured.imageCreditUrl} />
                        </div>
                    </article>
                ) : (
                    <p className="editorial-empty">No recipes match that search yet. Try another word or category.</p>
                )}

                {remaining.length > 0 && (
                    <div className="editorial-card-grid">
                        {remaining.map((recipe) => (
                            <article className="editorial-card" key={recipe.slug}>
                                <Link className="editorial-card__image" to={`/recipes/${recipe.slug}`}>
                                    <img src={recipe.image} alt={recipe.imageAlt || recipe.title || "Cardamom recipe"} title={recipe.imageTitle || recipe.imageAlt || recipe.title || "Cardamom recipe"} loading="lazy" />
                                </Link>
                                <div className="editorial-card__body">
                                    <p className="editorial-card-kicker">{recipe.category} <span>·</span> {recipe.prepTime} prep</p>
                                    <h3><Link to={`/recipes/${recipe.slug}`}>{recipe.title}</Link></h3>
                                    <p className="editorial-card-copy">{recipe.excerpt}</p>
                                    <Link className="editorial-text-link" to={`/recipes/${recipe.slug}`}>
                                        Cook this <ArrowRight size={16} />
                                    </Link>
                                    <PhotoCredit name={recipe.imageCredit} url={recipe.imageCreditUrl} />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default RecipesPage;
