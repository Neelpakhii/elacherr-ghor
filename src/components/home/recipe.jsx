import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ASSET_BASE_URL, HOME_DATA_URL, getAppPath } from "../../config";
import "./recipe.css";

const getImageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${ASSET_BASE_URL}${image}`;
};

const RecipeLink = ({ recipe, className = "" }) => (
    <Link className={className} to={getAppPath(recipe.url || "/recipes")}>
        {recipe.linkText || "Read More"}
    </Link>
);

const Recipe = () => {
    const [section, setSection] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load recipe section.");
                }

                return response.json();
            })
            .then((data) => setSection(data.recipes || null))
            .catch((error) => {
                console.error("Recipe section error:", error);
            });
    }, []);

    if (!section) return null;

    return (
        <section className="recipe-section" id="recipes">
            <h2 className="recipe-section__heading">{section.heading}</h2>

            <div className="recipe-section__layout">
                {section.featured && (
                    <article className="recipe-featured">
                        <Link
                            className="recipe-featured__image-link"
                            to={getAppPath(section.featured.url || "/recipes")}
                            aria-label={`Read ${section.featured.title}`}
                        >
                            <img
                                className="recipe-featured__image"
                                src={getImageUrl(section.featured.image)}
                                alt={
                                    section.featured.imageAlt ||
                                    section.featured.title
                                }
                                title={
                                    section.featured.imageTitle ||
                                    section.featured.imageAlt ||
                                    section.featured.title
                                }
                                loading="lazy"
                            />
                        </Link>

                        <div className="recipe-featured__content">
                            <h3>{section.featured.title}</h3>
                            <p>{section.featured.description}</p>
                            <RecipeLink
                                recipe={section.featured}
                                className="recipe-featured__button"
                            />
                        </div>
                    </article>
                )}

                <div className="recipe-list">
                    {section.sideRecipes?.map((recipe) => (
                        <article className="recipe-list__item" key={recipe.id}>
                            <Link
                                className="recipe-list__image-link"
                                to={getAppPath(recipe.url || "/recipes")}
                                aria-label={`Read ${recipe.title}`}
                            >
                                <img
                                    className="recipe-list__image"
                                    src={getImageUrl(recipe.image)}
                                    alt={recipe.imageAlt || recipe.title}
                                    title={recipe.imageTitle || recipe.imageAlt || recipe.title}
                                    loading="lazy"
                                />
                            </Link>

                            <div className="recipe-list__content">
                                <h3>{recipe.title}</h3>
                                <p>{recipe.description}</p>
                                <RecipeLink
                                    recipe={recipe}
                                    className="recipe-list__link"
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Recipe;
