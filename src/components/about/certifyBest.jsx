import { useEffect, useState } from "react";
import { ABOUT_URL, getImageUrl } from "../../config";
import "./certifyBest.css";

export default function CertifyBest() {
    const [certificateImage, setCertificateImage] = useState(null);

    useEffect(() => {
        fetch(ABOUT_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load About page data.");
                }

                return response.json();
            })
            .then((data) => {
                setCertificateImage(data.certifyBest || null);
            })
            .catch((error) => {
                console.error("Certification image error:", error);
            });
    }, []);

    return (
        <section
            className="certify-best"
            aria-labelledby="certify-best-heading"
        >
            <div className="certify-best__visual">
                {certificateImage?.image && (
                    <img
                        className="certify-best__image"
                        src={getImageUrl(certificateImage.image)}
                        alt={certificateImage.alt || "Government of India GI certificate for Alleppey Green Cardamom."}
                        title={certificateImage.imageTitle || certificateImage.alt || "Government of India GI certificate for Alleppey Green Cardamom."}
                        loading="lazy"
                    />
                )}
            </div>

            <div className="certify-best__content">
                <h2 id="certify-best-heading">
                    Certified as the World’s Best Cardamom
                </h2>

                <p>
                    Elacher Ghor claim of being the world’s best Alleppey
                    Green Cardamom isn’t just hollow, but one certified by a
                    prestigious GI Tag. Geographical Indication or GI acts as
                    certification that a product meets certain stringent
                    qualities and standards by virtue of belonging to a
                    specific geographical region.
                </p>

                <p>
                    Alleppey Green Cardamom is known for its unique qualities
                    like fully matured pods, richer aroma, fruity flavour,
                    greater oil content, uniform green colour and a
                    three-cornered ribbed structure that give it a premium
                    status the world over.
                </p>
            </div>
        </section>
    );
}
