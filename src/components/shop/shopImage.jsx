import { useEffect, useState } from "react";
import { SHOP_URL, getImageUrl } from "../../config";
import "./shopImage.css";

const ShopImage = () => {
    const [shopImage, setShopImage] = useState(null);

    useEffect(() => {
        fetch(SHOP_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load shop image");
                }

                return response.json();
            })
            .then((data) => {
                setShopImage(data.shopImage || null);
            })
            .catch((error) => {
                console.error("Shop image error:", error);
            });
    }, []);

    if (!shopImage?.image) return null;

    return (
        <section className="shop-image" aria-label="Cardamom collection">
            <img
                className="shop-image__photo"
                src={getImageUrl(shopImage.image)}
                alt={shopImage.alt || "Elacher Ghor cardamom pouches with cardamom plants and blossoms."}
                title={shopImage.imageTitle || shopImage.alt || "Elacher Ghor cardamom pouches with cardamom plants and blossoms."}
            />
        </section>
    );
};

export default ShopImage;
