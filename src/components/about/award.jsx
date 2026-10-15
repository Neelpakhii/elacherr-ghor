import { useEffect, useState } from "react";
import { ABOUT_URL, getImageUrl } from "../../config";
import "./award.css";

export default function Award() {
    const [imagePath, setImagePath] = useState("");

    useEffect(() => {
        fetch(ABOUT_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load About page data.");
                }

                return response.json();
            })
            .then((data) => {
                setImagePath(data.award?.image || "");
            })
            .catch((error) => {
                console.error("Award image error:", error);
            });
    }, []);

    return (
        <section className="award" aria-labelledby="award-heading">
            <div className="award__text">
                <h2 id="award-heading">
                    Elacher Ghor: A Cardamom Brand Rooted in Quality
                </h2>

                <p>
                    Elacher Ghor is dedicated to bringing carefully selected
                    green cardamom to homes, with attention to the aroma,
                    colour and flavour that make each pod special. We believe
                    that quality starts with respecting the spice and the
                    people who grow and handle it.
                </p>

                <p>
                    From choosing well-formed pods to packing them with care,
                    each step in our process is guided by freshness and
                    consistency. We want every pack to carry the fragrance and
                    distinctive taste people expect from cardamom, whether it
                    is used in tea, desserts or everyday cooking. As Elacher
                    Ghor grows, we remain committed to learning, improving and
                    earning our customers’ trust.
                </p>

                <p>
                    Thank you for welcoming Elacher Ghor into your kitchens
                    and supporting our journey. Your trust motivates us to
                    share the warmth and rich flavour of cardamom with more
                    homes.
                </p>
            </div>

            {imagePath && (
                <div className="award__visual">
                    <img
                        className="award__image"
                        src={getImageUrl(imagePath)}
                        alt="Elacher Ghor recognition"
                        loading="lazy"
                    />
                </div>
            )}
        </section>
    );
}