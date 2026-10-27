import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { getAppPath, getImageUrl } from "../../config";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const EMPTY_LIST = [];
const RECIPES_PER_BATCH = 6;

const RecipesPage = () => {
    const { data, error } = useEditorialData();
    const [category, setCategory] = useState("All recipes");
    const [query, setQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(RECIPES_PER_BATCH);
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

    const featuredRecipe = visibleRecipes.find((recipe) => recipe.featured) || visibleRecipes[0];
    const remainingRecipes = visibleRecipes.filter((recipe) => recipe.slug !== featuredRecipe?.slug);
    const shownRecipes = remainingRecipes.slice(0, visibleCount);
    const displayedCount = Math.min(visibleCount + (featuredRecipe ? 1 : 0), visibleRecipes.length);

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
                </div>
            </header>

            <section className="editorial-section" id="recipe-collection">
                <div className="editorial-section__heading editorial-section__heading--row">
                    <div>
                        <p className="editorial-eyebrow editorial-eyebrow--green">Made to be shared</p>
                        <h2>Find your next favourite</h2>
                        <p>Small rituals, special occasions, and everything delicious in between.</p>
                    </div>
                    <form className="editorial-search" role="search" onSubmit={(event) => event.preventDefault()}>
                        <Search size={18} aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setVisibleCount(RECIPES_PER_BATCH);
                            }}
                            placeholder="Search recipes"
                            aria-label="Search recipes"
                        />
                        <button type="submit" aria-label="Search recipes">
                            <ArrowRight size={22} aria-hidden="true" />
                        </button>
                    </form>
                </div>

                <div className="editorial-filters" aria-label="Filter recipes by category">
                    {categories.map((item) => (
                        <button
                            type="button"
                            key={item}
                            className={category === item ? "is-active" : ""}
                            onClick={() => {
                                setCategory(item);
                                setVisibleCount(RECIPES_PER_BATCH);
                            }}
                            aria-pressed={category === item}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <p className="recipe-results-count" role="status">
                    Showing {displayedCount} of {visibleRecipes.length} recipes
                </p>

                {visibleRecipes.length > 0 ? (
                    <>
                        {featuredRecipe && (
                            <article className="editorial-featured-card">
                                <Link className="editorial-featured-card__image" to={getAppPath(`/recipes/${featuredRecipe.slug}`)} aria-label={`Read recipe: ${featuredRecipe.title}`}>
                                    <img src={getImageUrl(featuredRecipe.image)} alt={featuredRecipe.imageAlt || featuredRecipe.title || "Featured cardamom recipe"} title={featuredRecipe.imageTitle || featuredRecipe.imageAlt || featuredRecipe.title || "Featured cardamom recipe"} loading="lazy" />
                                </Link>
                                <div className="editorial-featured-card__body">
                                    <p className="editorial-card-kicker">Featured recipe <span>·</span> {featuredRecipe.category}</p>
                                    <h3><Link to={getAppPath(`/recipes/${featuredRecipe.slug}`)}>{featuredRecipe.title}</Link></h3>
                                    <p className="editorial-card-copy">{featuredRecipe.excerpt}</p>
                                    <Link className="editorial-text-link" to={getAppPath(`/recipes/${featuredRecipe.slug}`)}>
                                        View recipe <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        )}

                        <div className="editorial-card-grid">
                            {shownRecipes.map((recipe) => {
                                const linkProps = { to: getAppPath(`/recipes/${recipe.slug}`) };

                                return (
                                    <article className="editorial-card" key={recipe.slug}>
                                        <Link className="editorial-card__image" {...linkProps} aria-label={`Read recipe: ${recipe.title}`}>
                                            <img src={getImageUrl(recipe.image)} alt={recipe.imageAlt || recipe.title || "Cardamom recipe"} title={recipe.imageTitle || recipe.imageAlt || recipe.title || "Cardamom recipe"} loading="lazy" />
                                        </Link>
                                        <div className="editorial-card__body">
                                            <p className="editorial-card-kicker">{recipe.category}</p>
                                            <h3><Link {...linkProps}>{recipe.title}</Link></h3>
                                            <p className="editorial-card-copy">{recipe.excerpt}</p>
                                            <Link className="editorial-text-link" {...linkProps}>
                                                Cook this <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <p className="editorial-empty">No recipes match that search yet. Try another word or category.</p>
                )}

                {remainingRecipes.length > visibleCount && (
                    <div className="editorial-more-actions">
                        <button className="site-more-button" type="button" onClick={() => setVisibleCount((count) => Math.min(count + RECIPES_PER_BATCH, remainingRecipes.length))}>
                            Read more recipes <ArrowRight size={17} />
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
};

export default RecipesPage;
