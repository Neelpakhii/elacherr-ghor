import { useEffect, useState } from "react";
import { ABOUT_URL, getImageUrl } from "../../config";
import "./threeStar.css";

export default function ThreeStar() {
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
                setCertificateImage(data.threeStar || null);
            })
            .catch((error) => {
                console.error("Three Star certificate image error:", error);
            });
    }, []);

    return (
        <section className="three-star" aria-labelledby="three-star-heading">
            <div className="three-star__text">
                <h2 id="three-star-heading">
                    Three Star Export House Certified by the Government of India
                </h2>

                <p>
                    Elacher Ghor Cardamom is the proud recipient of the Three
                    Star Export House certificate conferred on it by the
                    Directorate General of Foreign Trade, under the aegis of
                    the Ministry of Commerce &amp; Industry, Government of India.
                </p>

                <p>
                    The certification is based on our consistent export
                    performance and acknowledges us as a category leader
                    (Green Cardamom) who has excelled in international trade
                    and successfully contributed to the country’s foreign trade.
                </p>
            </div>

            <div className="three-star__visual">
                {certificateImage?.image && (
                    <img
                        className="three-star__image"
                        src={getImageUrl(certificateImage.image)}
                        alt={certificateImage.alt || "Government of India Three Star Export House certificate."}
                        title={certificateImage.imageTitle || certificateImage.alt || "Government of India Three Star Export House certificate."}
                        loading="lazy"
                    />
                )}
            </div>
        </section>
    );
}
