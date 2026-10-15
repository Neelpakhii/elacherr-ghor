import { useEffect, useState } from "react";
import { HOME_DATA_URL, getAppHref, getImageUrl } from "../../config";
import "./chefSection.css";

const ChefSection = () => {
    const [chef, setChef] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load the chef section.");
                }
                return response.json();
            })
            .then((data) => setChef(data.chefSection || null))
            .catch((error) => console.error("Chef section error:", error));
    }, []);

    if (!chef) return null;

    const imageSrc = getImageUrl(chef.image);

    return (
        <section className="chef-section">
            <div className="chef-section__content">
                <h2>{chef.heading}</h2>

                <p>{chef.description}</p>

                {chef.quote && (
                    <blockquote className="chef-section__quote">
                        “{chef.quote}”
                    </blockquote>
                )}

                {chef.buttonUrl && (
                    <a className="chef-section__button" href={getAppHref(chef.buttonUrl)}>
                        {chef.buttonText || "BUY NOW"}
                    </a>
                )}
            </div>

            {imageSrc && (
                <div className="chef-section__image-wrap">
                    <img
                        className="chef-section__image"
                        src={imageSrc}
                        alt={chef.imageAlt || chef.heading}
                        loading="lazy"
                    />
                </div>
            )}
        </section>
    );
};

export default ChefSection;
