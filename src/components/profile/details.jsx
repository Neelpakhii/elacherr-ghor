import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, MapPin, ShoppingBag, Leaf, ArrowRight, Mail, PackageCheck, Bell, ShieldCheck } from "lucide-react";
import { getAppPath, PROFILE_DATA_URL } from "../../config.js";
import useBag from "../../hooks/useBag.js";
import "./details.css";

const PROFILE_KEY = "elacher-ghor-profile-json-v1";
const fields = [ ["name", "Full name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"], ["address", "Street address", "text"], ["city", "City", "text"], ["state", "State", "text"], ["postcode", "Postal code", "text"], ["country", "Country", "text"] ];

export default function Details() {
    const [profile, setProfile] = useState(null);
    const [draft, setDraft] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [notice, setNotice] = useState("");
    const [addingAddress, setAddingAddress] = useState(false);
    const [addressDraft, setAddressDraft] = useState({ name: "", phone: "", address: "", city: "", state: "", postcode: "", country: "India" });
    const emailUpdates = profile?.emailUpdates ?? false;
    const savedAddress = true;
    const { itemCount } = useBag();
    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await fetch(PROFILE_DATA_URL, { signal: controller.signal, cache: "no-store" });
                if (!response.ok) throw new Error("Could not load your profile.");
                let data = await response.json();
                if (!data || fields.some(([key]) => typeof data[key] !== "string")) throw new Error("Profile data is incomplete.");
                if (!import.meta.env.DEV) {
                    try {
                        const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
                        if (saved && fields.every(([key]) => typeof saved[key] === "string")) data = { ...data, ...saved };
                    } catch { /* Use the JSON defaults when storage is unavailable. */ }
                }
                if (!controller.signal.aborted) { setProfile(data); setDraft(data); }
            } catch (error) { if (!controller.signal.aborted) setLoadError(error.message); }
        };
        load();
        return () => controller.abort();
    }, []);

    const persistProfile = async (next) => {
        setSaving(true);
        setNotice("");
        try {
            if (import.meta.env.DEV) {
                const response = await fetch(`${import.meta.env.BASE_URL}__local-admin/save-json`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "data/profile.json", content: next }) });
                if (!response.ok) throw new Error("Could not save profile.json. Restart the local Vite server and try again.");
            } else {
                localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
            }
            setProfile(next);
            setNotice(import.meta.env.DEV ? "Changes saved to profile.json." : "Changes saved on this device.");
            return true;
        } catch (error) { setNotice(error.message || "Could not save your changes."); return false; }
        finally { setSaving(false); }
    };
    const setEmailUpdates = (value) => { if (!saving) persistProfile({ ...profile, emailUpdates: value }); };
    if (loadError) return <p role="alert">{loadError}</p>;
    if (!profile) return <p role="status">Loading profile…</p>;
    const initials = profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
    const save = async (event) => {
        event.preventDefault();
        if (!draft.name.trim()) return;
        if (await persistProfile({ ...profile, ...draft, additionalAddresses: profile.additionalAddresses || [], name: draft.name.trim() })) setEditing(false);
    };
    const additionalAddresses = Array.isArray(profile.additionalAddresses) ? profile.additionalAddresses : [];
    const addressCount = (savedAddress ? 1 : 0) + additionalAddresses.length;
    const removeAddress = (id) => {
        if (saving || addressCount <= 1 || id === null) return;
        persistProfile({ ...profile, savedAddress: true, additionalAddresses: additionalAddresses.filter((entry) => entry.id !== id) });
    };
    const addAddress = async (event) => {
        event.preventDefault();
        const nextAddress = Object.fromEntries(Object.entries(addressDraft).map(([key, value]) => [key, value.trim()]));
        if (await persistProfile({ ...profile, additionalAddresses: [...additionalAddresses, { ...nextAddress, id: crypto.randomUUID() }] })) {
            setAddingAddress(false);
            setAddressDraft({ name: "", phone: "", address: "", city: "", state: "", postcode: "", country: profile.country });
        }
    };
    return (
        <div className="profile-details">
            <aside className="profile-details__sidebar">
                <div className="profile-details__identity">
                    <div className="profile-details__avatar" aria-hidden="true">{initials}</div>
                    <span className="profile-details__badge">SAMPLE PROFILE</span>
                    <h2>{profile.name}</h2>
                    <p>{profile.email}</p>
                    <div className="profile-details__welcome"><Leaf size={18} /><span>A little more aroma in your everyday.</span></div>
                </div>
                <Link className="profile-details__bag" to={getAppPath("/bag")}><ShoppingBag size={22} /><span><strong>My shopping bag</strong><small>{itemCount} {itemCount === 1 ? "item" : "items"} in your bag</small></span><ArrowRight size={18} /></Link>
            </aside>
            <div className="profile-details__main">
                <p className="profile-details__demo">Sample account details are saved only in this browser. Orders appear here after an order system is connected.</p>
                <section className="profile-details__card profile-details__orders">
                    <div className="profile-details__title"><h2><PackageCheck size={20} /> My orders</h2><span className="profile-details__badge">ORDER HISTORY</span></div>
                    <div className="profile-details__empty-order"><PackageCheck size={28} /><div><strong>No orders yet</strong><p>Once you place an order, its items and status will appear here.</p></div><Link to={getAppPath("/shop")}>Start shopping <ArrowRight size={15} /></Link></div>
                </section>
                <section className="profile-details__card">
                    <div className="profile-details__title"><h2><UserRound size={20} /> Personal details</h2>{!editing && <button type="button" onClick={() => { setDraft(profile); setEditing(true); setNotice(""); }}>Edit details</button>}</div>
                    {editing ? (
                        <form onSubmit={save}>
                            <div className="profile-details__fields">{fields.map(([key, label, type]) => <label key={key}>{label}<input type={type} value={draft[key]} required={key !== "phone"} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}</div>
                            <div className="profile-details__actions"><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><button type="button" disabled={saving} onClick={() => setEditing(false)}>Cancel</button></div>
                        </form>
                    ) : (
                        <dl className="profile-details__fields"><div><dt>Full name</dt><dd>{profile.name}</dd></div><div><dt>Email address</dt><dd>{profile.email}</dd></div><div><dt>Phone number</dt><dd>{profile.phone || "Not added"}</dd></div><div><dt>Country</dt><dd>{profile.country}</dd></div></dl>
                    )}
                    <p className="profile-details__notice" role="status">{notice}</p>
                </section>
                <section className="profile-details__card">
                    <div className="profile-details__title"><h2><MapPin size={20} /> Saved addresses</h2><button type="button" disabled={saving} onClick={() => setAddingAddress(true)}>Add address</button></div>
                    {savedAddress && <div className="profile-details__address"><span className="profile-details__badge">PRIMARY ADDRESS</span><address><strong>{profile.name}</strong><br />{profile.address}<br />{profile.city}, {profile.state} {profile.postcode}<br />{profile.country}<br />{profile.phone}</address></div>}
                    {additionalAddresses.map((entry) => <div className="profile-details__address" key={entry.id}><address><strong>{entry.name}</strong><br />{entry.address}<br />{entry.city}, {entry.state} {entry.postcode}<br />{entry.country}<br />{entry.phone}</address>{addressCount > 1 && <button type="button" disabled={saving} onClick={() => removeAddress(entry.id)}>Remove address</button>}</div>)}
                    {addressCount === 0 && <p className="profile-details__demo">No saved addresses yet.</p>}
                    {addingAddress && <form onSubmit={addAddress} className="profile-details__address-form"><h3>Add a delivery address</h3><div className="profile-details__fields">{fields.filter(([key]) => key !== "email").map(([key, label, type]) => <label key={key}>{label}<input type={type} value={addressDraft[key]} required={key !== "phone"} onChange={(event) => setAddressDraft({ ...addressDraft, [key]: event.target.value })} /></label>)}</div><div className="profile-details__actions"><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save address"}</button><button type="button" disabled={saving} onClick={() => setAddingAddress(false)}>Cancel</button></div></form>}
                </section>
                <section className="profile-details__card profile-details__preferences"><div className="profile-details__title"><h2><ShieldCheck size={20} /> Account preferences</h2></div><label className="profile-details__toggle"><span><Bell size={18} /><span><strong>Email updates</strong><small>Receive occasional news and product updates.</small></span></span><input type="checkbox" checked={emailUpdates} onChange={(event) => { setEmailUpdates(event.target.checked); try { localStorage.setItem("elacher-ghor-profile-email-updates", String(event.target.checked)); } catch { /* Optional preference. */ } }} /></label><p className="profile-details__demo">Account sign-in, password changes, payments, and order tracking need a secure account and checkout service.</p></section>
                <div className="profile-details__explore"><section className="profile-details__card"><Leaf size={24} /><h2>Find your favourite grade</h2><p>Bring home the fragrance of Alleppey green cardamom.</p><Link to={getAppPath("/shop")}>Explore the shop <ArrowRight size={16} /></Link></section><section className="profile-details__card"><Mail size={24} /><h2>A little help?</h2><p>Find answers about our cardamom, packaging, and delivery.</p><Link to={getAppPath("/pages/faqs")}>Visit our FAQs <ArrowRight size={16} /></Link></section></div>
            </div>
        </div>
    );
}
