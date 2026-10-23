import { useEffect, useState } from "react";
import { ABOUT_URL, getImageUrl } from "../../config";
import "./story.css";

export default function Story() {
    const [storyImage, setStoryImage] = useState(null);

    useEffect(() => {
        fetch(ABOUT_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load About page data.");
                }

                return response.json();
            })
            .then((data) => {
                setStoryImage(data.story || null);
            })
            .catch((error) => {
                console.error("Story image error:", error);
            });
    }, []);

    return (
        <section className="story" aria-labelledby="story-heading">
            <div className="story__visual">
                {storyImage?.image && (
                    <img
                        className="story__image"
                        src={getImageUrl(storyImage.image)}
                        alt={storyImage.alt || "Green cardamom pods in burlap sacks."}
                        title={storyImage.imageTitle || storyImage.alt || "Green cardamom pods in burlap sacks."}
                        loading="lazy"
                    />
                )}
            </div>

            <div className="story__content">
                <h2 id="story-heading">The Elacher Ghor Story</h2>

                <p>
                    For us, the story of Elacher Ghor begins with cardamom’s
                    unmistakable fragrance and the warmth it brings to everyday
                    food. Known as the Queen of Spices, cardamom has a place in
                    family kitchens, celebrations, tea and traditional
                    recipes. We want to make this familiar ingredient the
                    heart of our brand.
                </p>

                <p>
                    Good cardamom is appreciated not only for its appearance,
                    but also for the aroma and flavour released when a pod is
                    opened. That is why our story centres on choosing with
                    care and treating the spice with respect from selection
                    to the moment it reaches your kitchen.
                </p>

                <p>
                    Every cup of tea and every recipe carries a little of that story
                    forward. From a quiet morning at home to a table shared with family
                    and friends, cardamom brings warmth and a familiar fragrance to
                    everyday moments. Elacher Ghor celebrates the people, traditions and
                    memories that make this spice special, and the simple pleasure of
                    bringing its rich flavour into your kitchen.
                </p>
            </div>
        </section>
    );
}
