import { useState } from "react";
import { ArrowLeft, Clock3, Printer, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PhotoCredit from "../../components/editorial/PhotoCredit.jsx";
import useEditorialData from "../../hooks/useEditorialData.js";
import "../editorial.css";

const RecipeDetailPage = () => {
    const { slug } = useParams();
    const { data, error } = useEditorialData();
    const [checkedIngredients, setCheckedIngredients] = useState([]);
    const recipe = data?.recipes?.find((item) => item.slug === slug);

    const toggleIngredient = (ingredient) => {
        setCheckedIngredients((current) => current.includes(ingredient)
            ? current.filter((item) => item !== ingredient)
            : [...current, ingredient]
        );
    };

    if (error) return <main className="editorial-message" role="alert">{error}</main>;
    if (!data) return <main className="editorial-message" aria-live="polite">Loading recipe…</main>;
    if (!recipe) return <main className="editorial-message"><h1>Recipe not found</h1><Link to="/recipes">Browse all recipes</Link></main>;

    return (
        <main className="editorial-page recipe-detail-page">
            <div className="detail-topline">
                <Link className="editorial-back-link" to="/recipes"><ArrowLeft size={16} /> All recipes</Link>
                <button className="detail-print" type="button" onClick={() => window.print()}><Printer size={16} /> Print recipe</button>
            </div>
            <header className="recipe-detail-hero">
                <div className="recipe-detail-hero__copy">
                    <p className="editorial-eyebrow editorial-eyebrow--green">{recipe.category} · From our kitchen</p>
                    <h1>{recipe.title}</h1>
                    <p className="recipe-detail-hero__excerpt">{recipe.excerpt}</p>
                    <div className="recipe-meta">
                        <span><Clock3 size={17} /> {recipe.prepTime} prep</span>
                        <span><Clock3 size={17} /> {recipe.cookTime} cook</span>
                        <span><Users size={17} /> {recipe.servings}</span>
                    </div>
                </div>
                <figure className="recipe-detail-hero__image">
                    <img src={recipe.image} alt={recipe.imageAlt || recipe.title || "Cardamom recipe"} title={recipe.imageAlt || recipe.title || "Cardamom recipe"} />
                    <figcaption><PhotoCredit name={recipe.imageCredit} url={recipe.imageCreditUrl} /></figcaption>
                </figure>
            </header>

            <div className="recipe-detail-layout">
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
                    <Link className="editorial-text-link" to="/recipes">Explore more recipes <ArrowLeft size={16} /></Link>
                </section>
            </div>
        </main>
    );
};

export default RecipeDetailPage;
