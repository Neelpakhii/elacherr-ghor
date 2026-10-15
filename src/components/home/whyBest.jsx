import { useEffect, useState } from "react";
import { ASSET_BASE_URL, HOME_DATA_URL, getAppHref } from "../../config";
import "./whyBest.css";

const ROTATION_INTERVAL = 4000;

const WhyBest = () => {
    const [section, setSection] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch section data
    useEffect(() => {
        const controller = new AbortController();

        fetch(HOME_DATA_URL, {
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Could not load the Why Best section."
                    );
                }

                return response.json();
            })
            .then((data) => {
                setSection(data.whyBest);
                setActiveIndex(0);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    console.error(
                        "Why Best section error:",
                        error
                    );
                }
            });

        return () => controller.abort();
    }, []);

    const qualities = section?.qualities ?? [];

    // Automatic rotation
    useEffect(() => {
        if (isPaused || qualities.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setActiveIndex((currentIndex) => {
                return (currentIndex + 1) % qualities.length;
            });
        }, ROTATION_INTERVAL);

        return () => clearInterval(interval);
    }, [qualities.length, isPaused]);

    const getImageUrl = (image) => {
        if (!image) return "";

        return image.startsWith("http")
            ? image
            : `${ASSET_BASE_URL}${image}`;
    };

    if (!section) return null;

    const activeQuality = qualities[activeIndex];

    // Content for the currently active icon
    const heading =
        activeQuality?.heading ||
        activeQuality?.title ||
        section.featureHeading;

    const description =
        activeQuality?.description ?? section.description;

    const provenance =
        activeQuality?.provenance ?? section.provenance;

    const linkUrl =
        activeQuality?.linkUrl ?? section.linkUrl;

    const linkText =
        activeQuality?.linkText ||
        section.linkText ||
        "Discover the secret";

    return (
        <section
            className="why-best"
            id="why-best"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget
                    )
                ) {
                    setIsPaused(false);
                }
            }}
        >
            <div className="why-best__inner">

                {/* Section heading */}
                <header className="why-best__header">
                    {section.eyebrow && (
                        <p className="why-best__eyebrow">
                            {section.eyebrow}
                        </p>
                    )}

                    <h2>{section.heading}</h2>

                    <span
                        className="why-best__header-line"
                        aria-hidden="true"
                    />
                </header>

                <div className="why-best__content">

                    {/* Left: Text changes with active icon */}
                    <div
                        className="why-best__story"
                        key={activeIndex}
                        aria-live="polite"
                    >
                        <span className="why-best__story-label">
                            THE ART OF EXCEPTIONAL CARDAMOM
                        </span>

                        <h3>{heading}</h3>

                        <span
                            className="why-best__gold-line"
                            aria-hidden="true"
                        />

                        {description && (
                            <p>{description}</p>
                        )}

                        {provenance && (
                            <p>{provenance}</p>
                        )}

                        {linkUrl && (
                            <a
                                className="why-best__link"
                                href={getAppHref(linkUrl)}
                            >
                                {linkText}
                                <span aria-hidden="true">
                                    {" "}↗
                                </span>
                            </a>
                        )}
                    </div>

                    {/* Right: Icons remain in fixed positions */}
                    <div
                        className="why-best__qualities"
                        role="tablist"
                        aria-label="Cardamom qualities"
                    >
                        {qualities.map((quality, index) => {
                            const isActive =
                                index === activeIndex;

                            return (
                                <button
                                    type="button"
                                    role="tab"
                                    key={quality.id}
                                    className={`why-best__quality ${
                                        isActive
                                            ? "is-active"
                                            : ""
                                    }`}
                                    aria-selected={isActive}
                                    aria-label={
                                        quality.title ||
                                        quality.heading ||
                                        `Quality ${index + 1}`
                                    }
                                    onClick={() =>
                                        setActiveIndex(index)
                                    }
                                >
                                    <img
                                        className="why-best__quality-image"
                                        src={getImageUrl(
                                            quality.image
                                        )}
                                        alt=""
                                    />

                                    {quality.title && (
                                        <span className="why-best__quality-title">
                                            {quality.title}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyBest;
