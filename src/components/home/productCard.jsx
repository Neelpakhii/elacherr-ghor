import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../config";
import { useBag } from "../../context/BagContext.jsx";
import "./productCard.css";

const ProductCard = ({ product }) => {
    const [added, setAdded] = useState(false);
    const { addItem } = useBag();
    const navigate = useNavigate();
    const imageSrc = getImageUrl(product.image);
    const detailPath = `/products/${product.id}`;

    const handleAddToBag = () => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1300);
    };

    const handleBuyNow = () => {
        addItem(product);
        navigate("/bag");
    };

    return (
        <article className="product-card">
            <Link className="product-card__image-wrap" to={detailPath} aria-label={`View ${product.name}`}>
                {imageSrc ? (
                    <img
                        className="product-card__image"
                        src={imageSrc}
                        alt={product.imageAlt || product.name}
                        loading="lazy"
                    />
                ) : (
                    <span className="product-card__placeholder">Product image</span>
                )}
            </Link>

            <div className="product-card__content">
                <p className="product-card__eyebrow">Alleppey Premium Cardamom</p>
                <Link className="product-card__name-link" to={detailPath}>
                    <h3 className="product-card__name">{product.name}</h3>
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
                    <button type="button" className="product-card__add-button" onClick={handleAddToBag}>
                        {added ? "Added to bag ✓" : "Add to bag"}
                    </button>
                    <button type="button" className="product-card__buy-button" onClick={handleBuyNow}>
                        Buy now
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
