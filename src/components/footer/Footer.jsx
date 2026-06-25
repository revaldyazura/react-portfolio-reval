import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Footer.css";

const Sk = ({ className = "" }) => (
  <div className={`footer-sk ${className}`} aria-hidden="true" />
);

const Footer = () => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "meta", "contact"));
        if (snap.exists()) setContact(snap.data());
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const year = new Date().getFullYear();

  /* build social links array from contact doc */
  const socials = contact
    ? [
        contact.linkedin && { label: "Linkedin",  url: contact.linkedin },
        contact.instagram && { label: "Instagram", url: contact.instagram },
        contact.github    && { label: "GitHub",    url: contact.github },
        contact.email     && { label: "E-mail",    url: `mailto:${contact.email}` },
        ...(contact.additionalLinks || []),
      ].filter(Boolean)
    : [];

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer__inner">

        {/* brand */}
        <div>
          <p className="footer__brand-name">
            Rev<span className="footer__brand-slash">/</span>
          </p>
          <p className="footer__brand-tag">Contact me</p>
        </div>

        {/* contact details */}
        <div>
          <p className="footer__label">Contact</p>
          {loading ? (
            <div className="flex flex-col gap-2">
              <Sk className="h-4 w-44" />
              <Sk className="h-4 w-36" />
              <Sk className="h-4 w-40" />
            </div>
          ) : (
            <>
              {contact?.email && (
                <a href={`mailto:${contact.email}`} className="footer__contact-item">
                  <span className="footer__contact-icon">✉</span>
                  {contact.email}
                </a>
              )}
              {contact?.phone && (
                <a href={`tel:${contact.phone}`} className="footer__contact-item">
                  <span className="footer__contact-icon">◎</span>
                  {contact.phone}
                </a>
              )}
              {contact?.location && (
                <span className="footer__contact-item" style={{ cursor: "default" }}>
                  <span className="footer__contact-icon">◈</span>
                  {contact.location}
                </span>
              )}
              {!contact && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--muted)" }}>
                  No contact info yet.
                </span>
              )}
            </>
          )}
        </div>

        {/* social grid */}
        <div>
          <p className="footer__label">Find me</p>
          {loading ? (
            <div className="footer__social-grid">
              {[1,2,3,4].map(i => <Sk key={i} className="h-10" />)}
            </div>
          ) : socials.length > 0 ? (
            <div className="footer__social-grid">
              {socials.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target={url.startsWith("mailto") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="footer__social-link"
                >
                  {label}
                  <span className="footer__social-arrow">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--muted)" }}>
              No links added yet.
            </span>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="footer__bottom">
        <span className="footer__copy">
          © {year} | {contact?.name || "Portfolio"}
        </span>
        <span className="footer__status">
          <span className="footer__status-dot" aria-hidden="true" />
          Open to opportunities
        </span>
      </div>
    </footer>
  );
};

export default Footer;