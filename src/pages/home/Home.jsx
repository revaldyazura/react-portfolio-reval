import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import CvPanel from "../../components/cvpanel/CvPanel";
import SkillGroup from "../../components/skillgroup/SkillGroup";
import "./Home.css";

/* ── helpers ──────────────────────────────────────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

const parseSkillGroups = (raw = []) => {
  if (!raw.length) return [];
  const map = {};
  raw.forEach((s) => {
    const idx = s.indexOf(":");
    const label = idx > -1 ? s.slice(0, idx).trim() : "Stack";
    const skill = idx > -1 ? s.slice(idx + 1).trim() : s;
    if (!map[label]) map[label] = [];
    map[label].push(skill);
  });
  return Object.entries(map).map(([label, skills]) => ({ label, skills }));
};

/* ── skills ticker ────────────────────────────────────────── */
const SkillsTicker = ({ skills = [] }) => {
  const defaults = ["Web", "Programming", "Development", "JavaScript", "CSS", "Figma", "Git", "HTML", "React", "Node.js"];
  const items = skills.length ? skills.map((s) => s.replace(/^.*:\s*/, "")) : defaults;
  const doubled = [...items, ...items]; // seamless loop

  return (
    <div className="ticker-wrap" aria-label="Skills marquee" aria-hidden="true">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item">
            {item}
            <span className="ticker-slash">/</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── experience item ──────────────────────────────────────── */
const ExpItem = ({ date, title, desc }) => (
  <div className="exp-item">
    <div className="exp-date">{date}</div>
    <div>
      <div className="exp-title">
        {title}
        <span className="exp-arrow">↗</span>
      </div>
      <p className="exp-desc">{desc}</p>
    </div>
  </div>
);

/* ── Home ─────────────────────────────────────────────────── */
const Home = () => {
  const [homeData, setHomeData]       = useState(null);
  const [showCv, setShowCv]           = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const snap = await getDoc(doc(db, "meta", "home"));
        console.log("Home data snapshot:", snap.data());
        if (snap.exists()) setHomeData(snap.data());
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  const skillGroups  = parseSkillGroups(homeData?.skills);
  const experiences  = homeData?.experience || [];
  const px           = "clamp(1.5rem, 6vw, 5rem)";

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ── page body: scrollable content + optional CV panel ── */}
      <div className="flex flex-1" style={{ alignItems: "stretch" }}>

        {/* ── MAIN SCROLL AREA ── */}
        <main className="flex-1 overflow-y-auto flex flex-col">

          {/* ══ HERO ══════════════════════════════════════════ */}
          <section style={{ padding: `clamp(3rem, 8vw, 6rem) ${px}` }}>
            {loading ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-16 w-2/3" />
                <Skeleton className="h-8 w-1/3 mt-1" />
                <div className="flex gap-3 mt-4">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            ) : (
              <>
                <p className="fade-up d1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cyan)", marginBottom: "1rem" }}>
                  Hi, I'm
                </p>
                <h1 className="hero-name fade-up d2">
                  {homeData?.name || "Your Name"}
                  <span>.</span>
                  <span className="cursor-blink" aria-hidden="true" />
                </h1>
                <p className="hero-role fade-up d3">
                  <em>{homeData?.role?.split(" ")[0] || "Full-Stack"}</em>{" "}
                  {homeData?.role?.split(" ").slice(1).join(" ") || "Developer"}
                </p>
                <div className="flex flex-wrap gap-3 fade-up d4 mt-8">
                  {homeData?.cvPath ? (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => setShowCv((v) => !v)}
                        aria-expanded={showCv}
                        aria-controls="cv-panel"
                      >
                        {showCv ? "↙ Close CV" : "↗ View CV"}
                      </button>
                      <a href={homeData.cvPath} download target="_blank" rel="noreferrer" className="btn-ghost">
                        ↓ Download CV
                      </a>
                    </>
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)" }}>
                      No CV uploaded yet.
                    </span>
                  )}
                </div>
              </>
            )}
          </section>

          {/* ══ SKILLS TICKER ═════════════════════════════════ */}
          <SkillsTicker skills={homeData?.skills || []} />

          {/* ══ ABOUT ═════════════════════════════════════════ */}
          <section style={{ padding: `clamp(3rem, 7vw, 5rem) ${px}` }}>
            <h2 className="section-heading">About</h2>

            {loading ? (
              <div className="flex gap-8 flex-wrap">
                <Skeleton className="w-48 h-48 shrink-0" />
                <div className="flex flex-col gap-3 flex-1" style={{ minWidth: "240px" }}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : (
              <div className="flex gap-10 flex-wrap items-start">
                {/* photo / placeholder */}
                <div className="about-img">
                  {homeData?.photoUrl
                    ? <img src={homeData.photoUrl} alt={homeData.name || "Profile"} />
                    : <span className="about-img-placeholder">&lt;/&gt;</span>
                  }
                </div>
                {/* bio */}
                <div className="flex-1" style={{ minWidth: "240px" }}>
                  <p
                    className="about-bio"
                    style={{ whiteSpace: "pre-line" }}
                    dangerouslySetInnerHTML={{
                      __html: (homeData?.bio || "Your bio will appear here once set from the admin panel.")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    }}
                  />
                  {/* skill tags below bio */}
                  {skillGroups.length > 0 && (
                    <div className="mt-6">
                      {skillGroups.map((g) => (
                        <SkillGroup key={g.label} label={g.label} skills={g.skills} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ══ EXPERIENCE ════════════════════════════════════ */}
          <section style={{ padding: `clamp(2rem, 5vw, 4rem) ${px}`, paddingTop: 0 }}>
            <h2 className="section-heading">Experience</h2>

            {loading ? (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-6">
                    <Skeleton className="h-4 w-32 shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences.length > 0 ? (
              experiences.map((exp, i) => (
                <ExpItem
                  key={i}
                  date={exp.date}
                  title={exp.title}
                  desc={exp.description}
                />
              ))
            ) : (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)" }}>
                No experience added yet — add them from the admin panel.
              </p>
            )}
          </section>

        </main>

        {/* ── CV SIDE PANEL ── */}
        {showCv && homeData?.cvPath && (
          <CvPanel cvPath={homeData.cvPath} onClose={() => setShowCv(false)} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;