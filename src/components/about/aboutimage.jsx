import { useEffect, useState } from "react";
import { ABOUT_URL, getImageUrl } from "../../config";
import "./aboutimage.css";

export default function AboutImage() {
    const [hero, setHero] = useState(null);

    useEffect(() => {
        fetch(ABOUT_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load About page data.");
                }

                return response.json();
            })
            .then((data) => {
                setHero(data.hero || null);
            })
            .catch((error) => {
                console.error("About hero image error:", error);
            });
    }, []);

    if (!hero?.image) return null;

    return (
        <section className="about-image" aria-label="About Elacher Ghor">
            <img
                className="about-image__photo"
                src={getImageUrl(hero.image)}
                alt={hero.alt || "About Elacher Ghor"}
                title={hero.alt || "About Elacher Ghor"}
                fetchPriority="high"
            />
        </section>
    );
}
