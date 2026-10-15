import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HOME_DATA_URL, PRODUCT_DETAILS_URL, getImageUrl } from "../../config";
import { useBag } from "../../context/BagContext.jsx";
import "./productDetail.css";

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addItem } = useBag();
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setProduct(null);
        setDetails(null);
        setQuantity(1);

        const loadProduct = async () => {
            try {
                const response = await fetch(HOME_DATA_URL, { signal: controller.signal });
                if (!response.ok) throw new Error("Could not load the product list.");
                const data = await response.json();
                const found = data.products?.find((item) => item.id === productId);
                if (!found) throw new Error("We couldn’t find that product.");

                setProduct(found);
                const detailsResponse = await fetch(`${PRODUCT_DETAILS_URL}${encodeURIComponent(productId)}.json`, { signal: controller.signal });
                if (detailsResponse.ok) setDetails(await detailsResponse.json());
            } catch (loadError) {
                if (loadError.name !== "AbortError") setError(loadError.message || "This product could not be loaded.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadProduct();
        return () => controller.abort();
    }, [productId]);

    const addToBag = () => {
        if (!product) return;
        addItem(product, quantity);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
    };

    const buyNow = () => {
        if (!product) return;
        addItem(product, quantity);
        navigate("/bag");
    };

    if (loading) return <section className="product-detail-state">Loading this cardamom grade…</section>;
    if (error || !product) {
        return (
            <section className="product-detail-state" role="alert">
                <p>{error || "This product is unavailable."}</p>
                <Link to="/shop">Back to the shop</Link>
            </section>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="product-detail-page__inner">
                <Link className="product-detail-page__back" to="/shop"><ArrowLeft size={16} /> Back to shop</Link>
                <nav className="product-detail-page__breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link><span>/</span><Link to="/shop">Shop</Link><span>/</span><span>{product.name}</span>
                </nav>

                <section className="product-detail-hero">
                    <div className="product-detail-hero__image-wrap">
                        <img src={getImageUrl(product.image)} alt={product.imageAlt || product.name} />
                        <span className="product-detail-hero__image-note"><Sparkles size={14} /> Carefully graded cardamom</span>
                    </div>

                    <div className="product-detail-hero__content">
                        <p className="product-detail-hero__eyebrow">Elacher Ghor · Alleppey Green</p>
                        <h1>{product.name}</h1>
                        {details?.grade && <p className="product-detail-hero__grade">Grade size <strong>{details.grade}</strong></p>}
                        <div className="product-detail-hero__price">
                            <strong>Rs. {Number(product.price || 0).toFixed(2)}</strong>
                            {product.originalPrice != null && <del>Rs. {Number(product.originalPrice).toFixed(2)}</del>}
                        </div>
                        <p className="product-detail-hero__description">
                            {details?.description || "A carefully graded cardamom selection for tea, sweets, and everyday cooking."}
                        </p>

                        <div className="product-detail-hero__purchase">
                            <div className="product-detail-quantity" aria-label={`Quantity: ${quantity}`}>
                                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus size={15} /></button>
                                <span>{quantity}</span>
                                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}><Plus size={15} /></button>
                            </div>
                            <button type="button" className="product-detail-button product-detail-button--outline" onClick={addToBag}>
                                <ShoppingBag size={17} /> {added ? "Added to bag" : "Add to bag"}
                            </button>
                        </div>
                        <button type="button" className="product-detail-button product-detail-button--solid" onClick={buyNow}>Buy now</button>
                        <p className="product-detail-hero__local-note">Your bag is saved on this device.</p>
                    </div>
                </section>

                <section className="product-detail-info">
                    <div>
                        <p className="product-detail-info__eyebrow">A grade for your kitchen</p>
                        <h2>Choose your cardamom with care.</h2>
                    </div>
                    <ul>
                        {(details?.highlights || ["Graded by pod size for easy selection", "A versatile addition to tea, sweets, and everyday recipes"]).map((highlight) => (
                            <li key={highlight}><span aria-hidden="true">✦</span>{highlight}</li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default ProductDetailPage;
