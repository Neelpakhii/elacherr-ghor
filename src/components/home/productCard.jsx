import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAppPath, getImageUrl } from "../../config";
import useBag from "../../hooks/useBag.js";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import { isProductAvailable } from "../../utils/productAvailability.js";
import { getDiscountPercentage, getProductVariant, getProductVariants, withProductVariant } from "../../utils/productVariants.js";
import "./productCard.css";

const ProductCard = ({ product, onProductClick }) => {
    const [added, setAdded] = useState(false);
    const variants = getProductVariants(product);
    const [selectedWeight, setSelectedWeight] = useState(product.weight || variants[0]?.weight || "");
    const selectedVariant = getProductVariant(product, selectedWeight);
    const discount = getDiscountPercentage(selectedVariant.price, selectedVariant.originalPrice);
    const { addItem } = useBag();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const imageSrc = getImageUrl(product.image);
    const weightLabel = selectedVariant.weight?.replace(/\s+/g, "");
    const detailPath = getAppPath(`/products/${product.id}`);
    const unavailable = !isProductAvailable(product);

    const handleAddToBag = () => {
        if (unavailable) return;
        addItem(withProductVariant(product, selectedVariant));
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1300);
    };

    const handleBuyNow = () => {
        if (unavailable) return;
        addItem(withProductVariant(product, selectedVariant));
        navigate(getAppPath("/bag"));
    };

    const handleProductClick = () => onProductClick?.(product);

    return (
        <article className="product-card">
            <Link className="product-card__image-wrap" to={detailPath} aria-label={`View ${product.name}`} onClick={handleProductClick}>
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
                <Link className="product-card__name-link" to={detailPath} onClick={handleProductClick}>
                    <h3 className="product-card__name">
                        {product.name}
                        {weightLabel && <span className="product-card__weight"> ({weightLabel})</span>}
                    </h3>
                </Link>

                {variants.length > 1 && (
                    <label className="product-card__pack-size">
                        <span>Pack size</span>
                        <select value={selectedVariant.weight} onChange={(event) => setSelectedWeight(event.target.value)} aria-label={`Choose pack size for ${product.name}`}>
                            {variants.map((variant) => <option key={variant.weight} value={variant.weight}>{variant.weight}</option>)}
                        </select>
                    </label>
                )}

                {selectedVariant.price != null && (
                    <p className="product-card__price notranslate" translate="no">
                        {formatPrice(selectedVariant.price)}

                        {selectedVariant.originalPrice != null && (
                            <span className="product-card__original-price">
                                {formatPrice(selectedVariant.originalPrice)}
                            </span>
                        )}
                        {discount > 0 && <span className="product-card__discount">{discount}% OFF</span>}
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
