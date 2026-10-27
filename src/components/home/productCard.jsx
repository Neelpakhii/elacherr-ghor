import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAppPath, getImageUrl } from "../../config";
import useBag from "../../hooks/useBag.js";
import { isProductAvailable } from "../../utils/productAvailability.js";
import "./productCard.css";

const ProductCard = ({ product }) => {
    const [added, setAdded] = useState(false);
    const { addItem } = useBag();
    const navigate = useNavigate();
    const imageSrc = getImageUrl(product.image);
    const weightLabel = product.weight?.replace(/\s+/g, "");
    const detailPath = getAppPath(`/products/${product.id}`);
    const unavailable = !isProductAvailable(product);

    const handleAddToBag = () => {
        if (unavailable) return;
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1300);
    };

    const handleBuyNow = () => {
        if (unavailable) return;
        addItem(product);
        navigate(getAppPath("/bag"));
    };

    return (
        <article className="product-card">
            <Link className="product-card__image-wrap" to={detailPath} aria-label={`View ${product.name}`}>
                {imageSrc ? (
                    <img
                        className="product-card__image"
                        src={imageSrc}
                        alt={product.imageAlt || product.name}
                        title={product.imageTitle || product.imageAlt || product.name}
                        loading="lazy"
                    />
                ) : (
                    <span className="product-card__placeholder">Product image</span>
                )}
            </Link>

            <div className="product-card__content">
                <p className="product-card__eyebrow">Alleppey Premium Cardamom</p>
                {unavailable && <p className="product-card__availability">Currently unavailable</p>}
                <Link className="product-card__name-link" to={detailPath}>
                    <h3 className="product-card__name">
                        {product.name}
                        {weightLabel && <span className="product-card__weight"> ({weightLabel})</span>}
                    </h3>
                </Link>

                {product.price != null && (
                    <p className="product-card__price">
                        Rs. {Number(product.price).toFixed(2)}

                        {product.originalPrice != null && (
                            <span className="product-card__original-price">
                                Rs. {Number(product.originalPrice).toFixed(2)}
                            </span>
                        )}
                    </p>
                )}

                <div className="product-card__actions">
                    <button type="button" className="product-card__add-button" onClick={handleAddToBag} disabled={unavailable}>
                        {added ? "Added to bag ✓" : "Add to bag"}
                    </button>
                    <button type="button" className="product-card__buy-button" onClick={handleBuyNow} disabled={unavailable}>
                        Buy now
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
