import { useEffect, useState } from "react";
import { ASSET_BASE_URL, HOME_DATA_URL, getAppHref } from "../../config";
import "./gradeSelector.css";

const GradeSelector = () => {
    const [section, setSection] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load cardamom grades.");
                }
                return response.json();
            })
            .then((data) => {
                setSection(data.gradeSelector?.heading ? data.gradeSelector : null);
            })
            .catch((error) => {
                console.error("Grade selector error:", error);
            });
    }, []);

    if (!section) return null;

    const imageUrl = (image) => {
        if (!image) return "";
        return image.startsWith("http") ? image : `${ASSET_BASE_URL}${image}`;
    };

    return (
        <section
            id="grade-selector"
            className="grade-selector"
            aria-labelledby="grade-selector-title"
        >
            <div className="grade-selector__intro">
                <h1 id="grade-selector-title">{section.heading}</h1>
                <p>{section.description}</p>
            </div>

            <div className="grade-selector__grid">
                {Array.isArray(section.grades) &&
                    section.grades.map((grade) => (
                        <a
                            className="grade-selector__item"
                            href={getAppHref(grade.href || "#products")}
                            key={grade.id}
                        >
                            {grade.image && (
                                <img
                                    className="grade-selector__image"
                                    src={imageUrl(grade.image)}
                                    alt={grade.imageAlt || grade.name}
                                    title={grade.imageAlt || grade.name}
                                    loading="lazy"
                                />
                            )}
                            <h2>{grade.name}</h2>
                        </a>
                    ))}
            </div>

            {section.buttonUrl && (
                <a
                    className="grade-selector__button"
                    href={getAppHref(section.buttonUrl)}
                >
                    {section.buttonText ||
                        "Setting standards for others to follow"}
                </a>
            )}
        </section>
    );
};

export default GradeSelector;
