import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpRight,
    Bell,
    BookOpenText,
    Boxes,
    Check,
    ChevronDown,
    CircleAlert,
    CircleHelp,
    Clock3,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Eye,
    FileText,
    LayoutDashboard,
    Leaf,
    LogOut,
    Menu,
    Package,
    Pencil,
    Plus,
    Save,
    Search,
    Settings,
    ShoppingCart,
    Trash2,
    UserRound,
    Users,
    Warehouse,
    X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ADMIN_SETTINGS_URL, BLOG_DATA_URL, EDITORIAL_DATA_URL, HOME_DATA_URL, PRODUCT_DETAILS_URL, RECIPE_DATA_URL, getImageUrl, migrateImagePath } from "../config.js";
import { hasTrackedStock, isProductAvailable, isProductOutOfStock } from "../utils/productAvailability.js";
import AdminJsonEditor from "./AdminJsonEditor.jsx";
import "./admin.css";

const DRAFT_KEY = "elacher-ghor-admin-draft-v1";
const CONTENT_FILES = {
    home: { label: "Products", path: "data/home.json", url: HOME_DATA_URL },
    recipe: { label: "Recipes", path: "data/recipe.json", url: RECIPE_DATA_URL },
    blog: { label: "Blogs", path: "data/blog.json", url: BLOG_DATA_URL },
    editorial: { label: "CSR content", path: "data/editorial.json", url: EDITORIAL_DATA_URL },
};
const ADMIN_SETTINGS_FILE = { label: "Admin settings", path: "data/admin-settings.json", url: ADMIN_SETTINGS_URL };
const ALL_DATA_FILES = { ...CONTENT_FILES, adminSettings: ADMIN_SETTINGS_FILE };

const SIDE_GROUPS = [
    { label: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
    { label: "STORE", items: [
        { id: "products", label: "Products", icon: Package },
        { id: "orders", label: "Orders", icon: ShoppingCart },
        { id: "customers", label: "Users / Customers", icon: Users },
        { id: "inventory", label: "Inventory", icon: Warehouse },
    ] },
    { label: "WEBSITE", items: [
        { id: "editorial", label: "Recipes & Blogs", icon: BookOpenText },
        { id: "settings", label: "Settings", icon: Settings },
    ] },
];

const PAGE_TITLES = Object.fromEntries(SIDE_GROUPS.flatMap((group) => group.items.map(({ id, label }) => [id, label])));
const BASE_URL = import.meta.env.BASE_URL;

const clone = (value) => JSON.parse(JSON.stringify(value));
const today = () => new Date().toISOString().slice(0, 10);
const mergePostsBySlug = (...collections) => {
    const posts = new Map();
    collections.flat().filter((item) => item && typeof item === "object" && item.slug).forEach((item) => {
        posts.set(item.slug, { ...(posts.get(item.slug) || {}), ...item });
    });
    return [...posts.values()];
};

function getEditorialAdminEntries(data, kind) {
    if (kind === "recipes") {
        return [
            ...(data?.recipe?.recipes || []).map((item) => ({ item, collection: "recipes" })),
            ...(data?.recipe?.localRecipes || []).map((item) => ({ item, collection: "localRecipes" })),
        ];
    }
    return (data?.blog?.blogs || []).map((item) => ({ item, collection: "blogs" }));
}
const slugify = (value) => String(value || "").trim().toLocaleLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const numberOrNull = (value) => value === "" || value == null || !Number.isFinite(Number(value)) ? null : Number(value);
const isLowStock = (product, threshold) => hasTrackedStock(product) && Number(product.stockQty) > 0 && Number(product.stockQty) <= threshold;
const currency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);

function gatherImagePaths(value, result = new Set()) {
    if (Array.isArray(value)) value.forEach((child) => gatherImagePaths(child, result));
    else if (value && typeof value === "object") Object.values(value).forEach((child) => gatherImagePaths(child, result));
    else if (typeof value === "string" && (/^\/images\//i.test(value) || /^https?:\/\/.+\.(png|jpe?g|webp|avif|gif)(\?.*)?$/i.test(value))) result.add(value);
    return [...result].sort((a, b) => a.localeCompare(b));
}

function migrateDraftImagePaths(value) {
    if (Array.isArray(value)) return value.map(migrateDraftImagePaths);
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, migrateDraftImagePaths(child)]));
    }
    return typeof value === "string" ? migrateImagePath(value) : value;
}

function getEmptyStateData(core, savedDraft) {
    const data = { ...core, productDetails: { ...(core.productDetails || {}) } };
    if (!savedDraft || typeof savedDraft !== "object") return migrateDraftImagePaths(data);
    for (const key of Object.keys(CONTENT_FILES)) {
        if (savedDraft[key] && typeof savedDraft[key] === "object") {
            data[key] = key === "editorial" ? { ...core.editorial, ...savedDraft.editorial } : savedDraft[key];
        }
    }
    const legacyEditorial = savedDraft.editorial || {};
    if (!savedDraft.recipe && (legacyEditorial.recipes || legacyEditorial.sourceRecipes || core.recipe?.recipes)) {
        const oldRecipes = [...(legacyEditorial.sourceRecipes || []), ...(legacyEditorial.recipes || [])];
        const archiveSlugs = new Set((core.recipe?.recipes || []).map((item) => item.slug));
        data.recipe = {
            ...core.recipe,
            recipes: mergePostsBySlug(oldRecipes.filter((item) => archiveSlugs.has(item.slug)), core.recipe?.recipes || []),
            localRecipes: mergePostsBySlug(oldRecipes.filter((item) => !archiveSlugs.has(item.slug)), core.recipe?.localRecipes || []),
        };
    }
    if (savedDraft.blog && typeof savedDraft.blog === "object") {
        data.blog = {
            ...core.blog,
            ...savedDraft.blog,
            blogs: mergePostsBySlug(core.blog?.blogs || [], savedDraft.blog.blogs || []),
        };
    } else if (legacyEditorial.blogs || core.blog?.blogs) {
        data.blog = { ...core.blog, blogs: mergePostsBySlug(legacyEditorial.blogs || [], core.blog?.blogs || []) };
    }
    if (savedDraft.editorial) {
        const oldContentKeys = new Set(["recipes", "sourceRecipes", "blogs", "recipesPage", "blogsPage"]);
        const editorialContent = Object.fromEntries(Object.entries(savedDraft.editorial).filter(([key]) => !oldContentKeys.has(key)));
        data.editorial = { ...core.editorial, ...editorialContent };
    }
    if (savedDraft.adminSettings && typeof savedDraft.adminSettings === "object") data.adminSettings = savedDraft.adminSettings;
    if (savedDraft.productDetails && typeof savedDraft.productDetails === "object") {
        data.productDetails = { ...data.productDetails, ...savedDraft.productDetails };
    }
    for (const [key, value] of Object.entries(savedDraft)) {
        if (key.startsWith("product:") && value && typeof value === "object") data.productDetails[key.slice("product:".length)] = value;
    }
    return migrateDraftImagePaths(data);
}

function TextField({ label, value, onChange, type = "text", required = false, min, step, list, help, wide = false }) {
    return (
        <label className={`admin-form-field ${wide ? "admin-form-field--wide" : ""}`}>
            <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
            <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} min={min} step={step} list={list} />
            {help && <small>{help}</small>}
        </label>
    );
}

function EmptyState({ icon: Icon = CircleHelp, title, children }) {
    return <div className="admin-empty-state"><span><Icon size={21} /></span><h3>{title}</h3>{children && <p>{children}</p>}</div>;
}

function StatCard({ icon: Icon, label, value, note, tone = "green" }) {
    return <article className={`admin-stat admin-stat--${tone}`}><span className="admin-stat__icon"><Icon size={18} /></span><span className="admin-stat__label">{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function ProductEditor({ product, detail, existingIds, onClose, onSave, onUploadImage, isSaving }) {
    const [form, setForm] = useState(() => ({
        id: product?.id || "",
        name: product?.name || "",
        category: product?.category || "Cardamom",
        grade: detail?.grade || product?.grade || "",
        price: product?.price ?? "",
        originalPrice: product?.originalPrice ?? "",
        weight: product?.weight || "100 g",
        sku: product?.sku || "",
        image: product?.image || "",
        imageAlt: product?.imageAlt || "",
        imageTitle: product?.imageTitle || "",
        description: detail?.description || product?.description || "",
        stockQty: product?.stockQty ?? "",
        available: product?.available === false ? "false" : "true",
        highlights: Array.isArray(detail?.highlights) ? detail.highlights.join("\n") : "",
    }));
    const [formError, setFormError] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [idEdited, setIdEdited] = useState(Boolean(product));
    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const submit = (event) => {
        event.preventDefault();
        if (isSaving) return;
        const id = (form.id || slugify(form.name)).trim().toLowerCase();
        if (!id || !/^[a-z0-9-]+$/.test(id)) return setFormError("Use a product ID with lowercase letters, numbers, and hyphens only.");
        if (existingIds.includes(id) && id !== product?.id) return setFormError(`The product ID “${id}” is already in use.`);
        const price = numberOrNull(form.price);
        if (!form.name.trim() || !form.grade.trim() || price == null || price < 0 || !form.image.trim() || !form.imageAlt.trim() || !form.description.trim()) {
            return setFormError("Complete the required name, grade, price, image, image alt text, and description fields.");
        }
        const stockQty = numberOrNull(form.stockQty);
        if (stockQty != null && stockQty < 0) return setFormError("Stock quantity cannot be negative.");
        onSave({ ...form, id, price, originalPrice: numberOrNull(form.originalPrice), stockQty });
    };

    return (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="product-editor-title">
                <header className="admin-modal__header"><div><p className="admin-eyebrow">PRODUCT CATALOGUE</p><h2 id="product-editor-title">{product ? "Edit product" : "Add a product"}</h2></div><button className="admin-icon-button" type="button" aria-label="Close" onClick={onClose}><X size={19} /></button></header>
                {formError && <p className="admin-inline-error" role="alert"><CircleAlert size={16} />{formError}</p>}
                <form onSubmit={submit}>
                    <div className="admin-form-grid">
                        <TextField label="Product name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value, id: idEdited ? current.id : slugify(value) }))} required />
                        <TextField label="Product ID" value={form.id} onChange={(value) => { setIdEdited(true); update("id", value); }} required help="Used in the product detail URL and JSON filename." />
                        <TextField label="Category" value={form.category} onChange={(value) => update("category", value)} required />
                        <TextField label="Grade / size" value={form.grade} onChange={(value) => update("grade", value)} required />
                        <TextField label="Price (₹) for default pack" value={form.price} onChange={(value) => update("price", value)} type="number" min="0" step="0.01" required help="The other 100 g, 250 g, and 500 g prices scale from this pack size." />
                        <TextField label="Original price (₹) for default pack" value={form.originalPrice} onChange={(value) => update("originalPrice", value)} type="number" min="0" step="0.01" />
                        <label className="admin-form-field"><span>Default pack size</span><select value={form.weight} onChange={(event) => update("weight", event.target.value)}><option>100 g</option><option>250 g</option><option>500 g</option></select><small>Customers can choose any of these three sizes. The other pack prices scale from this size.</small></label>
                        <TextField label="SKU" value={form.sku} onChange={(value) => update("sku", value)} help="Optional; no SKU is present in the current catalogue." />
                        <label className="admin-form-field admin-form-field--wide"><span>Product image path or URL *</span><input type="text" list="admin-image-assets" value={form.image} onChange={(event) => update("image", event.target.value)} required /><span className="admin-image-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" disabled={uploadingImage} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploadingImage(true); setFormError(""); try { update("image", await onUploadImage(file)); } catch (error) { setFormError(error.message || "The image could not be uploaded."); } finally { setUploadingImage(false); event.target.value = ""; } }} /><small>{uploadingImage ? "Uploading image…" : "Upload into public/images/admin-uploads/ or enter a current image path."}</small></span><small>Select an existing image or enter a path such as /images/shop/product.jpg.</small></label>
                        <TextField label="Image alt text" value={form.imageAlt} onChange={(value) => update("imageAlt", value)} required help="Describe the visible product image for screen-reader users." wide />
                        <TextField label="Image title" value={form.imageTitle} onChange={(value) => update("imageTitle", value)} help="Short text shown when a visitor hovers over the image." wide />
                        <label className="admin-form-field admin-form-field--wide"><span>Description *</span><textarea rows="4" value={form.description} onChange={(event) => update("description", event.target.value)} required /></label>
                        <label className="admin-form-field admin-form-field--wide"><span>Product highlights</span><textarea rows="3" value={form.highlights} onChange={(event) => update("highlights", event.target.value)} placeholder="One highlight per line" /></label>
                        <TextField label="Stock quantity" value={form.stockQty} onChange={(value) => update("stockQty", value)} type="number" min="0" step="1" help="Leave blank if stock is not tracked yet." />
                        <label className="admin-form-field"><span>Availability</span><select value={form.available} onChange={(event) => update("available", event.target.value)}><option value="true">Available</option><option value="false">Unavailable</option></select></label>
                    </div>
                    {form.image && <div className="admin-product-preview"><img src={getImageUrl(form.image)} alt={form.imageAlt || form.name} title={form.imageTitle || form.name || "Product image preview"} onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>Image preview</span></div>}
                    <footer className="admin-modal__footer"><button className="admin-button admin-button--quiet" type="button" onClick={onClose} disabled={isSaving}>Cancel</button><button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>{isSaving ? <span className="admin-spinner" /> : <Check size={15} />}{isSaving ? "Saving product…" : "Save product"}</button></footer>
                </form>
            </section>
        </div>
    );
}

function EditorialPreview({ item, kind, onClose }) {
    const image = item.image || item.heroImage;
    const excerpt = item.excerpt || item.description;
    const sections = kind === "recipes"
        ? (item.steps || [])
        : (item.sections || []);
    return (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <article className="admin-modal admin-preview-modal" role="dialog" aria-modal="true" aria-labelledby="editorial-preview-title">
                <header className="admin-modal__header"><div><p className="admin-eyebrow">CONTENT PREVIEW · {String(item.status || "published").toUpperCase()}</p><h2 id="editorial-preview-title">Preview</h2></div><button className="admin-icon-button" type="button" aria-label="Close preview" onClick={onClose}><X size={19} /></button></header>
                {image && <img className="admin-preview-image" src={getImageUrl(image)} alt={item.imageAlt || item.title || (kind === "recipes" ? "Recipe image preview" : "Blog image preview")} title={item.imageTitle || item.title || (kind === "recipes" ? "Recipe image preview" : "Blog image preview")} />}
                <div className="admin-preview-copy"><p className="admin-eyebrow">{item.category || (kind === "recipes" ? "Recipe" : "Story")}</p><h3>{item.title || "Untitled"}</h3><p>{excerpt || "Add a short introduction to preview the content."}</p>
                    {Array.isArray(item.ingredients) && item.ingredients.length > 0 && <><h4>Ingredients</h4><ul>{item.ingredients.map((ingredient, index) => <li key={`${ingredient}-${index}`}>{ingredient}</li>)}</ul></>}
                    {Array.isArray(sections) && sections.map((part, index) => {
                        const copy = typeof part === "string" ? part : [part.heading, part.body, part.text, ...(Array.isArray(part.paragraphs) ? part.paragraphs : [])].filter(Boolean).join("\n\n");
                        return <p key={index}>{copy || (kind === "recipes" ? `${index + 1}. ${part.instruction || "Recipe step"}` : "Article section")}</p>;
                    })}
                </div>
                <footer className="admin-modal__footer"><button className="admin-button admin-button--quiet" type="button" onClick={onClose}>Close preview</button></footer>
            </article>
        </div>
    );
}

function AdminPage() {
    const { section: routeSection = "dashboard" } = useParams();
    const navigate = useNavigate();
    const section = PAGE_TITLES[routeSection] ? routeSection : "dashboard";
    const [data, setData] = useState(null);
    const [originals, setOriginals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [notice, setNotice] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [projectDirectory, setProjectDirectory] = useState(null);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [productModal, setProductModal] = useState(null);
    const [productSearch, setProductSearch] = useState("");
    const [productCategory, setProductCategory] = useState("all");
    const [productGrade, setProductGrade] = useState("all");
    const [productAvailability, setProductAvailability] = useState("all");
    const [inventorySearch, setInventorySearch] = useState("");
    const [editorialKind, setEditorialKind] = useState("recipes");
    const [editorialModal, setEditorialModal] = useState(null);
    const [editorialPreview, setEditorialPreview] = useState(null);
    const [editorialSearch, setEditorialSearch] = useState("");

    useEffect(() => {
        let active = true;
        const fetchJson = async (url, optional = false) => {
            const response = await fetch(url, { cache: "no-store" });
            if (optional && response.status === 404) return null;
            if (!response.ok) throw new Error(`Could not load ${url}.`);
            return response.json();
        };
        const load = async () => {
            try {
                const entries = await Promise.all(Object.entries(ALL_DATA_FILES).map(async ([key, file]) => [key, await fetchJson(file.url)]));
                const core = Object.fromEntries(entries);
                const detailEntries = await Promise.all((core.home.products || []).map(async (product) => [product.id, await fetchJson(`${PRODUCT_DETAILS_URL}${encodeURIComponent(product.id)}.json`, true)]));
                core.productDetails = Object.fromEntries(detailEntries.map(([id, detail]) => [id, detail || { id, grade: "", description: "", highlights: [] }]));

                let savedDraft = {};
                try { savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"); }
                catch { localStorage.removeItem(DRAFT_KEY); }
                const draftData = getEmptyStateData(core, savedDraft);
                if (active) {
                    setOriginals(core);
                    setData(draftData);
                }
            } catch (error) {
                if (active) setLoadError(error.message || "The website data could not be loaded.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
    }, [section]);

    useEffect(() => {
        if (!data) return;
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); }
        catch { setNotice("Browser draft storage is full. Download your JSON to keep the changes."); }
    }, [data]);

    const products = data?.home?.products || [];
    const settings = data?.adminSettings || { lowStockThreshold: 5 };
    const threshold = Math.max(0, Number(settings.lowStockThreshold ?? 5) || 0);
    const lowStockProducts = products.filter((product) => isLowStock(product, threshold));
    const outOfStockProducts = products.filter(isProductOutOfStock);
    const imagePaths = useMemo(() => data ? gatherImagePaths(data) : [], [data]);
    const isDirty = Boolean(data && originals && JSON.stringify(data) !== JSON.stringify(originals));
    const isSettingsDirty = Boolean(data && originals && JSON.stringify(data.adminSettings) !== JSON.stringify(originals.adminSettings));
    const productCategories = [...new Set(products.map((product) => product.category || "Cardamom"))].sort();
    const productGrades = [...new Set(products.map((product) => data?.productDetails?.[product.id]?.grade || product.grade).filter(Boolean))].sort();

    const updateData = (key, value) => setData((current) => ({ ...current, [key]: value }));
    const updateHomeProducts = (updater) => setData((current) => ({ ...current, home: { ...current.home, products: updater(current.home.products || []) } }));
    const updateEditorialList = (kind, collection, updater) => {
        const fileKey = kind === "recipes" ? "recipe" : "blog";
        setData((current) => ({
            ...current,
            [fileKey]: { ...current[fileKey], [collection]: updater(current[fileKey]?.[collection] || []) },
        }));
    };

    const changedFiles = useMemo(() => {
        if (!data || !originals) return [];
        const changed = [];
        for (const [key, file] of Object.entries(ALL_DATA_FILES)) {
            if (JSON.stringify(data[key]) !== JSON.stringify(originals[key])) changed.push({ path: file.path, content: data[key] });
        }
        const currentIds = new Set((data.home.products || []).map((product) => product.id));
        for (const id of currentIds) {
            const next = data.productDetails?.[id];
            if (next && JSON.stringify(next) !== JSON.stringify(originals.productDetails?.[id])) {
                changed.push({ path: `data/products/${id}.json`, content: next });
            }
        }
        return changed;
    }, [data, originals]);

    const deletedProductIds = useMemo(() => {
        if (!data || !originals) return [];
        const remaining = new Set((data.home.products || []).map((product) => product.id));
        return (originals.home.products || []).map((product) => product.id).filter((id) => !remaining.has(id));
    }, [data, originals]);

    const saveChanges = async () => {
        if (!changedFiles.length && !deletedProductIds.length) return;
        setIsSaving(true);
        setNotice("");
        try {
            if (import.meta.env.DEV) {
                const response = await fetch(`${BASE_URL}__local-admin/save-files`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ writes: changedFiles, deletes: deletedProductIds.map((id) => `data/products/${id}.json`) }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "The local file writer could not save the changes.");
            } else {
                if (!projectDirectory) throw new Error("Connect your project folder before writing JSON files.");
                let permission = await projectDirectory.queryPermission({ mode: "readwrite" });
                if (permission !== "granted") permission = await projectDirectory.requestPermission({ mode: "readwrite" });
                if (permission !== "granted") throw new Error("Folder permission was not granted.");
                for (const file of changedFiles) await writeJsonFile(projectDirectory, `public/${file.path}`, file.content);
                const productDirectory = await projectDirectory.getDirectoryHandle("public").then((root) => root.getDirectoryHandle("data")).then((directory) => directory.getDirectoryHandle("products"));
                for (const id of deletedProductIds) await productDirectory.removeEntry(`${id}.json`).catch((error) => { if (error.name !== "NotFoundError") throw error; });
            }
            setOriginals(clone(data));
            setNotice(`Saved ${changedFiles.length} JSON file${changedFiles.length === 1 ? "" : "s"}${deletedProductIds.length ? ` and removed ${deletedProductIds.length} product detail file${deletedProductIds.length === 1 ? "" : "s"}` : ""}. Refresh the storefront to see the changes.`);
        } catch (error) {
            setNotice(error.message || "Could not save the website data.");
        } finally {
            setIsSaving(false);
        }
    };

    const writeJsonFile = async (rootDirectory, relativePath, value) => {
        const parts = relativePath.split("/");
        const fileName = parts.pop();
        let directory = rootDirectory;
        for (const part of parts) directory = await directory.getDirectoryHandle(part, { create: true });
        const fileHandle = await directory.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        try { await writable.write(`${JSON.stringify(value, null, 2)}\n`); await writable.close(); }
        catch (error) { await writable.abort().catch(() => {}); throw error; }
    };

    const connectFolder = async () => {
        if (!window.showDirectoryPicker) return setNotice("This browser cannot connect to a project folder. Run the local Vite server or download and replace the JSON file.");
        try {
            const directory = await window.showDirectoryPicker({ mode: "readwrite", id: "elacher-ghor-admin-project" });
            const permission = await directory.requestPermission({ mode: "readwrite" });
            if (permission !== "granted") return setNotice("Folder permission was not granted.");
            setProjectDirectory(directory);
            setNotice(`Connected to ${directory.name}. Save Changes will write the JSON files into that project folder.`);
        } catch (error) {
            if (error.name !== "AbortError") setNotice("Could not connect to that folder. Select the project root and try again.");
        }
    };

    const uploadImage = async (file) => {
        const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
        if (!file || !extensions[file.type]) throw new Error("Choose a PNG, JPG, WebP, GIF, or AVIF image.");
        if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8 MB or smaller.");
        const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "cardamom-image";
        const extension = extensions[file.type];
        const fileName = `${baseName.slice(0, 48)}-${Date.now()}.${extension}`;
        let imagePath;

        if (import.meta.env.DEV) {
            const response = await fetch(`${BASE_URL}__local-admin/upload-image`, {
                method: "POST",
                headers: { "Content-Type": file.type, "X-Upload-Name": encodeURIComponent(file.name) },
                body: file,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "The local image writer could not save this image.");
            imagePath = result.path;
        } else {
            if (!projectDirectory) throw new Error("Connect your project folder before uploading an image.");
            let permission = await projectDirectory.queryPermission({ mode: "readwrite" });
            if (permission !== "granted") permission = await projectDirectory.requestPermission({ mode: "readwrite" });
            if (permission !== "granted") throw new Error("Folder permission was not granted.");
            const publicDirectory = await projectDirectory.getDirectoryHandle("public", { create: true });
            const imagesDirectory = await publicDirectory.getDirectoryHandle("images", { create: true });
            const uploadsDirectory = await imagesDirectory.getDirectoryHandle("admin-uploads", { create: true });
            const fileHandle = await uploadsDirectory.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            try { await writable.write(file); await writable.close(); }
            catch (error) { await writable.abort().catch(() => {}); throw error; }
            imagePath = `/images/admin-uploads/${fileName}`;
        }
        setNotice(`Uploaded ${file.name} to public${imagePath}. Save the content JSON to reference it on the site.`);
        return imagePath;
    };

    const downloadJson = (fileKey) => {
        const file = ALL_DATA_FILES[fileKey];
        if (!file || !data?.[fileKey]) return;
        const blob = new Blob([`${JSON.stringify(data[fileKey], null, 2)}\n`], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.path.split("/").pop();
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice(`${anchor.download} downloaded. Replace the matching file under public/data/ to apply it.`);
    };

    const saveProductDraft = async (form) => {
        const exists = products.some((product) => product.id === form.id);
        if (exists && form.id !== productModal?.product?.id) {
            setNotice(`A product with the ID “${form.id}” already exists.`);
            return;
        }
        const previous = productModal?.product;
        const selectedWeight = form.weight.trim() || "100 g";
        const selectedWeightGrams = Number(selectedWeight.replace(/[^0-9.]/g, "")) || 100;
        const originalPrice = numberOrNull(form.originalPrice);
        const variants = [100, 250, 500].map((grams) => ({
            weight: `${grams} g`,
            price: Math.round(form.price * grams / selectedWeightGrams),
            ...(originalPrice == null ? {} : { originalPrice: Math.round(originalPrice * grams / selectedWeightGrams) }),
        }));
        const nextProduct = {
            ...(previous || {}),
            id: form.id,
            name: form.name.trim(),
            category: form.category.trim() || "Cardamom",
            weight: selectedWeight,
            price: form.price,
            variants,
            image: form.image.trim(),
            available: form.stockQty === 0 ? false : form.available === "true",
        };
        if (originalPrice != null) nextProduct.originalPrice = originalPrice;
        else delete nextProduct.originalPrice;
        if (form.sku.trim()) nextProduct.sku = form.sku.trim();
        else delete nextProduct.sku;
        if (form.imageAlt.trim()) nextProduct.imageAlt = form.imageAlt.trim();
        else delete nextProduct.imageAlt;
        if (form.imageTitle.trim()) nextProduct.imageTitle = form.imageTitle.trim();
        else delete nextProduct.imageTitle;
        if (form.stockQty != null) {
            nextProduct.stockQty = form.stockQty;
            if (!previous || previous.stockQty !== form.stockQty) nextProduct.stockUpdatedAt = today();
        } else {
            delete nextProduct.stockQty;
            delete nextProduct.stockUpdatedAt;
        }
        const previousDetails = data.productDetails?.[form.id] || {};
        const detail = {
            ...previousDetails,
            id: form.id,
            grade: form.grade.trim(),
            description: form.description.trim(),
            highlights: form.highlights.split("\n").map((line) => line.trim()).filter(Boolean),
        };
        const nextData = {
            ...data,
            home: { ...data.home, products: previous ? data.home.products.map((product) => product.id === previous.id ? nextProduct : product) : [...data.home.products, nextProduct] },
            productDetails: { ...data.productDetails, [form.id]: detail },
        };
        const files = [
            { path: `data/products/${form.id}.json`, content: detail },
            { path: "data/home.json", content: nextData.home },
        ];
        setIsSaving(true);
        setNotice("");
        try {
            if (import.meta.env.DEV) {
                // The older local Vite writer also supports save-json, so product saves
                // keep working even if Vite has not been restarted after a config edit.
                for (const file of files) {
                    const response = await fetch(`${BASE_URL}__local-admin/save-json`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(file),
                    });
                    const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
                    if (!isJsonResponse) throw new Error("The local JSON save route is not running. Restart the Vite server with npm run dev, then save the product again.");
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || `Could not save ${file.path}.`);
                }
            } else if (projectDirectory) {
                let permission = await projectDirectory.queryPermission({ mode: "readwrite" });
                if (permission !== "granted") permission = await projectDirectory.requestPermission({ mode: "readwrite" });
                if (permission !== "granted") throw new Error("Folder permission was not granted.");
                for (const file of files) await writeJsonFile(projectDirectory, `public/${file.path}`, file.content);
            } else {
                setData(nextData);
                setProductModal(null);
                setNotice("Product is only in this browser’s admin draft so far. To show it on Shop, run the site locally or connect the project folder and use Save changes. A GitHub Pages site cannot write its JSON files by itself.");
                return;
            }

            setData(nextData);
            setOriginals(clone(nextData));
            setProductModal(null);
            const hiddenReason = !isProductAvailable(nextProduct)
                ? " It is currently marked unavailable or has zero stock, so it will not appear on Shop until availability is turned on and stock is above zero."
                : " Refresh the Shop page to see it.";
            setNotice(`${previous ? "Product updated" : "Product added"} and saved to public/data/home.json and its product detail JSON.${hiddenReason}`);
        } catch (error) {
            setNotice(error.message || "The product could not be saved to the website JSON files.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteProduct = (product) => {
        if (!window.confirm(`Delete ${product.name}? This removes it from the shop and removes its product detail JSON when you save changes.`)) return;
        setData((current) => {
            const productDetails = { ...current.productDetails };
            delete productDetails[product.id];
            return { ...current, home: { ...current.home, products: current.home.products.filter((item) => item.id !== product.id) }, productDetails };
        });
        setNotice(`${product.name} removed from the draft. Select Save Changes to apply the deletion.`);
    };

    const updateStock = (productId, value) => {
        updateHomeProducts((items) => items.map((product) => {
            if (product.id !== productId) return product;
            if (value === "") {
                const next = { ...product };
                delete next.stockQty;
                delete next.stockUpdatedAt;
                return next;
            }
            const stockQty = Math.max(0, Number(value) || 0);
            return { ...product, stockQty, stockUpdatedAt: today(), available: stockQty === 0 ? false : true };
        }));
    };

    const makeEditorialTemplate = (kind) => {
        const fileKey = kind === "recipes" ? "recipe" : "blog";
        const current = kind === "recipes"
            ? [...(data.recipe?.recipes || []), ...(data.recipe?.localRecipes || [])]
            : data[fileKey]?.blogs || [];
        const sample = current[0] || {};
        const item = Object.fromEntries(Object.entries(sample).map(([key, value]) => {
            if (key === "date") return [key, today()];
            if (typeof value === "boolean") return [key, false];
            if (Array.isArray(value)) return [key, []];
            if (typeof value === "number") return [key, 0];
            if (value && typeof value === "object") return [key, {}];
            return [key, ""];
        }));
        item.slug = "";
        item.title = "";
        item.category = "";
        item.excerpt = "";
        item.image = "";
        item.imageAlt = "";
        item.imageTitle = "";
        item.status = "draft";
        if (kind === "recipes") {
            item.prepTime = ""; item.cookTime = ""; item.servings = ""; item.difficulty = "";
            item.ingredients = []; item.steps = []; item.tip = "";
        } else {
            item.date = today(); item.readTime = ""; item.sections = [];
        }
        return item;
    };

    const saveEditorialItem = (kind, item, originalSlug, originalCollection) => {
        const slug = slugify(item.slug || item.title);
        if (!item.title?.trim() || !item.excerpt?.trim() || !item.image?.trim() || !item.imageAlt?.trim() || !slug) {
            setNotice("Add a title, short description, image, image alt text, and a valid URL slug before saving this post.");
            return false;
        }
        const fileKey = kind === "recipes" ? "recipe" : "blog";
        const collectionsToCheck = kind === "recipes" ? ["recipes", "localRecipes"] : ["blogs"];
        const duplicateExists = collectionsToCheck.some((collection) => (data[fileKey]?.[collection] || []).some((post) =>
            post.slug === slug && !(collection === originalCollection && post.slug === originalSlug)
        ));
        if (duplicateExists) {
            setNotice(`The URL slug “${slug}” is already in use.`);
            return false;
        }
        const targetCollection = originalSlug ? originalCollection : kind === "recipes" ? "localRecipes" : "blogs";
        const savedItem = { ...item, slug, status: String(item.status || "draft").toLowerCase() === "published" ? "published" : "draft" };
        setData((current) => {
            const collectionItems = current[fileKey]?.[targetCollection] || [];
            const nextItems = originalSlug
                ? collectionItems.map((post) => post.slug === originalSlug ? savedItem : post)
                : [savedItem, ...collectionItems];
            return { ...current, [fileKey]: { ...current[fileKey], [targetCollection]: nextItems } };
        });
        setEditorialModal(null);
        setNotice(`${savedItem.title} is ${savedItem.status} in the draft. Select Save Changes to write ${fileKey}.json.`);
        return true;
    };

    const deleteEditorialItem = (kind, item, collection) => {
        if (!window.confirm(`Delete “${item.title}” from ${kind}?`)) return;
        updateEditorialList(kind, collection, (items) => items.filter((post) => post.slug !== item.slug));
        setNotice(`${item.title} removed from the draft. Select Save Changes to apply the deletion.`);
    };

    const currentTitle = PAGE_TITLES[section] || "Dashboard";
    const selectedFile = section === "products" ? "home" : section === "editorial" ? (editorialKind === "recipes" ? "recipe" : "blog") : section === "settings" ? "adminSettings" : null;
    const lowStockCount = lowStockProducts.length;
    const notificationCount = lowStockProducts.length + outOfStockProducts.length;
    const sectionLinks = (id) => id === "dashboard" ? "/admin" : `/admin/${id}`;

    if (loading) return <div className="admin-state-page"><div className="admin-state-card"><Leaf size={24} /><p>Loading Elaichi Ghar data…</p></div></div>;
    if (loadError || !data || !originals) return <div className="admin-state-page"><div className="admin-state-card" role="alert"><CircleAlert size={24} /><h1>Admin data could not be loaded</h1><p>{loadError}</p><Link className="admin-button admin-button--quiet" to="/">Return to the storefront</Link></div></div>;

    return (
        <div className={`admin-app ${desktopCollapsed ? "is-collapsed" : ""}`}>
            {mobileMenuOpen && <button className="admin-mobile-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
            <aside className={`admin-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
                <div className="admin-sidebar__header">
                    <Link className="admin-brand" to="/" aria-label="Elaichi Ghar storefront"><span className="admin-brand__mark"><Leaf size={21} /></span><span className="admin-brand__text"><strong>এলাচের ঘর</strong><small>ELAICHI GHAR</small></span></Link>
                    <button className="admin-icon-button admin-collapse-toggle admin-sidebar-collapse-toggle" type="button" aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setDesktopCollapsed((collapsed) => !collapsed)}>{desktopCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
                </div>
                <div className="admin-sidebar__label">STORE MANAGEMENT</div>
                <nav className="admin-navigation" aria-label="Admin sections">
                    {SIDE_GROUPS.map((group) => <div className="admin-navigation__group" key={group.label}><p>{group.label}</p>{group.items.map(({ id, label, icon: Icon }) => <Link key={id} to={sectionLinks(id)} onClick={() => setMobileMenuOpen(false)} title={desktopCollapsed ? label : undefined} className={section === id ? "active" : ""} aria-current={section === id ? "page" : undefined}><Icon size={17} /><span>{label}</span></Link>)}</div>)}
                </nav>
                <div className="admin-sidebar__bottom"><div className="admin-local-indicator"><span />Local editor · no login</div><Link to="/" className="admin-logout"><LogOut size={17} /><span>Logout</span></Link></div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar__left"><button className="admin-icon-button admin-menu-toggle" type="button" aria-label="Open navigation" onClick={() => setMobileMenuOpen((open) => !open)}><Menu size={19} /></button><div><span className="admin-topbar__crumb">ELAICHI GHAR · ADMIN</span><strong>{currentTitle}</strong><small>{PAGE_TITLES[section]}</small></div></div>
                    <div className="admin-topbar__actions">
                        <span className="admin-local-pill"><i />LOCAL EDITOR</span>
                        <div className="admin-popover-wrap"><button className="admin-icon-button admin-notification-button" type="button" aria-label={`${notificationCount} stock alerts`} onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }}><Bell size={18} />{notificationCount > 0 && <i>{notificationCount}</i>}</button>{notificationsOpen && <div className="admin-popover admin-notifications"><strong>Stock notifications</strong>{lowStockProducts.length ? lowStockProducts.map((product) => <Link to="/admin/inventory" key={product.id} onClick={() => setNotificationsOpen(false)}><span>{product.name}</span><small>{product.stockQty} remaining</small></Link>) : <p>No low-stock alerts for tracked products.</p>}{outOfStockProducts.length > 0 && <small>{outOfStockProducts.length} product{outOfStockProducts.length === 1 ? " is" : "s are"} out of stock.</small>}</div>}</div>
                        <div className="admin-popover-wrap"><button className="admin-profile-button" type="button" onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }}><span className="admin-profile-avatar"><UserRound size={16} /></span><span><b>Local admin</b><small>On this device</small></span><ChevronDown size={14} /></button>{profileOpen && <div className="admin-popover admin-profile-menu"><strong>Local editing session</strong><p>This dashboard has no account login. Changes are written to your selected project files.</p><Link to="/" onClick={() => setProfileOpen(false)}><LogOut size={15} />Exit to storefront</Link></div>}</div>
                    </div>
                </header>

                <main className="admin-content">
                    <div className="admin-page-heading"><div className="admin-page-actions"><Link className="admin-button admin-button--quiet" to="/" target="_blank"><ExternalLink size={15} /> View storefront</Link>{selectedFile && <button className="admin-button admin-button--quiet" type="button" onClick={() => downloadJson(selectedFile)}><FileText size={15} /> Download JSON</button>}{section !== "dashboard" && <button className="admin-button admin-button--primary" type="button" onClick={saveChanges} disabled={!isDirty || isSaving}>{isSaving ? <span className="admin-spinner" /> : <Save size={15} />}{isSaving ? "Saving…" : "Save changes"}</button>}</div></div>

                    <div className="admin-connection-bar"><span className={isDirty ? "admin-dot admin-dot--unsaved" : "admin-dot"} /><span>{isDirty ? "Unsaved changes" : "All JSON data matches the saved files"}</span><span className="admin-connection-bar__divider" /><span>{import.meta.env.DEV ? "Local JSON writer ready" : projectDirectory ? `Folder: ${projectDirectory.name}` : "Browser draft only"}</span>{!import.meta.env.DEV && <button type="button" onClick={connectFolder}>{projectDirectory ? "Change folder" : "Connect project folder"}</button>}<span className="admin-connection-bar__spacer" />{isDirty && <span className="admin-change-count">{changedFiles.length + deletedProductIds.length} file change{changedFiles.length + deletedProductIds.length === 1 ? "" : "s"}</span>}</div>
                    {notice && <div className="admin-toast" role="status"><Check size={16} />{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}><X size={15} /></button></div>}

                    {section === "dashboard" && <DashboardSection data={data} products={products} lowStockProducts={lowStockProducts} threshold={threshold} onNavigate={(id) => navigate(sectionLinks(id))} />}
                    {section === "products" && <ProductsSection products={products} details={data.productDetails} categories={productCategories} grades={productGrades} threshold={threshold} search={productSearch} setSearch={setProductSearch} category={productCategory} setCategory={setProductCategory} grade={productGrade} setGrade={setProductGrade} availability={productAvailability} setAvailability={setProductAvailability} onAdd={() => setProductModal({ product: null, detail: null })} onEdit={(product) => setProductModal({ product, detail: data.productDetails?.[product.id] })} onDelete={deleteProduct} />}
                    {section === "orders" && <EmptyManagementSection title="Orders" icon={ShoppingCart} description="Order records are not available in this project yet. The shopping bag is saved in each visitor’s browser and there is no checkout or order API." columns={["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status"]} />}
                    {section === "customers" && <EmptyManagementSection title="Customers" icon={Users} description="This project does not have registered customer accounts or a customer database. The bag is local to each visitor’s device." columns={["Name", "Email", "Registered", "Orders", "Total spent"]} />}
                    {section === "inventory" && <InventorySection products={products} details={data.productDetails} threshold={threshold} search={inventorySearch} setSearch={setInventorySearch} onStockChange={updateStock} />}
                    {section === "editorial" && <EditorialSection data={data} kind={editorialKind} setKind={setEditorialKind} search={editorialSearch} setSearch={setEditorialSearch} onAdd={() => setEditorialModal({ kind: editorialKind, item: makeEditorialTemplate(editorialKind), originalSlug: "" })} onEdit={(item, collection) => setEditorialModal({ kind: editorialKind, item: clone({ ...item, status: item.status || "published" }), originalSlug: item.slug, originalCollection: collection })} onPreview={(item) => setEditorialPreview({ kind: editorialKind, item })} onDelete={(item, collection) => deleteEditorialItem(editorialKind, item, collection)} />}
                    {section === "settings" && <SettingsSection settings={settings} setSettings={(next) => updateData("adminSettings", { ...data.adminSettings, lowStockThreshold: Math.max(0, Number(next.lowStockThreshold) || 0) })} isDirty={isSettingsDirty} onSave={saveChanges} />}
                    <footer className="admin-footer-note"><CircleAlert size={15} /><span>This admin route has no authentication. Do not publish confidential customer data or use it to store secrets. Orders and customer accounts need a backend data source.</span></footer>
                </main>
            </div>

            <datalist id="admin-image-assets">{imagePaths.map((path) => <option key={path} value={path} />)}</datalist>
            {productModal && <ProductEditor product={productModal.product} detail={productModal.detail} existingIds={products.map((product) => product.id)} onClose={() => setProductModal(null)} onSave={saveProductDraft} onUploadImage={uploadImage} isSaving={isSaving} />}
                    {editorialModal && <EditorialEditor modal={editorialModal} onClose={() => setEditorialModal(null)} onPreview={(item) => setEditorialPreview({ kind: editorialModal.kind, item })} onSave={(item) => saveEditorialItem(editorialModal.kind, item, editorialModal.originalSlug, editorialModal.originalCollection)} onUploadImage={uploadImage} />}
            {editorialPreview && <EditorialPreview kind={editorialPreview.kind} item={editorialPreview.item} onClose={() => setEditorialPreview(null)} />}
        </div>
    );
}

function DashboardSection({ data, products, lowStockProducts, threshold, onNavigate }) {
    const recipeCount = getEditorialAdminEntries(data, "recipes").length;
    const blogCount = getEditorialAdminEntries(data, "blogs").length;
    return (
        <>
            <section className="admin-stats-grid" aria-label="Store overview">
                <StatCard icon={Package} label="Total products" value={products.length} note="From the live shop JSON" />
                <StatCard icon={ShoppingCart} label="Total orders" value="—" note="No order records connected" tone="gold" />
                <StatCard icon={Users} label="Registered customers" value="—" note="No account database connected" tone="blue" />
                <StatCard icon={CircleHelp} label="Total revenue" value="—" note="Requires saved order data" tone="rose" />
                <StatCard icon={Clock3} label="Pending orders" value="—" note="No order status records" tone="blue" />
                <StatCard icon={Warehouse} label="Low-stock products" value={lowStockProducts.length} note={`${lowStockProducts.length} tracked at or below ${threshold} units`} tone={lowStockProducts.length ? "rose" : "green"} />
            </section>

            <section className="admin-dashboard-grid">
                <article className="admin-panel admin-panel--wide"><PanelHeading title="Recent orders" detail="Latest customer purchases" action="View orders" onAction={() => onNavigate("orders")} /><div className="admin-table-wrap"><table className="admin-table"><thead><tr>{["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead></table></div><EmptyState icon={ShoppingCart} title="No order data available"><span>There is no checkout or order API in this frontend. Orders and revenue will appear after an order service is connected.</span></EmptyState></article>
                <article className="admin-panel"><PanelHeading title="Content overview" detail="Records loaded from JSON" /><div className="admin-content-counts"><button type="button" onClick={() => onNavigate("editorial")}><BookOpenText size={17} /><span>Recipes</span><b>{recipeCount}</b></button><button type="button" onClick={() => onNavigate("editorial")}><FileText size={17} /><span>Blog stories</span><b>{blogCount}</b></button></div><div className="admin-quick-actions"><button type="button" onClick={() => onNavigate("products")}><Plus size={15} />Add a product</button><button type="button" onClick={() => onNavigate("editorial")}><Plus size={15} />Manage recipes and blogs</button></div></article>
            </section>

            <section className="admin-dashboard-grid admin-dashboard-grid--lower">
                <article className="admin-panel"><PanelHeading title="Sales overview" detail="Sales chart" /><div className="admin-chart-placeholder"><span className="admin-chart-line" /><EmptyState icon={CircleHelp} title="Sales data is not connected"><span>Revenue and order totals will be charted after a checkout system stores purchases.</span></EmptyState></div></article>
                <article className="admin-panel"><PanelHeading title="Best-selling products" detail="Based on completed orders" action="View products" onAction={() => onNavigate("products")} /><EmptyState icon={Package} title="No sales history yet"><span>Best sellers can be calculated when product quantities are attached to order records.</span></EmptyState></article>
                <article className="admin-panel"><PanelHeading title="Low-stock alerts" detail={`Alert threshold: ${threshold}`} action="Open inventory" onAction={() => onNavigate("inventory")} /><div className="admin-alert-list">{lowStockProducts.length ? lowStockProducts.slice(0, 4).map((product) => <div key={product.id}><span className="admin-alert-product"><img src={getImageUrl(product.image)} alt="" title={product.imageTitle || product.name} />{product.name}</span><b>{product.stockQty} left</b></div>) : <EmptyState icon={Boxes} title="No low-stock alerts"><span>Products with an empty stock field are marked untracked.</span></EmptyState>}</div></article>
                <article className="admin-panel"><PanelHeading title="Order status" detail="Current order distribution" /><EmptyState icon={ShoppingCart} title="No order statuses available"><span>Order statuses will appear here when the site stores customer purchases.</span></EmptyState></article>
            </section>
        </>
    );
}

function PanelHeading({ title, detail, action, onAction }) {
    return <header className="admin-panel-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action && <button type="button" onClick={onAction}>{action}<ArrowUpRight size={14} /></button>}</header>;
}

function ProductsSection({ products, details, categories, grades, threshold, search, setSearch, category, setCategory, grade, setGrade, availability, setAvailability, onAdd, onEdit, onDelete }) {
    const filtered = products.filter((product) => {
        const productGrade = details?.[product.id]?.grade || product.grade || "";
        const available = isProductAvailable(product);
        const text = `${product.name} ${product.id} ${product.sku || ""}`.toLocaleLowerCase();
        return (!search || text.includes(search.toLocaleLowerCase()))
            && (category === "all" || (product.category || "Cardamom") === category)
            && (grade === "all" || productGrade === grade)
            && (availability === "all" || (availability === "available" ? available : !available));
    });
    return (
        <section className="admin-panel admin-management-panel">
            <div className="admin-toolbar"><label className="admin-search-field"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={grade} onChange={(event) => setGrade(event.target.value)} aria-label="Filter by grade"><option value="all">All grades</option>{grades.map((item) => <option key={item}>{item}</option>)}</select><select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter by availability"><option value="all">Any availability</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select><button className="admin-button admin-button--primary" type="button" onClick={onAdd}><Plus size={16} />Add product</button></div>
            <p className="admin-data-source-note"><Package size={14} />Product records and stock quantities use <code>public/data/home.json</code>. Detail copy and grades use each product’s existing <code>public/data/products/&lt;id&gt;.json</code> file.</p>
            <div className="admin-table-wrap"><table className="admin-table admin-product-table"><thead><tr><th>Product</th><th>Category</th><th>Grade</th><th>Price</th><th>Stock</th><th>Availability</th><th>Actions</th></tr></thead><tbody>{filtered.map((product) => {
                const available = isProductAvailable(product);
                const stock = hasTrackedStock(product) ? Number(product.stockQty) : null;
        return <tr key={product.id}><td><span className="admin-product-cell"><img src={getImageUrl(product.image)} alt="" title={product.imageTitle || product.name} /><span><strong>{product.name}</strong><small>ID: {product.id}{product.sku ? ` · SKU ${product.sku}` : ""}</small></span></span></td><td>{product.category || "Cardamom"}</td><td>{details?.[product.id]?.grade || product.grade || "—"}</td><td>{currency(product.price)}</td><td>{stock == null ? <span className="admin-tag admin-tag--neutral">Not tracked</span> : stock === 0 ? <span className="admin-tag admin-tag--danger">Out of stock</span> : stock <= threshold ? <span className="admin-tag admin-tag--warning">{stock} left</span> : stock}</td><td><span className={`admin-tag ${available ? "admin-tag--success" : "admin-tag--neutral"}`}>{available ? "Available" : "Unavailable"}</span></td><td><span className="admin-row-actions"><button className="admin-icon-button" type="button" title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => onEdit(product)}><Pencil size={15} /></button><button className="admin-icon-button admin-icon-button--danger" type="button" title="Delete product" aria-label={`Delete ${product.name}`} onClick={() => onDelete(product)}><Trash2 size={15} /></button></span></td></tr>;
            })}</tbody></table>{filtered.length === 0 && <EmptyState icon={Search} title="No products match these filters"><span>Clear the search or choose another category, grade, or availability.</span></EmptyState>}</div>
        </section>
    );
}

function InventorySection({ products, details, threshold, search, setSearch, onStockChange }) {
    const filtered = products.filter((product) => `${product.name} ${product.id} ${product.sku || ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    return <section className="admin-panel admin-management-panel"><div className="admin-toolbar"><label className="admin-search-field"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory" aria-label="Search inventory" /></label><span className="admin-threshold-badge"><Boxes size={15} />Low-stock threshold: {threshold}</span></div><p className="admin-data-source-note"><Warehouse size={14} />Stock is stored with each product in <code>public/data/home.json</code>. Blank stock means untracked; quantities at or below {threshold} trigger an alert.</p><div className="admin-table-wrap"><table className="admin-table admin-inventory-table"><thead><tr><th>Product</th><th>SKU</th><th>Grade</th><th>Current stock</th><th>Status</th><th>Last updated</th></tr></thead><tbody>{filtered.map((product) => {
        const tracked = hasTrackedStock(product); const stock = tracked ? Number(product.stockQty) : null; const low = isLowStock(product, threshold); const out = isProductOutOfStock(product);
        return <tr key={product.id}><td><span className="admin-product-cell"><img src={getImageUrl(product.image)} alt="" title={product.imageTitle || product.name} /><span><strong>{product.name}</strong><small>{product.category || "Cardamom"}</small></span></span></td><td>{product.sku || "—"}</td><td>{details?.[product.id]?.grade || "—"}</td><td><label className="admin-stock-input"><input type="number" min="0" step="1" value={tracked ? stock : ""} placeholder="Not tracked" onChange={(event) => onStockChange(product.id, event.target.value)} aria-label={`Stock quantity for ${product.name}`} /><span>units</span></label></td><td><span className={`admin-tag ${out ? "admin-tag--danger" : low ? "admin-tag--warning" : tracked ? "admin-tag--success" : "admin-tag--neutral"}`}>{out ? "Out of stock" : low ? "Low stock" : tracked ? "In stock" : "Not tracked"}</span></td><td>{product.stockUpdatedAt || "—"}</td></tr>;
    })}</tbody></table>{filtered.length === 0 && <EmptyState icon={Search} title="No products found"><span>Try another name or product ID.</span></EmptyState>}</div><p className="admin-inventory-save-hint">Stock edits are drafts until you select <strong>Save changes</strong> at the top of the page.</p></section>;
}

function EditorialSection({ data, kind, setKind, search, setSearch, onAdd, onEdit, onPreview, onDelete }) {
    const title = kind === "recipes" ? "Recipes" : "Blog stories";
    const fileKey = kind === "recipes" ? "recipe" : "blog";
    const allEntries = getEditorialAdminEntries(data, kind);
    const entries = allEntries.filter(({ item }) => `${item.title || ""} ${item.category || ""} ${item.slug || ""}`.toLowerCase().includes(search.toLowerCase()));
    const recipeCount = getEditorialAdminEntries(data, "recipes").length;
    const blogCount = getEditorialAdminEntries(data, "blogs").length;
    const currentCount = kind === "recipes" ? recipeCount : blogCount;
    const sourceNote = kind === "recipes"
        ? `The file contains ${data.recipe?.recipes?.length || 0} archive recipes and ${data.recipe?.localRecipes?.length || 0} local additions.`
        : `Showing ${currentCount} records from public/data/${fileKey}.json.`;
    return <section className="admin-panel admin-management-panel"><div className="admin-editorial-tabs"><div><button className={kind === "recipes" ? "is-active" : ""} type="button" onClick={() => { setKind("recipes"); setSearch(""); }}>Recipes <b>{recipeCount}</b></button><button className={kind === "blogs" ? "is-active" : ""} type="button" onClick={() => { setKind("blogs"); setSearch(""); }}>Blogs <b>{blogCount}</b></button></div><button type="button" className="admin-button admin-button--primary" onClick={onAdd}><Plus size={16} />Add {kind === "recipes" ? "recipe" : "blog story"}</button></div><div className="admin-toolbar"><label className="admin-search-field"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} aria-label={`Search ${title}`} /></label><p className="admin-data-source-note"><BookOpenText size={14} />{sourceNote} Draft posts stay hidden on the public site.</p></div><div className="admin-table-wrap"><table className="admin-table admin-editorial-table"><thead><tr><th>Post</th><th>Category</th><th>URL slug</th><th>Status</th><th>Actions</th></tr></thead><tbody>{entries.map(({ item, collection }) => <tr key={`${collection}-${item.slug || item.title}`}><td><span className="admin-product-cell"><img src={getImageUrl(item.image)} alt="" title={item.imageTitle || item.title || "Editorial image"} /><span><strong>{item.title || "Untitled"}</strong><small>{item.excerpt || "No description"}</small></span></span></td><td>{item.category || "—"}</td><td><code>/{kind}/{item.slug || "add-slug"}</code></td><td><span className={`admin-tag ${String(item.status || "published").toLowerCase() === "draft" ? "admin-tag--warning" : "admin-tag--success"}`}>{String(item.status || "published").toLowerCase() === "draft" ? "Draft" : "Published"}</span></td><td><span className="admin-row-actions"><button className="admin-icon-button" type="button" aria-label={`Preview ${item.title}`} onClick={() => onPreview(item)}><Eye size={15} /></button><button className="admin-icon-button" type="button" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item, collection)}><Pencil size={15} /></button><button className="admin-icon-button admin-icon-button--danger" type="button" aria-label={`Delete ${item.title}`} onClick={() => onDelete(item, collection)}><Trash2 size={15} /></button></span></td></tr>)}</tbody></table>{entries.length === 0 && <EmptyState icon={BookOpenText} title={`No ${title.toLowerCase()} found`}><span>{search ? "Try a different search." : `Add your first ${kind === "recipes" ? "recipe" : "blog story"} to begin.`}</span></EmptyState>}</div></section>;
}

function BlogSectionsEditor({ sections, onChange }) {
    const articleSections = Array.isArray(sections) ? sections : [];
    const updateSection = (index, updates) => onChange(articleSections.map((section, sectionIndex) => {
        if (sectionIndex !== index) return section;
        const normalized = section && typeof section === "object" ? section : { heading: "", paragraphs: [String(section || "")] };
        return { ...normalized, ...updates };
    }));
    const updateParagraph = (sectionIndex, paragraphIndex, value) => {
        const section = articleSections[sectionIndex];
        const paragraphs = Array.isArray(section?.paragraphs) ? section.paragraphs : [];
        updateSection(sectionIndex, { paragraphs: paragraphs.map((paragraph, index) => index === paragraphIndex ? value : paragraph) });
    };

    return (
        <section className="admin-blog-content-editor" aria-labelledby="blog-content-heading">
            <header className="admin-blog-content-editor__header">
                <div>
                    <h3 id="blog-content-heading">Article content</h3>
                    <p>Add headings and paragraphs; they appear in this order on the public blog page.</p>
                </div>
                <button className="admin-add-button" type="button" onClick={() => onChange([...articleSections, { heading: "", paragraphs: [""] }])}>
                    + Add section
                </button>
            </header>
            {articleSections.length === 0 ? (
                <p className="admin-blog-content-editor__empty">This post has no body sections yet. Add a section to start writing the article.</p>
            ) : articleSections.map((section, sectionIndex) => {
                const normalized = section && typeof section === "object" ? section : { heading: "", paragraphs: [String(section || "")] };
                const paragraphs = Array.isArray(normalized.paragraphs) ? normalized.paragraphs : [];
                return (
                    <article className="admin-blog-section-editor" key={`section-${sectionIndex}`}>
                        <div className="admin-blog-section-editor__top">
                            <strong>Section {String(sectionIndex + 1).padStart(2, "0")}</strong>
                            <button className="admin-remove-button" type="button" onClick={() => onChange(articleSections.filter((_, index) => index !== sectionIndex))}>Remove section</button>
                        </div>
                        <label className="admin-form-field">
                            <span>Section heading</span>
                            <input type="text" value={normalized.heading || ""} onChange={(event) => updateSection(sectionIndex, { heading: event.target.value })} placeholder="A useful heading" />
                        </label>
                        {paragraphs.map((paragraph, paragraphIndex) => (
                            <div className="admin-blog-paragraph-editor" key={`paragraph-${paragraphIndex}`}>
                                <label className="admin-form-field">
                                    <span>Paragraph {paragraphIndex + 1}</span>
                                    <textarea rows={4} value={paragraph} onChange={(event) => updateParagraph(sectionIndex, paragraphIndex, event.target.value)} placeholder="Write this part of the article…" />
                                </label>
                                <button className="admin-remove-button" type="button" onClick={() => updateSection(sectionIndex, { paragraphs: paragraphs.filter((_, index) => index !== paragraphIndex) })}>Remove paragraph</button>
                            </div>
                        ))}
                        <button className="admin-add-button" type="button" onClick={() => updateSection(sectionIndex, { paragraphs: [...paragraphs, ""] })}>+ Add paragraph</button>
                    </article>
                );
            })}
        </section>
    );
}

function EditorialEditor({ modal, onClose, onPreview, onSave, onUploadImage }) {
    const [item, setItem] = useState(modal.item);
    const [error, setError] = useState("");
    const updateItem = (next) => { setItem(next); setError(""); };
    const isBlog = modal.kind === "blogs";
    const editableFields = Object.fromEntries(Object.entries(item).filter(([key]) => key !== "status" && (!isBlog || key !== "sections")));
    const status = item.status || "draft";
    return <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="editorial-editor-title"><header className="admin-modal__header"><div><p className="admin-eyebrow">{modal.kind === "recipes" ? "RECIPE EDITOR" : "BLOG EDITOR"}</p><h2 id="editorial-editor-title">{modal.originalSlug ? "Edit post" : "Create a post"}</h2></div><button className="admin-icon-button" type="button" aria-label="Close" onClick={onClose}><X size={19} /></button></header><p className="admin-data-source-note">Required: title, short description, image, image alt text, and URL slug. Preview before saving. Draft posts stay off the customer-facing page.</p><label className="admin-form-field"><span>Publication status</span><select value={status} onChange={(event) => updateItem({ ...item, status: event.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label>{error && <p className="admin-inline-error"><CircleAlert size={15} />{error}</p>}<div className="admin-editor-fields admin-editor-fields--modal"><AdminJsonEditor value={editableFields} onChange={(next) => setItem((current) => ({ ...next, ...(isBlog ? { sections: current.sections || [] } : {}), status: current.status || "draft" }))} onUploadImage={onUploadImage} />{isBlog && <BlogSectionsEditor sections={item.sections} onChange={(sections) => updateItem({ ...item, sections })} />}</div><footer className="admin-modal__footer"><button className="admin-button admin-button--quiet" type="button" onClick={() => onPreview(item)}><Eye size={15} />Preview</button><span /><button className="admin-button admin-button--quiet" type="button" onClick={onClose}>Cancel</button><button className="admin-button admin-button--primary" type="button" onClick={() => { const saved = onSave(item); if (saved) setError(""); else setError("Please check the required fields, including image alt text, and URL slug. A duplicate slug may also be in use."); }}><Check size={15} />Save post draft</button></footer></section></div>;
}

function EmptyManagementSection({ title, icon: Icon, description, columns }) {
    return (
        <section className="admin-panel admin-management-panel">
            {title === "Orders" ? (
                <div className="admin-toolbar">
                    <label className="admin-search-field"><Search size={17} /><input type="search" disabled placeholder="Search by order ID or customer" aria-label="Search orders" /></label>
                    <select disabled aria-label="Filter by order status"><option>All order statuses</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select>
                    <select disabled aria-label="Filter by payment status"><option>All payment statuses</option><option>Pending</option><option>Paid</option><option>Failed</option><option>Refunded</option></select>
                </div>
            ) : (
                <div className="admin-toolbar"><label className="admin-search-field"><Search size={17} /><input type="search" disabled placeholder="Search by customer name or email" aria-label="Search customers" /></label></div>
            )}
            <p className="admin-data-source-note"><CircleAlert size={15} />This project currently has no backend data source for {title.toLowerCase()}.</p>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead></table><EmptyState icon={Icon} title={`No ${title.toLowerCase()} records`}><span>{description}</span></EmptyState></div>
            <div className="admin-backend-note"><strong>To enable this section</strong><p>Add a protected server-side API and persistent storage for {title.toLowerCase()}. The current static JSON and browser-local bag cannot safely store shared order or customer records. Order detail, payment status, delivery status, customer history, and revenue will populate from that service.</p></div>
        </section>
    );
}

function SettingsSection({ settings, setSettings, isDirty, onSave }) {
    return <section className="admin-settings-grid"><article className="admin-panel admin-settings-card"><PanelHeading title="Inventory alerts" detail="Saved in public/data/admin-settings.json" /><label className="admin-form-field"><span>Low-stock threshold</span><input type="number" min="0" step="1" value={settings.lowStockThreshold} onChange={(event) => setSettings({ ...settings, lowStockThreshold: event.target.value })} /><small>Products with a tracked quantity above zero and at or below this value appear in alerts.</small></label><p className="admin-settings-copy">{isDirty ? "Unsaved setting. Save changes to write admin-settings.json." : "This threshold is read from and saved to the project JSON file."}</p><button className="admin-button admin-button--primary" type="button" onClick={onSave} disabled={!isDirty}><Save size={15} />Save changes</button></article><article className="admin-panel admin-settings-card"><PanelHeading title="Access and data" detail="Current frontend limits" /><div className="admin-settings-callout"><CircleAlert size={18} /><p>This admin page has no login. Orders and customer information are not stored by the site. The admin must not contain secrets or private customer data.</p></div><p className="admin-settings-copy">Local JSON edits save to your project while Vite is running. A static deployment cannot update the source files on its own.</p></article></section>;
}

export default AdminPage;
