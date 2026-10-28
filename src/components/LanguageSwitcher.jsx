import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import "./LanguageSwitcher.css";

const GT_SCRIPT_ID = "elacher-ghtranslate-dropdown";

const LanguageSwitcher = () => {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const supportedLanguages = new Set(["en", "bn", "gu", "hi", "kn", "ml", "mr", "ne", "pa", "sd", "ta", "te", "ur"]);
        const rememberLanguage = (event) => {
            if (!event.target?.closest?.(".gtranslate_wrapper select")) return;
            const rawValue = String(event.target.value || "");
            const selected = rawValue.split("|").pop().trim().toLowerCase();
            const language = supportedLanguages.has(selected) ? selected : "en";
            try {
                window.localStorage.setItem("elacher-ghor-language", language);
            } catch {
                // Keep the selected locale for the current page.
            }
            window.dispatchEvent(new CustomEvent("elacher:language-change", { detail: { language } }));
        };
        document.addEventListener("change", rememberLanguage, true);

        window.gtranslateSettings = {
            default_language: "en",
            // GTranslate's currently published language list includes these
            // Indian languages; keep English as the source/default language.
            languages: ["en", "bn", "gu", "hi", "kn", "ml", "mr", "ne", "pa", "sd", "ta", "te", "ur"],
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
        return () => document.removeEventListener("change", rememberLanguage, true);
    }, []);

    return (
        <div className="language-switcher" title="Translate this website">
            <Languages size={17} aria-hidden="true" />
            <div className="gtranslate_wrapper" aria-label="Choose website language" />
            {failed && <span className="language-switcher__status" role="status">Language options could not load</span>}
        </div>
    );
};

export default LanguageSwitcher;
