import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import "./LanguageSwitcher.css";

const GT_SCRIPT_ID = "elacher-ghtranslate-dropdown";
const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "bn", label: "বাংলা" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "hi", label: "हिन्दी" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "ml", label: "മലയാളം" },
    { code: "mr", label: "मराठी" },
    { code: "ne", label: "नेपाली" },
    { code: "pa", label: "ਪੰਜਾਬੀ" },
    { code: "sd", label: "سنڌي" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "ur", label: "اردو" },
];

const LanguageSwitcher = () => {
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);
    const [language, setLanguage] = useState(() => {
        try {
            const saved = window.localStorage.getItem("elacher-ghor-language");
            return LANGUAGES.some(({ code }) => code === saved) ? saved : "en";
        } catch {
            return "en";
        }
    });
    const wrapperRef = useRef(null);
    const nativeSelectRef = useRef(null);
    const rootRef = useRef(null);
    const activeLanguage = LANGUAGES.find(({ code }) => code === language) || LANGUAGES[0];

    useEffect(() => {
        const rememberLanguage = (event) => {
            if (!event.target?.closest?.(".gtranslate_wrapper select")) return;
            const rawValue = String(event.target.value || "");
            const selected = rawValue.split("|").pop().trim().toLowerCase();
            const nextLanguage = LANGUAGES.some(({ code }) => code === selected) ? selected : "en";
            setLanguage(nextLanguage);
            try {
                window.localStorage.setItem("elacher-ghor-language", nextLanguage);
            } catch {
                // Keep the selected locale for the current page.
            }
            window.dispatchEvent(new CustomEvent("elacher:language-change", { detail: { language: nextLanguage } }));
        };
        document.addEventListener("change", rememberLanguage, true);

        window.gtranslateSettings = {
            default_language: "en",
            // GTranslate's currently published language list includes these
            // Indian languages; keep English as the source/default language.
            languages: LANGUAGES.map(({ code }) => code),
            native_language_names: true,
            wrapper_selector: ".gtranslate_wrapper",
        };

        let script = document.getElementById(GT_SCRIPT_ID);
        if (!script) {
            script = document.createElement("script");
            script.id = GT_SCRIPT_ID;
            script.src = "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
            script.async = true;
            script.onerror = () => setFailed(true);
            document.body.appendChild(script);
        }
        const wrapper = wrapperRef.current;
        const syncNativeSelect = () => {
            const select = wrapper?.querySelector("select");
            if (select) {
                nativeSelectRef.current = select;
                setFailed(false);
            }
        };
        syncNativeSelect();
        const observer = wrapper ? new MutationObserver(syncNativeSelect) : null;
        observer?.observe(wrapper, { childList: true, subtree: true });

        return () => {
            document.removeEventListener("change", rememberLanguage, true);
            observer?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const closeOnOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    const chooseLanguage = (code) => {
        const select = nativeSelectRef.current;
        const option = Array.from(select?.options || []).find((item) => item.value.split("|").pop().toLowerCase() === code);
        if (!select || !option) {
            setFailed(true);
            return;
        }
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        setLanguage(code);
        setOpen(false);
    };

    return (
        <div className="language-switcher" ref={rootRef}>
            <button
                className="language-switcher__trigger"
                type="button"
                aria-label={`Website language: ${activeLanguage.label}`}
                aria-expanded={open}
                aria-haspopup="listbox"
                title="Translate this website"
                onClick={() => setOpen((current) => !current)}
            >
                <Languages size={17} aria-hidden="true" />
                <ChevronDown size={13} aria-hidden="true" />
            </button>
            {open && (
                <div className="language-switcher__menu" role="listbox" aria-label="Choose website language">
                    {LANGUAGES.map(({ code, label }) => (
                        <button
                            key={code}
                            className={`language-switcher__option${language === code ? " is-selected" : ""}`}
                            type="button"
                            role="option"
                            aria-selected={language === code}
                            onClick={() => chooseLanguage(code)}
                        >
                            <span lang={code}>{label}</span>
                            {language === code && <Check size={15} aria-hidden="true" />}
                        </button>
                    ))}
                </div>
            )}
            <div className="gtranslate_wrapper" ref={wrapperRef} aria-hidden="true" />
            {failed && <span className="language-switcher__status" role="status">Language options could not load</span>}
        </div>
    );
};

export default LanguageSwitcher;
