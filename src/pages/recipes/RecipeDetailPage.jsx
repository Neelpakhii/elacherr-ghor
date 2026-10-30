import { useState } from "react";
import { ArrowLeft, Clock3, Printer, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getAppPath, getImageUrl } from "../../config";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const RecipeDetailPage = () => {
    const { slug } = useParams();
    const { data, error } = useEditorialData();
    const [checkedIngredients, setCheckedIngredients] = useState([]);
    const recipe = data?.recipes?.find((item) => item.slug === slug);
    const hasCompleteMethod = Boolean(recipe?.ingredients?.length && recipe?.steps?.length);

    const toggleIngredient = (ingredient) => {
        setCheckedIngredients((current) => current.includes(ingredient)
            ? current.filter((item) => item !== ingredient)
            : [...current, ingredient]
        );
    };

    if (error) return <main className="editorial-message" role="alert">{error}</main>;
    if (!data) return <main className="editorial-message" aria-live="polite">Loading recipe…</main>;
    if (!recipe) return <main className="editorial-message"><h1>Recipe not found</h1><Link to={getAppPath("/recipes")}>Browse all recipes</Link></main>;

    return (
        <main className="editorial-page recipe-detail-page">
            <div className="detail-topline">
                <Link className="editorial-back-link" to={getAppPath("/recipes")}><ArrowLeft size={16} /> All recipes</Link>
                <button className="detail-print" type="button" onClick={() => window.print()}><Printer size={16} /> Print recipe</button>
            </div>
            <header className="recipe-detail-hero">
                <div className="recipe-detail-hero__copy">
                    <p className="editorial-eyebrow editorial-eyebrow--green">{recipe.category} · Recipe collection</p>
                    <h1>{recipe.title}</h1>
                    <p className="recipe-detail-hero__excerpt">{recipe.excerpt}</p>
                    {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
                        <div className="recipe-meta">
                            {recipe.prepTime && <span><Clock3 size={17} /> {recipe.prepTime} prep</span>}
                            {recipe.cookTime && <span><Clock3 size={17} /> {recipe.cookTime} cook</span>}
                            {recipe.servings && <span><Users size={17} /> {recipe.servings}</span>}
                        </div>
                    )}
                </div>
                <figure className={`recipe-detail-hero__image${recipe.slug === "cardamom-rasmalai" ? " recipe-detail-hero__image--rasmalai" : ""}`}>
                    <img src={getImageUrl(recipe.image)} alt={recipe.imageAlt || recipe.title || "Cardamom recipe"} title={recipe.imageTitle || recipe.imageAlt || recipe.title || "Cardamom recipe"} />
                </figure>
            </header>

            {hasCompleteMethod ? <div className="recipe-detail-layout">
                <aside className="ingredients-panel">
                    <p className="editorial-eyebrow editorial-eyebrow--green">Gather around</p>
                    <h2>Ingredients</h2>
                    <p className="ingredients-panel__hint">Tap an item as you get it ready.</p>
                    <ul>
                        {recipe.ingredients.map((ingredient) => (
                            <li key={ingredient}>
                                <label className={checkedIngredients.includes(ingredient) ? "is-checked" : ""}>
                                    <input
                                        type="checkbox"
                                        checked={checkedIngredients.includes(ingredient)}
                                        onChange={() => toggleIngredient(ingredient)}
                                    />
                                    <span>{ingredient}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </aside>
                <section className="recipe-method">
                    <p className="editorial-eyebrow editorial-eyebrow--green">The good part</p>
                    <h2>Let’s make it</h2>
                    <ol>
                        {recipe.steps.map((step, index) => (
                            <li key={step}>
                                <span className="recipe-step-number">{String(index + 1).padStart(2, "0")}</span>
                                <p>{step}</p>
                            </li>
                        ))}
                    </ol>
                    {recipe.tip && <aside className="recipe-tip"><strong>A little tip</strong><p>{recipe.tip}</p></aside>}
                    <Link className="editorial-text-link" to={getAppPath("/recipes")}>Explore more recipes <ArrowLeft size={16} /></Link>
                </section>
            </div> : (
                <section className="editorial-section recipe-archive-detail">
                    <div className="editorial-section__heading">
                        <p className="editorial-eyebrow editorial-eyebrow--green">Recipe overview</p>
                        <h2>Made to be shared</h2>
                        <p>{recipe.excerpt}</p>
                    </div>
                    <Link className="editorial-text-link" to={getAppPath("/recipes")}>Explore all recipes <ArrowLeft size={16} /></Link>
                </section>
            )}
        </main>
    );
};

export default RecipeDetailPage;
