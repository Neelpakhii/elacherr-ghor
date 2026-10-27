import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getAppPath, getImageUrl } from "../../config";
import useBag from "../../hooks/useBag.js";
import { getBagLineKey } from "../../utils/productVariants.js";
import "./bag.css";

const formatPrice = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const BagPage = () => {
    const { items, itemCount, subtotal, removeItem, setQuantity } = useBag();

    return (
        <section className="bag-page">
            <div className="bag-page__inner">
                <Link className="bag-page__back" to={getAppPath("/shop")}><ArrowLeft size={16} /> Continue shopping</Link>
                <header className="bag-page__header">
                    <p className="bag-page__eyebrow">Your selection</p>
                    <h1>Your bag</h1>
                    <p>{itemCount} {itemCount === 1 ? "item" : "items"} ready for your kitchen</p>
                </header>

                {items.length === 0 ? (
                    <div className="bag-empty">
                        <span className="bag-empty__icon"><ShoppingBag size={30} strokeWidth={1.4} /></span>
                        <h2>Your bag is waiting for something aromatic.</h2>
                        <p>Explore our cardamom grades and choose a favourite to get started.</p>
                        <Link className="bag-button bag-button--primary" to={getAppPath("/shop")}>Explore the shop</Link>
                    </div>
                ) : (
                    <div className="bag-layout">
                        <div className="bag-items" aria-label="Items in your bag">
                            {items.map(({ product, quantity }) => {
                                const lineKey = getBagLineKey(product);
                                return (
                                <article className="bag-item" key={lineKey}>
                                    <Link className="bag-item__image" to={getAppPath(`/products/${product.id}`)}>
                                        <img src={getImageUrl(product.image)} alt={product.imageAlt || product.name} title={product.imageTitle || product.imageAlt || product.name} />
                                    </Link>
                                    <div className="bag-item__details">
                                        <p className="bag-item__eyebrow">Alleppey Premium Cardamom</p>
                                        <h2><Link to={getAppPath(`/products/${product.id}`)}>{product.name}</Link></h2>
                                        {product.weight && <p className="bag-item__weight">Pack size: {product.weight}</p>}
                                        <p className="bag-item__price">{formatPrice(product.price)}</p>
                                        <div className="bag-item__controls">
                                            <div className="bag-quantity" aria-label={`Quantity: ${quantity}`}>
                                                <button type="button" aria-label={`Remove one ${product.name}`} disabled={quantity <= 1} onClick={() => setQuantity(lineKey, quantity - 1)}><Minus size={14} /></button>
                                                <span>{quantity}</span>
                                                <button type="button" aria-label={`Add one ${product.name}`} onClick={() => setQuantity(lineKey, quantity + 1)}><Plus size={14} /></button>
                                            </div>
                                            <button className="bag-item__remove" type="button" onClick={() => removeItem(lineKey)}><Trash2 size={15} /> Remove</button>
                                        </div>
                                    </div>
                                    <p className="bag-item__total">{formatPrice(Number(product.price || 0) * quantity)}</p>
                                </article>
                            );})}
                        </div>

                        <aside className="bag-summary" aria-label="Bag summary">
                            <p className="bag-summary__eyebrow">Order summary</p>
                            <div className="bag-summary__row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                            <p className="bag-summary__note">Shipping and any applicable charges can be confirmed when placing your order.</p>
                            <Link className="bag-button bag-button--primary" to={getAppPath("/shop")}>Add more products</Link>
                            <p className="bag-summary__saved">Your bag is saved in this browser.</p>
                        </aside>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BagPage;
