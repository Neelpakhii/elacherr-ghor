import { useCallback, useEffect, useRef, useState } from "react";
import { ASSET_BASE_URL, HOME_DATA_URL } from "../../config";
import "./hero.css";

const Hero = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(null);
    const transitionTimer = useRef(null);

    const goToSlide = useCallback((nextIndex) => {
        if (images.length <= 1 || nextIndex === currentIndex) return;

        setPreviousIndex(currentIndex);
        setCurrentIndex(nextIndex);

        clearTimeout(transitionTimer.current);
        transitionTimer.current = setTimeout(() => {
            setPreviousIndex(null);
        }, 500);
    }, [currentIndex, images.length]);

        useEffect(() => {
            fetch(HOME_DATA_URL)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch homepage data");
                    }

                    return response.json();
                })
                .then((data) => {
                    const heroImages = Array.isArray(data.hero)
                        ? data.hero
                        : [];

                    setImages(heroImages);
                    setCurrentIndex(0);
                    setPreviousIndex(null);
                })
                .catch((error) => {
                    console.error("Hero image error:", error);
                });
        }, []);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            goToSlide(nextIndex);
        }, 7000);

        return () => clearInterval(interval);
    }, [goToSlide, images.length, currentIndex]);

    useEffect(() => {
        return () => clearTimeout(transitionTimer.current);
    }, []);

    return (
        <section className="hero" aria-label="Featured banners">
            {images.map((image, index) => {
                const isActive = index === currentIndex;
                const isPrevious = index === previousIndex;

                return (
                    <img
                        key={image.id}
                        className={[
                            "hero-image",
                            isActive ? "is-active" : "",
                            isPrevious ? "is-previous" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        src={`${ASSET_BASE_URL}${image.image}`}
                        alt={image.alt || `Hero banner ${index + 1}`}
                        aria-hidden={!isActive}
                    />
                );
            })}

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        className="hero-arrow hero-prev"
                        onClick={() =>
                            goToSlide(
                                (currentIndex - 1 + images.length) % images.length
                            )
                        }
                        aria-label="Previous image"
                    >
                        &#10094;
                    </button>

                    <button
                        type="button"
                        className="hero-arrow hero-next"
                        onClick={() =>
                            goToSlide((currentIndex + 1) % images.length)
                        }
                        aria-label="Next image"
                    >
                        &#10095;
                    </button>

                    <div className="hero-dots">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                className={`hero-dot ${
                                    index === currentIndex ? "active" : ""
                                }`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Show image ${index + 1}`}
                                aria-current={
                                    index === currentIndex ? "true" : undefined
                                }
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default Hero;
