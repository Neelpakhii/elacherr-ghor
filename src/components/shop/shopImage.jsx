import { useEffect, useState } from "react";
import { SHOP_URL, getImageUrl } from "../../config";
import "./shopImage.css";

const ShopImage = () => {
    const [image, setImage] = useState("");

    useEffect(() => {
        fetch(SHOP_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load shop image");
                }

                return response.json();
            })
            .then((data) => {
                setImage(getImageUrl(data.shopImage?.image));
            })
            .catch((error) => {
                console.error("Shop image error:", error);
            });
    }, []);

    if (!image) return null;

    return (
        <section className="shop-image" aria-label="Cardamom collection">
            <img
                className="shop-image__photo"
                src={image}
                alt="Elacher Ghor cardamom collection"
            />
        </section>
    );
};

export default ShopImage;