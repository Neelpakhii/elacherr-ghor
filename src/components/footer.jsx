import { useEffect, useState } from "react";
import { HOME_DATA_URL, getAppHref, getImageUrl } from "../config";
import "./footer.css";

const CURRENT_YEAR = new Date().getFullYear();

const SocialIcon = ({ name }) => {
    switch (name.toLowerCase()) {
        case "twitter":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.94 4.94 0 0 0 2.16-2.72 9.86 9.86 0 0 1-3.13 1.2 4.92 4.92 0 0 0-8.39 4.48A13.98 13.98 0 0 1 1.64 3.16a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.62v.06a4.93 4.93 0 0 0 3.95 4.83 4.93 4.93 0 0 1-2.22.08 4.94 4.94 0 0 0 4.6 3.42A9.88 9.88 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.05 0 14-7.5 14-14 0-.21 0-.42-.02-.63a10 10 0 0 0 2.46-2.55z" />
                </svg>
            );
        case "facebook":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.09 4.39 23.08 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.71 4.54-4.71 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.29h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07z" />
                </svg>
            );
        case "youtube":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                </svg>
            );
        case "instagram":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7zm5 2.3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2.2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.8-3.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z" />
                </svg>
            );
        default:
            return null;
    }
};

const Footer = () => {
    const [footer, setFooter] = useState(null);
    const [brand, setBrand] = useState(null);

    useEffect(() => {
        fetch(HOME_DATA_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load footer content.");
                }

                return response.json();
            })
            .then((data) => {
                setFooter(data.footer || null);
                setBrand(data.navbar || null);
            })
            .catch((error) => {
                console.error("Footer error:", error);
            });
    }, []);

    if (!footer) return null;

    return (
        <footer className="site-footer">
            <div className="site-footer__main">
                <div className="site-footer__columns">
                    <div className="site-footer__brand">
                        {brand?.logo && (
                            <a className="site-footer__brand-link" href={getAppHref("/")} aria-label="Elacher Ghor home">
                                <img
                                    src={getImageUrl(brand.logo)}
                                    alt="Elacher Ghor"
                                    title={brand.logoTitle || "Elacher Ghor logo"}
                                />
                            </a>
                        )}

                        <nav className="site-footer__social" aria-label="Social media">
                            {footer.socialLinks?.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    aria-label={social.name}
                                    title={social.name}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <SocialIcon name={social.name} />
                                </a>
                            ))}
                        </nav>
                    </div>

                    <section className="site-footer__column">
                        <h2>{footer.contactHeading}</h2>
                        <address>{footer.address}</address>

                        {footer.phone && (
                            <p>
                                Customer Care:{" "}
                                <a href={`tel:${footer.phone.replace(/\s/g, "")}`}>
                                    {footer.phone}
                                </a>
                            </p>
                        )}

                        {footer.email && (
                            <p>
                                E-mail:{" "}
                                <a href={`mailto:${footer.email}`}>
                                    {footer.email}
                                </a>
                            </p>
                        )}
                    </section>

                    <nav className="site-footer__column" aria-label="Quick links">
                        <h2>{footer.quickLinksHeading}</h2>
                        <ul>
                            {footer.quickLinks?.map((link) => (
                                <li key={link.label}>
                                    <a href={getAppHref(link.url)}>{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav className="site-footer__column" aria-label="Legal policies">
                        <h2>{footer.policiesHeading}</h2>
                        <ul>
                            {footer.policies?.map((link) => (
                                <li key={link.label}>
                                    <a href={getAppHref(link.url)}>{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="site-footer__bottom">
                <div className="site-footer__bottom-inner">
                    <p className="site-footer__copyright">
                        © {CURRENT_YEAR} {footer.copyrightName}
                    </p>
                    {footer.credit && (
                        <p className="site-footer__credit">
                            {footer.credit.text}{" "}
                            <a href={footer.credit.url} aria-label="Website designer">
                                {footer.credit.mark}
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
