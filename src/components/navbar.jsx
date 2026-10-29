import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Search, UserRound, ShoppingBag, Menu, X } from "lucide-react";
import { HOME_DATA_URL, PRODUCTS_DATA_URL, getAppPath, getImageUrl } from "../config";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import useBag from "../hooks/useBag.js";
import { clearRecentlySearchedProducts, getRecentlySearchedProductIds, recordRecentlySearchedProduct } from "../utils/recentSearchProducts.js";
import scrollToTop from "../utils/scrollToTop.js";
import "./navbar.css";

const navLinks = [
    { name: "Home", path: "/", end: true },
    { name: "About", path: "/about" },
    { name: "Shop", path: "/shop" },
    { name: "Recipes", path: "/recipes" },
    { name: "Blogs", path: "/blogs" },
    { name: "CSR", path: "/csr" },
    { name: "FAQs", path: "/pages/faqs", end: true },
];

const Navbar = () => {
    const [logo, setLogo] = useState("");
    const [logoTitle, setLogoTitle] = useState("Elacher Ghor home");
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(false);
    const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 30);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [recentProductIds, setRecentProductIds] = useState(getRecentlySearchedProductIds);
    const [addedSearchProductId, setAddedSearchProductId] = useState(null);

    useEffect(() => {
        const syncRecentProducts = (event) => setRecentProductIds(Array.isArray(event.detail) ? event.detail : getRecentlySearchedProductIds());
        window.addEventListener("elacher:recent-search-products-change", syncRecentProducts);
        window.addEventListener("storage", syncRecentProducts);
        return () => {
            window.removeEventListener("elacher:recent-search-products-change", syncRecentProducts);
            window.removeEventListener("storage", syncRecentProducts);
        };
    }, []);
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { itemCount, addItem } = useBag();
    const { formatPrice } = useCurrency();
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    const hasImageHero = ["/", "/about", "/shop", "/recipes", "/blogs", "/csr", "/pages/csr", "/blogs/recipes", "/blogs/p"].includes(pathname);
    const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
    const searchResults = useMemo(() => {
        if (!normalizedSearchQuery) return [];
        return products
            .filter((product) => `${product.name || ""} ${product.id || ""}`.toLocaleLowerCase().includes(normalizedSearchQuery))
            .slice(0, 5);
    }, [normalizedSearchQuery, products]);
    const recentlySearchedProducts = useMemo(() => {
        const productsById = new Map(products.map((product) => [product.id, product]));
        return recentProductIds.map((id) => productsById.get(id)).filter(Boolean);
    }, [products, recentProductIds]);

    const closeOverlays = () => {
        setMenuOpen(false);
        setSearchFocused(false);
    };

    useEffect(() => {
        if (searchFocused) searchInputRef.current?.focus();
    }, [searchFocused]);

    const handlePageNavigation = () => {
        closeOverlays();
        scrollToTop();
    };

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            fetch(HOME_DATA_URL, { signal: controller.signal }),
            fetch(PRODUCTS_DATA_URL, { signal: controller.signal }),
        ])
            .then(async ([homeResponse, productsResponse]) => {
                if (!homeResponse.ok || !productsResponse.ok) throw new Error("Failed to load navbar data");
                return [await homeResponse.json(), await productsResponse.json()];
            })
            .then(([homeData, productsData]) => {
                setLogo(getImageUrl(homeData.navbar?.logo));
                setLogoTitle(homeData.navbar?.logoTitle || "Elacher Ghor home");
                setProducts(Array.isArray(productsData.products) ? productsData.products : []);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setProductsError(true);
                    console.error("Navbar error:", error);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setProductsLoading(false);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setSearchFocused(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!searchContainerRef.current?.contains(event.target)) setSearchFocused(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const submitSearch = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) {
            searchInputRef.current?.focus();
            return;
        }
        setSearchFocused(false);
        navigate(getAppPath(`/search?q=${encodeURIComponent(query)}`));
    };

    const addSearchProductToBag = (event, product) => {
        event.preventDefault();
        event.stopPropagation();
        addItem(product);
        setRecentProductIds(recordRecentlySearchedProduct(product.id));
        setAddedSearchProductId(product.id);
        window.setTimeout(() => setAddedSearchProductId((current) => current === product.id ? null : current), 1500);
    };

    return (
        <header className={`navbar ${isScrolled ? "scrolled" : ""} ${hasImageHero ? "navbar--hero" : ""} ${menuOpen ? "menu-open" : ""}`}>
            <div className="navbar-logo">
                <NavLink to={getAppPath("/")} aria-label="Elacher Ghor Home" onClick={handlePageNavigation}>
                    {logo && <img src={logo} alt="Elacher Ghor" title={logoTitle} />}
                </NavLink>
            </div>

            <div className="navbar-actions">
                <div className="navbar-search-tools">
                <div className={`navbar-search${searchFocused ? " is-open" : ""}`} ref={searchContainerRef}>
                    <button
                        className="navbar-search__trigger"
                        type="button"
                        aria-label="Open search"
                        aria-expanded={searchFocused}
                        aria-controls="navbar-search-drawer"
                        onClick={() => {
                            setMenuOpen(false);
                            setSearchFocused(true);
                        }}
                    >
                        <Search aria-hidden="true" />
                    </button>

                    {searchFocused && (
                        <div className="navbar-search__overlay">
                            <button className="navbar-search__backdrop" type="button" aria-label="Close search" onClick={() => setSearchFocused(false)} />
                            <section className="navbar-search__drawer" id="navbar-search-drawer" role="dialog" aria-modal="true" aria-label="Search store">
                                <Leaf className="navbar-search__watermark" aria-hidden="true" />
                                <div className="navbar-search__drawer-header">
                                    <div className="navbar-search__drawer-heading">
                                        <p className="navbar-search__eyebrow"><Leaf size={15} aria-hidden="true" /> ELAICHI GHOR · CARDAMOM</p>
                                        <h2>Find your favourite</h2>
                                        <p className="navbar-search__subtitle">Search our cardamom grades and recipes.</p>
                                    </div>
                                    <button className="navbar-search__close" type="button" aria-label="Close search" onClick={() => setSearchFocused(false)}>
                                        <X aria-hidden="true" />
                                    </button>
                                </div>
                                <form className="navbar-search__form" role="search" onSubmit={submitSearch}>
                                    <Search aria-hidden="true" />
                                    <input
                                        ref={searchInputRef}
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search recipes, products..."
                                        aria-label="Search recipes and products"
                                        aria-expanded={Boolean(normalizedSearchQuery)}
                                        aria-controls="navbar-search-results"
                                    />
                                </form>

                                {normalizedSearchQuery ? (
                                    <div className="navbar-search__results" id="navbar-search-results">
                                        <div className="navbar-search__results-heading">
                                            <span>{productsLoading ? "Searching…" : `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"}`}</span>
                                            <button type="button" onClick={submitSearch}>See all</button>
                                        </div>
                                        {productsError && <p className="navbar-search__message" role="alert">We couldn’t load products. Please try again.</p>}
                                        {!productsLoading && !productsError && searchResults.length > 0 && searchResults.map((product) => (
                                            <div className="navbar-search-result" key={product.id}>
                                                <Link className="navbar-search-result__link" to={getAppPath(`/products/${product.id}`)} onClick={() => { setRecentProductIds(recordRecentlySearchedProduct(product.id)); setSearchQuery(""); handlePageNavigation(); }}>
                                                    <span className="navbar-search-result__image">{product.image && <img src={getImageUrl(product.image)} alt="" loading="lazy" />}</span>
                                                    <span className="navbar-search-result__details"><span className="navbar-search-result__name">{product.name}</span><span className="navbar-search-result__price notranslate" translate="no">{formatPrice(product.price)}</span></span>
                                                </Link>
                                                <button className={`navbar-search-result__add${addedSearchProductId === product.id ? " is-added" : ""}`} type="button" aria-label={`Add ${product.name} to bag`} onClick={(event) => addSearchProductToBag(event, product)}><ShoppingBag size={16} aria-hidden="true" /><span>{addedSearchProductId === product.id ? "Added to bag" : "Add to bag"}</span></button>
                                            </div>
                                        ))}
                                        {!productsLoading && !productsError && searchResults.length === 0 && (
                                            <p className="navbar-search__message">No products found for “{searchQuery.trim()}”.</p>
                                        )}
                                    </div>
                                ) : !productsLoading && recentlySearchedProducts.length > 0 ? (
                                    <div className="navbar-search__results" id="navbar-search-results">
                                        <div className="navbar-search__results-heading"><span>Recently searched products</span><button type="button" onClick={() => setRecentProductIds(clearRecentlySearchedProducts())}>Clear</button></div>
                                        {recentlySearchedProducts.map((product) => (
                                            <div className="navbar-search-result" key={product.id}>
                                                <Link className="navbar-search-result__link" to={getAppPath(`/products/${product.id}`)} onClick={() => { setRecentProductIds(recordRecentlySearchedProduct(product.id)); handlePageNavigation(); }}>
                                                    <span className="navbar-search-result__image">{product.image && <img src={getImageUrl(product.image)} alt="" loading="lazy" />}</span>
                                                    <span className="navbar-search-result__details"><span className="navbar-search-result__name">{product.name}</span><span className="navbar-search-result__price notranslate" translate="no">{formatPrice(product.price)}</span></span>
                                                </Link>
                                                <button className={`navbar-search-result__add${addedSearchProductId === product.id ? " is-added" : ""}`} type="button" aria-label={`Add ${product.name} to bag`} onClick={(event) => addSearchProductToBag(event, product)}><ShoppingBag size={16} aria-hidden="true" /><span>{addedSearchProductId === product.id ? "Added to bag" : "Add to bag"}</span></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="navbar-search__message navbar-search__message--hint">Search our cardamom grades and recipes.</p>
                                )}
                            </section>
                        </div>
                    )}
                </div>
                    <LanguageSwitcher />
                </div>

                <div className="navbar-action-icons">
                    <span className="navbar-profile-icon" role="img" aria-label="Profile" title="Profile">
                    <UserRound aria-hidden="true" />
                    </span>

                <NavLink
                    to={getAppPath("/bag")}
                    className={({ isActive }) => `navbar-icon navbar-bag-link ${isActive ? "active" : ""}`}
                    aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                    onClick={handlePageNavigation}
                >
                    <ShoppingBag />
                    {itemCount > 0 && <span className="navbar-bag-count" aria-hidden="true">{itemCount > 99 ? "99+" : itemCount}</span>}
                </NavLink>

                <button
                    type="button"
                    className="navbar-toggle"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    onClick={() => {
                        setSearchFocused(false);
                        setMenuOpen((previous) => !previous);
                    }}
                >
                    {menuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            <nav id="main-navigation" className={`navbar-menu ${menuOpen ? "show" : ""}`} aria-label="Main navigation">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={getAppPath(link.path)}
                        end={link.end}
                        onClick={handlePageNavigation}
                        className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
                    >
                        {link.name}
                        <span className="navbar-link-arrow" aria-hidden="true">↗</span>
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                className={`navbar-backdrop ${menuOpen ? "show" : ""}`}
                aria-label="Close navigation menu"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
            />
        </header>
    );
};

export default Navbar;
