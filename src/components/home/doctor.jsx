import { useEffect, useState } from "react";
import { HOME_DATA_URL, getAppHref, getImageUrl } from "../../config";
import "./doctor.css";

const Doctor = () => {
    const [section, setSection] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load the Doctor of Spices section.");
                }
                return response.json();
            })
            .then((data) => setSection(data.doctor || null))
            .catch((error) => {
                console.error("Doctor section error:", error);
            });
    }, []);

    if (!section) return null;

    const imageUrl = getImageUrl(section.image);

    return (
        <section className="doctor-section" id="doctor">
            <div className="doctor-section__content">
                <h2>{section.heading}</h2>
                <p>{section.description}</p>

                {section.buttonUrl && (
                    <a
                        className="doctor-section__button"
                        href={getAppHref(section.buttonUrl)}
                    >
                        {section.buttonText || "Health Benefits"}
                    </a>
                )}
            </div>

            <div className="doctor-section__image-wrap">
                {imageUrl && (
                    <img
                        className="doctor-section__image"
                        src={imageUrl}
                        alt={section.imageAlt || section.heading}
                        title={section.imageTitle || section.imageAlt || section.heading}
                        loading="lazy"
                    />
                )}
            </div>
        </section>
    );
};

export default Doctor;
