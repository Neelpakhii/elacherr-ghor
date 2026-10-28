import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PRODUCTS_DATA_URL, getAppPath, getImageUrl } from "../../config";
import useBag from "../../hooks/useBag.js";
import { isProductAvailable } from "../../utils/productAvailability.js";
import { getDiscountPercentage, getProductVariant, getProductVariants, withProductVariant } from "../../utils/productVariants.js";
import "./productDetail.css";

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [productResult, setProductResult] = useState(null);
    const [quantityState, setQuantityState] = useState({ productId, quantity: 1 });
    const [variantState, setVariantState] = useState({ productId, weight: "" });
    const [addedProductId, setAddedProductId] = useState(null);
    const { addItem } = useBag();
    const navigate = useNavigate();

    const currentResult = productResult?.productId === productId ? productResult : null;
    const loading = !currentResult;
    const product = currentResult?.product || null;
    const variants = getProductVariants(product);
    const selectedWeight = variantState.productId === productId && variantState.weight
        ? variantState.weight
        : product?.weight;
    const selectedVariant = product ? getProductVariant(product, selectedWeight) : null;
    const discount = selectedVariant ? getDiscountPercentage(selectedVariant.price, selectedVariant.originalPrice) : 0;
    const details = currentResult?.details || null;
    const error = currentResult?.error || "";
    const quantity = quantityState.productId === productId ? quantityState.quantity : 1;
    const added = addedProductId === productId;
    const unavailable = !isProductAvailable(product);

    useEffect(() => {
        const controller = new AbortController();

        const loadProduct = async () => {
            try {
                const response = await fetch(PRODUCTS_DATA_URL, { signal: controller.signal });
                if (!response.ok) throw new Error("Could not load the product list.");
                const data = await response.json();
                const found = data.products?.find((item) => item.id === productId);
                if (!found) throw new Error("We couldn’t find that product.");
                if (controller.signal.aborted) return;
                setProductResult({ productId, product: found, details: found, error: "" });
            } catch (loadError) {
                if (loadError.name !== "AbortError" && !controller.signal.aborted) {
                    setProductResult({
                        productId,
                        product: null,
                        details: null,
                        error: loadError.message || "This product could not be loaded.",
                    });
                }
            }
        };

        loadProduct();
        return () => controller.abort();
    }, [productId]);

    const addToBag = () => {
        if (!product || unavailable) return;
        addItem(withProductVariant(product, selectedVariant), quantity);
        setAddedProductId(productId);
        window.setTimeout(() => {
            setAddedProductId((currentId) => currentId === productId ? null : currentId);
        }, 1500);
    };

    const changeQuantity = (update) => {
        const currentQuantity = quantityState.productId === productId ? quantityState.quantity : 1;
        const nextQuantity = typeof update === "function" ? update(currentQuantity) : update;
        setQuantityState({ productId, quantity: Math.max(1, Number(nextQuantity) || 1) });
    };

    const buyNow = () => {
        if (!product || unavailable) return;
        addItem(withProductVariant(product, selectedVariant), quantity);
        navigate(getAppPath("/bag"));
    };

    if (loading) return <section className="product-detail-state">Loading this cardamom grade…</section>;
    if (error || !product) {
        return (
            <section className="product-detail-state" role="alert">
                <p>{error || "This product is unavailable."}</p>
                <Link to={getAppPath("/shop")}>Back to the shop</Link>
            </section>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="product-detail-page__inner">
                <Link className="product-detail-page__back" to={getAppPath("/shop")}><ArrowLeft size={16} /> Back to shop</Link>
                <nav className="product-detail-page__breadcrumb" aria-label="Breadcrumb">
                    <Link to={getAppPath("/")}>Home</Link><span>/</span><Link to={getAppPath("/shop")}>Shop</Link><span>/</span><span>{product.name}</span>
                </nav>

                <section className="product-detail-hero">
                    <div className="product-detail-hero__image-wrap">
                        <img src={getImageUrl(product.image)} alt={product.imageAlt || product.name} title={product.imageTitle || product.imageAlt || product.name} />
                        <span className="product-detail-hero__image-note"><Sparkles size={14} /> Carefully graded cardamom</span>
                    </div>

                    <div className="product-detail-hero__content">
                        <p className="product-detail-hero__eyebrow">Elacher Ghor · Alleppey Green</p>
                        <h1>{product.name} <span className="product-detail-hero__selected-weight">({selectedVariant?.weight?.replace(/\s+/g, "")})</span></h1>
                        {details?.grade && <p className="product-detail-hero__grade">Grade size <strong>{details.grade}</strong></p>}
                        {variants.length > 1 && (
                            <label className="product-detail-pack-size">
                                <span>Choose pack size</span>
                                <select value={selectedVariant.weight} onChange={(event) => setVariantState({ productId, weight: event.target.value })}>
                                    {variants.map((variant) => <option key={variant.weight} value={variant.weight}>{variant.weight}</option>)}
                                </select>
                            </label>
                        )}
                        <div className="product-detail-hero__price">
                            <strong>Rs. {Number(selectedVariant?.price || 0).toFixed(2)}</strong>
                            {selectedVariant?.originalPrice != null && <del>Rs. {Number(selectedVariant.originalPrice).toFixed(2)}</del>}
                            {discount > 0 && <span className="product-detail-hero__discount">{discount}% OFF</span>}
                        </div>
                        <p className="product-detail-hero__description">
                            {details?.description || "A carefully graded cardamom selection for tea, sweets, and everyday cooking."}
                        </p>

                        <div className="product-detail-hero__purchase">
                            <div className="product-detail-quantity" aria-label={`Quantity: ${quantity}`}>
                                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => changeQuantity((current) => Math.max(1, current - 1))}><Minus size={15} /></button>
                                <span>{quantity}</span>
                                <button type="button" aria-label="Increase quantity" onClick={() => changeQuantity((current) => current + 1)}><Plus size={15} /></button>
                            </div>
                            <button type="button" className="product-detail-button product-detail-button--outline" onClick={addToBag} disabled={unavailable}>
                                <ShoppingBag size={17} /> {unavailable ? "Unavailable" : added ? "Added to bag" : "Add to bag"}
                            </button>
                        </div>
                        <button type="button" className="product-detail-button product-detail-button--solid" onClick={buyNow} disabled={unavailable}>Buy now</button>
                        {unavailable && <p className="product-detail-hero__local-note">This product is currently unavailable.</p>}
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
