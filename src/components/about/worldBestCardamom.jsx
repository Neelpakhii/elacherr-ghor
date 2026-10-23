import { useEffect, useState } from "react";
import { ASSET_BASE_URL, HOME_DATA_URL, getAppHref } from "../../config";
import "./worldBestCardamom.css";

const WorldBestCardamom = () => {
    const [section, setSection] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load the World’s Best Cardamom section.");
                }
                return response.json();
            })
            .then((data) => setSection(data.worldBestCardamom || null))
            .catch((error) => {
                console.error("World’s Best Cardamom error:", error);
            });
    }, []);

    if (!section) return null;

    const mediaUrl = (path) => {
        if (!path) return undefined;
        return path.startsWith("http") ? path : `${ASSET_BASE_URL}${path}`;
    };

    return (
        <section className="world-best-cardamom">
            <div className="world-best-cardamom__video" aria-hidden="true">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={mediaUrl(section.poster)}
                    title={section.posterTitle || section.heading || "Discover Elacher Ghor cardamom."}
                    tabIndex="-1"
                >
                    <source src={mediaUrl(section.video)} type="video/mp4" />
                </video>
            </div>

            <div className="world-best-cardamom__overlay">
                <h2>{section.heading}</h2>
                <p>{section.description}</p>

                {section.buttonUrl && (
                    <a href={getAppHref(section.buttonUrl)}>
                        {section.buttonText || "Read More"}
                    </a>
                )}
            </div>
        </section>
    );
};

export default WorldBestCardamom;
