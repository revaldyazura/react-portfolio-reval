import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./Projects.css";

/* ── helpers ──────────────────────────────────────────────── */
const Sk = ({ className = "" }) => (
  <div className={`proj-sk ${className}`} aria-hidden="true" />
);

const ImgOrPlaceholder = ({ src, alt, className }) =>
  src ? (
    <img src={src} alt={alt} loading="lazy" />
  ) : (
    <div className={`img-placeholder ${className || ""}`}>no image</div>
  );

/* ── expanded content ─────────────────────────────────────── */
const ProjectExpanded = ({ project }) => {
  const [img0, img1, img2] = project.images || [];

  return (
    <div className="project-expanded">
      {/* gallery */}
      <div className="project-expanded__gallery">
        <div className="project-expanded__img-main">
          <ImgOrPlaceholder src={img0} alt={`${project.title} screenshot 1`} />
        </div>
        <div className="project-expanded__img-sub">
          <ImgOrPlaceholder src={img1} alt={`${project.title} screenshot 2`} />
        </div>
        <div className="project-expanded__img-sub">
          <ImgOrPlaceholder src={img2} alt={`${project.title} screenshot 3`} />
        </div>
      </div>

      {/* details */}
      <div className="project-expanded__details">
        {/* full description */}
        <div>
          <p className="project-expanded__section-label">About this project</p>
          <p className="project-expanded__desc">
            {project.description || "No description provided."}
          </p>
        </div>

        {/* tech stack */}
        {project.techStack?.length > 0 && (
          <div>
            <p className="project-expanded__section-label">Tech stack</p>
            <div className="project-card__tags">
              {project.techStack.map((t) => (
                <span key={t} className="project-tag">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* links */}
        <div>
          <p className="project-expanded__section-label">Links</p>
          <div className="project-expanded__links">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="project-link project-link--primary"
              >
                ↗ Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="project-link project-link--ghost"
              >
                ⌥ GitHub
              </a>
            )}
            {!project.liveUrl && !project.githubUrl && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--muted)" }}>
                No links provided.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── project card ─────────────────────────────────────────── */
const ProjectCard = ({ project, index, isExpanded, onToggle }) => {
  const cardRef = useRef(null);
  const [img0, img1, img2] = project.images || [];

  /* scroll card into view when expanded */
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [isExpanded]);

  return (
    <article
      ref={cardRef}
      className={`project-card ${isExpanded ? "expanded" : ""}`}
      onClick={!isExpanded ? onToggle : undefined}
      aria-expanded={isExpanded}
    >
      {/* ── top row: index + title + toggle ── */}
      <div className="project-card__top">
        <span className="project-card__index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="project-card__title">{project.title}</h2>
        <button
          className={`project-card__toggle ${isExpanded ? "open" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={isExpanded ? "Collapse project" : "Expand project"}
        >
          +
        </button>
      </div>

      {/* ── thumbnail strip (always visible) ── */}
      <div className="project-card__thumb-strip">
        {[img0, img1, img2].map((src, i) => (
          <div key={i} className="project-card__thumb">
            {src
              ? <img src={src} alt={`${project.title} preview ${i + 1}`} loading="lazy" />
              : <div className="project-card__thumb-placeholder">img</div>
            }
          </div>
        ))}
      </div>

      {/* ── short desc (collapsed only) ── */}
      {!isExpanded && (
        <p className="project-card__short-desc">
          {project.description || "No description yet."}
        </p>
      )}

      {/* ── tech tags (collapsed: max 3) ── */}
      {!isExpanded && project.techStack?.length > 0 && (
        <div className="project-card__tags">
          {project.techStack.slice(0, 3).map((t) => (
            <span key={t} className="project-tag">{t}</span>
          ))}
          {project.techStack.length > 3 && (
            <span className="project-tag" style={{ opacity: 0.5 }}>
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      )}

      {/* ── expanded detail panel ── */}
      {isExpanded && <ProjectExpanded project={project} />}
    </article>
  );
};

/* ── skeleton cards ───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="project-card" style={{ cursor: "default", gap: "14px" }}>
    <div className="project-card__top">
      <Sk className="h-3 w-6" />
      <Sk className="h-5 flex-1" />
    </div>
    <div className="project-card__thumb-strip">
      {[0,1,2].map(i => <Sk key={i} className="flex-1 h-full" style={{ borderRadius: "3px" }} />)}
    </div>
    <Sk className="h-3 w-full" />
    <Sk className="h-3 w-4/5" />
    <div className="flex gap-2">
      <Sk className="h-5 w-16" />
      <Sk className="h-5 w-14" />
      <Sk className="h-5 w-20" />
    </div>
  </div>
);

/* ── Projects page ────────────────────────────────────────── */
const Projects = () => {
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expandedId, setExpandedId]   = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q    = query(collection(db, "projects"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleToggle = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="projects-page">
      <Navbar />

      <main className="projects-main">
        {/* header */}
        <header className="projects-header">
          <p className="projects-count">
            {loading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
          <h1 className="section-heading">Projects</h1>
        </header>

        {/* grid */}
        {loading ? (
          <div className="projects-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isExpanded={expandedId === project.id}
                onToggle={() => handleToggle(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="projects-empty">
            <span className="projects-empty__icon">◈</span>
            <p className="projects-empty__text">No projects added yet.</p>
            <p className="projects-empty__text" style={{ opacity: 0.5 }}>
              Add projects from the admin panel.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Projects;