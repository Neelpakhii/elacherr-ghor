import { useEffect, useState } from "react";
import { ABOUT_URL, getImageUrl } from "../../config";
import "./pioneer.css";

export default function Pioneer() {
    const [pioneerImage, setPioneerImage] = useState(null);

    useEffect(() => {
        fetch(ABOUT_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load About page data.");
                }

                return response.json();
            })
            .then((data) => {
                setPioneerImage(data.pioneer || null);
            })
            .catch((error) => {
                console.error("Pioneer section image error:", error);
            });
    }, []);

    return (
        <section className="pioneer" aria-labelledby="pioneer-heading">
            <div className="pioneer__text">
                <h2 id="pioneer-heading">
                    Elacher Ghor Pioneered the Grading of Cardamom
                </h2>

                <p>
                    Elacher Ghor is an innovative brand. The first to introduce
                    Aroma-Lock packaging, the brand has been the pioneer in
                    the industry in terms of setting the grading standards,
                    which has now become an industry standard.
                </p>

                <p>
                    Cardamoms are graded based on their pod diameter (not the
                    pod length as is often misunderstood) and their seed
                    density. The fatter the pod, the more bang for your buck!
                </p>

                <p>
                    Size wise, the pods are then sealed into colour-coded
                    packaging for easy identification.
                </p>

                <ol className="pioneer__grades">
                    <li>Purple Grade packs: 8mm &amp; above pods</li>
                    <li>Pink Grade packs: 7.5mm &amp; above pods</li>
                    <li>Green Grade packs: 7mm - 8mm pods</li>
                    <li>Orange Grade packs: 6.5mm - 7.5mm pods</li>
                    <li>Red Grade packs: 6mm - 7mm pods</li>
                </ol>

                <p>The quality remains world-class across all packs.</p>

                <p>
                    When you buy Elacher Ghor Cardamom, you are buying the
                    world’s best Alleppey Green Cardamom from the people who
                    know cardamom best.
                </p>
            </div>

            <div className="pioneer__visual">
                {pioneerImage?.image && (
                    <img
                        className="pioneer__image"
                        src={getImageUrl(pioneerImage.image)}
                        alt={pioneerImage.alt || "Cardamom grade size comparison and color-coded pouches."}
                        title={pioneerImage.alt || "Cardamom grade size comparison and color-coded pouches."}
                        loading="lazy"
                    />
                )}
            </div>
        </section>
    );
}
