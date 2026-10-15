import { useEffect, useState } from "react";
import { ASSET_BASE_URL, HOME_DATA_URL } from "../../config";
import "./originshagun.css";

const OriginShagun = () => {
    const [section, setSection] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Could not load the Origin and Shagun section."
                    );
                }

                return response.json();
            })
            .then((data) => {
                setSection(data.originShagun || null);
            })
            .catch((error) => {
                console.error(
                    "Origin and Shagun section error:",
                    error
                );
            });
    }, []);

    if (!section) return null;

    const getImageUrl = (image) => {
        if (!image) return "";
        return image.startsWith("http")
            ? image
            : `${ASSET_BASE_URL}${image}`;
    };

    return (
        <section
            className="origin-shagun"
            id="origin-shagun"
            aria-label={section.ariaLabel || "Origin and Shagun"}
        >
            <div className="origin-shagun__grid">
                {section.cards?.map((card, index) => (
                    <article
                        className="origin-shagun__card"
                        key={card.id || index}
                    >
                        <img
                            className="origin-shagun__image"
                            src={getImageUrl(card.image)}
                            alt={card.imageAlt || card.heading || ""}
                            loading="lazy"
                        />

                        <div
                            className="origin-shagun__shade"
                            aria-hidden="true"
                        />

                        <div className="origin-shagun__content">
                            {card.heading && (
                                <h2>{card.heading}</h2>
                            )}

                            {card.description && (
                                <p>{card.description}</p>
                            )}

                            <a
                                className="origin-shagun__button"
                                href={card.buttonUrl || "#"}
                                aria-label={
                                    `${card.buttonText || "Explore"}: ${card.heading || "Learn more"}`
                                }
                                onClick={(event) => {
                                    if (!card.buttonUrl) {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                {card.buttonText || "Explore"}
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default OriginShagun;