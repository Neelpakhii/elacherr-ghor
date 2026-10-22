import { useState } from "react";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "../config.js";

const prettyLabel = (value = "") => String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());

const createEmptyLike = (value) => {
    if (Array.isArray(value)) return [];
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, createEmptyLike(child)]));
    }
    if (typeof value === "number") return 0;
    if (typeof value === "boolean") return false;
    return "";
};

const objectArrayKeys = /^(products|recipes|blogs|sections|commitments|cards|grades|qualities|sideRecipes|policies|quickLinks|socialLinks|hero)$/i;

const updateAtPath = (value, path, nextValue) => {
    if (!path.length) return nextValue;
    const [key, ...remaining] = path;
    const copy = Array.isArray(value) ? [...value] : { ...value };
    copy[key] = updateAtPath(copy[key], remaining, nextValue);
    return copy;
};

const describeItem = (item, index) => {
    if (item && typeof item === "object") {
        const title = item.title || item.name || item.heading || item.label || item.slug || item.id;
        if (title) return title;
    }
    return `Item ${index + 1}`;
};

function PrimitiveField({ label, value, onChange, onUploadImage }) {
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const isImage = /image|logo|poster/i.test(label) && !/alt|credit|url/i.test(label);
    const isLongText = typeof value === "string" && (value.length > 115 || /description|paragraph|excerpt|provenance|text|quote|address|tip|steps|content/i.test(label));
    const isDate = /date/i.test(label) && /^\d{4}-\d{2}-\d{2}$/.test(value);
    const textValue = value == null ? "" : String(value);

    if (typeof value === "boolean") {
        return (
            <label className="admin-toggle-field">
                <span><strong>{prettyLabel(label)}</strong><small>{value ? "Enabled" : "Disabled"}</small></span>
                <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
            </label>
        );
    }

    if (typeof value === "number") {
        return (
            <label className="admin-field">
                <span>{prettyLabel(label)}</span>
                <input type="number" value={value} step="any" onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} />
            </label>
        );
    }

    return (
        <label className={`admin-field ${isLongText ? "admin-field--wide" : ""}`}>
            <span>{prettyLabel(label)}</span>
            {isLongText ? (
                <textarea rows={Math.min(7, Math.max(3, Math.ceil(textValue.length / 90)))} value={textValue} onChange={(event) => onChange(event.target.value)} />
            ) : (
                <input type={isDate ? "date" : "text"} list={isImage ? "admin-image-assets" : undefined} value={textValue} onChange={(event) => onChange(event.target.value)} />
            )}
            {isImage && (
                <>
                    <span className="admin-image-preview">
                        {textValue && <img src={getImageUrl(textValue)} alt="" title={`${prettyLabel(label)} image preview`} onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                        <ImageIcon size={15} aria-hidden="true" />
                        <small>Choose a listed asset or enter a path or image URL</small>
                    </span>
                    {onUploadImage && <span className="admin-image-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" disabled={uploadingImage} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploadingImage(true); setUploadError(""); try { onChange(await onUploadImage(file)); } catch (error) { setUploadError(error.message || "The image could not be uploaded."); } finally { setUploadingImage(false); event.target.value = ""; } }} /><small>{uploadingImage ? "Uploading image…" : "Upload image into public/images/admin-uploads/"}</small>{uploadError && <small role="alert">{uploadError}</small>}</span>}
                </>
            )}
        </label>
    );
}

function JsonNode({ label, value, path, onChange, onUploadImage, root = false }) {
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState("text");

    if (Array.isArray(value)) {
        return (
            <details className="admin-node admin-node--array">
                <summary><span>{prettyLabel(label)}</span><span className="admin-count">{value.length} {value.length === 1 ? "item" : "items"}<ChevronDown size={15} aria-hidden="true" /></span></summary>
                <div className="admin-node__body admin-array-list">
                    {value.map((item, index) => {
                        const updateItem = (nextItem) => onChange(updateAtPath(value, [index], nextItem));
                        const removeItem = () => onChange(value.filter((_, itemIndex) => itemIndex !== index));
                        if (item && typeof item === "object" && !Array.isArray(item)) {
                            return (
                                <details className="admin-array-entry" key={`${label}-${index}`}>
                                    <summary><span>{describeItem(item, index)}</span><span className="admin-entry-index">{String(index + 1).padStart(2, "0")}</span></summary>
                                    <div className="admin-array-entry__body">
                                        <JsonNode label="Fields" value={item} path={[...path, index]} onChange={updateItem} onUploadImage={onUploadImage} root />
                                        <button className="admin-remove-button" type="button" onClick={removeItem}>Remove this item</button>
                                    </div>
                                </details>
                            );
                        }
                        return (
                            <div className="admin-array-primitive" key={`${label}-${index}`}>
                                <PrimitiveField label={`${prettyLabel(label)} ${index + 1}`} value={item} onChange={(nextItem) => onChange(updateAtPath(value, [index], nextItem))} onUploadImage={onUploadImage} />
                                <button className="admin-remove-button" type="button" onClick={removeItem}>Remove</button>
                            </div>
                        );
                    })}
                    <button className="admin-add-button" type="button" onClick={() => onChange([...value, value.length ? createEmptyLike(value[0]) : objectArrayKeys.test(label) ? {} : ""])}>
                        + Add {prettyLabel(label).replace(/s$/, "").toLowerCase() || "item"}
                    </button>
                </div>
            </details>
        );
    }

    if (value && typeof value === "object") {
        const content = (
            <div className={root ? "admin-root-fields" : "admin-node__body admin-object-fields"}>
                {Object.entries(value).map(([key, child]) => (
                    <JsonNode key={`${path.join(".")}.${key}`} label={key} value={child} path={[...path, key]} onUploadImage={onUploadImage} onChange={(nextChild) => onChange(updateAtPath(value, [key], nextChild))} />
                ))}
                <form className="admin-add-field" onSubmit={(event) => {
                    event.preventDefault();
                    const key = newFieldName.trim();
                    if (!key || Object.hasOwn(value, key)) return;
                    const initialValue = { text: "", list: [], group: {}, number: 0, toggle: false }[newFieldType];
                    onChange({ ...value, [key]: initialValue });
                    setNewFieldName("");
                }}>
                    <input value={newFieldName} onChange={(event) => setNewFieldName(event.target.value)} placeholder="Add a field" aria-label={`Add field to ${prettyLabel(label)}`} />
                    <select value={newFieldType} onChange={(event) => setNewFieldType(event.target.value)} aria-label="New field type">
                        <option value="text">Text</option><option value="list">List</option><option value="group">Group</option><option value="number">Number</option><option value="toggle">Toggle</option>
                    </select>
                    <button className="admin-add-button" type="submit" disabled={!newFieldName.trim()}>Add field</button>
                </form>
            </div>
        );
        if (root) return content;
        return <details className="admin-node admin-node--object"><summary><span>{prettyLabel(label)}</span><span className="admin-count">{Object.keys(value).length} fields<ChevronDown size={15} aria-hidden="true" /></span></summary>{content}</details>;
    }

    return <PrimitiveField label={label} value={value} onChange={onChange} onUploadImage={onUploadImage} />;
}

export default function AdminJsonEditor({ value, onChange, onUploadImage }) {
    return <JsonNode label="Content" value={value} path={[]} onChange={onChange} onUploadImage={onUploadImage} root />;
}
