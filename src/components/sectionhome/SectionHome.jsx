import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc, getDoc, setDoc,
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  orderBy, query,
} from "firebase/firestore";

const SectionHome = ({ showToast }) => {
  const [data, setData]             = useState({ name:"", role:"", bio:"", skills:[], cvUrl:"/cv.pdf" });
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [cvFile, setCvFile]         = useState(null);
  const [expItems, setExpItems]     = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "meta", "home"));
        if (snap.exists()) {
          const d = snap.data();
          setData({ name: d.name||"", role: d.role||"", bio: d.bio||"", skills: d.skills||[], cvUrl: d.cvUrl||"/cv.pdf" });
          setExpItems(d.experience || []);
        }
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || data.skills.includes(v)) return;
    setData(p => ({ ...p, skills: [...p.skills, v] }));
    setSkillInput("");
  };
  const removeSkill = (s) => setData(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));
  const addExp      = () => setExpItems(p => [...p, { date:"", title:"", description:"" }]);
  const updateExp   = (i, field, val) => setExpItems(p => p.map((x,idx) => idx===i ? {...x,[field]:val} : x));
  const removeExp   = (i) => setExpItems(p => p.filter((_,idx) => idx!==i));

  const save = async () => {
    setSaving(true);
    try {
      let cvUrl = data.cvUrl;

      if (cvFile) {
        const ext    = cvFile.name.split(".").pop();
        const dest   = `cv.${ext}`; // → public/cv.pdf
        const result = await uploadToPublic(cvFile, dest);

        if (result.ok) {
          cvUrl = result.path; // "/cv.pdf"
          showToast("CV uploaded to public/cv.pdf ✓");
        } else if (result.manual) {
          cvUrl = "/" + dest;
          showToast(`Production: copy "${cvFile.name}" → public/cv.pdf manually`, "error");
        } else {
          showToast("CV upload failed: " + result.error, "error");
        }
      }

      await setDoc(doc(db, "meta", "home"), { ...data, cvUrl, experience: expItems });
      setData(p => ({ ...p, cvUrl }));
      setCvFile(null);
      if (!cvFile) showToast("Home content saved.");
    } catch (err) {
      showToast("Failed to save: " + err.message, "error");
    } finally { setSaving(false); }
  };

  if (loading) return <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)" }}>Loading...</p>;

  return (
    <div>
      <h2 className="admin-section-title">Home<span>.</span></h2>
      <p className="admin-section-sub">Edit home page content — name, bio, CV, skills, experience.</p>

      {/* basic info */}
      <div className="admin-card">
        <p className="admin-card__title">Basic info</p>
        <Field label="Display name">
          <input className="admin-input" value={data.name} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder="Your Name" />
        </Field>
        <Field label="Role / title">
          <input className="admin-input" value={data.role} onChange={e=>setData(p=>({...p,role:e.target.value}))} placeholder="Full-Stack Developer" />
        </Field>
        <Field label="Bio — use **bold** for emphasis, newline for paragraphs">
          <textarea className="admin-textarea" rows={5} value={data.bio} onChange={e=>setData(p=>({...p,bio:e.target.value}))} placeholder="Tell visitors about yourself..." style={{ minHeight:"120px" }} />
        </Field>
      </div>

      {/* CV upload */}
      <div className="admin-card">
        <p className="admin-card__title">CV / Resume</p>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--muted)", marginBottom:"10px" }}>
          Current path: <span style={{ color:"var(--cyan)" }}>{data.cvUrl}</span>
          {isDev && <span style={{ color:"var(--cyan)", marginLeft:"8px" }}>— auto upload aktif ✓</span>}
        </p>
        <Field label="Upload new CV (PDF)">
          <div className="admin-upload-area">
            <input type="file" accept=".pdf" onChange={e=>setCvFile(e.target.files?.[0]||null)} />
            <div className="admin-upload-icon">↑</div>
            <p className="admin-upload-text">
              Drop PDF here or <span>browse</span>
            </p>
          </div>
          {cvFile && (
            <div className="admin-upload-preview">
              <span className="admin-upload-preview__name">📄 {cvFile.name}</span>
              <button className="admin-upload-preview__clear" onClick={()=>setCvFile(null)} type="button">×</button>
            </div>
          )}
        </Field>
        {!isDev && (
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--muted)", marginTop:"8px", lineHeight:"1.6" }}>
            ⚠ Production: copy PDF ke <span style={{ color:"var(--cyan)" }}>public/cv.pdf</span> lalu deploy ulang.
          </p>
        )}
      </div>

      {/* skills */}
      <div className="admin-card">
        <p className="admin-card__title">Skills / Tech stack</p>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--muted)", marginBottom:"10px" }}>
          Format: <span style={{ color:"var(--cyan)" }}>Category: Skill</span> e.g. "Frontend: React"
        </p>
        <div className="admin-skills-list">
          {data.skills.map(s => (
            <span key={s} className="admin-skill-tag">
              {s}
              <button className="admin-skill-remove" onClick={()=>removeSkill(s)} type="button" aria-label={`Remove ${s}`}>×</button>
            </span>
          ))}
          {data.skills.length===0 && (
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--muted)" }}>No skills added yet.</span>
          )}
        </div>
        <div className="admin-skill-add">
          <input className="admin-input" placeholder="Frontend: React" value={skillInput}
            onChange={e=>setSkillInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addSkill())} />
          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addSkill} type="button">+ Add</button>
        </div>
      </div>

      {/* experience */}
      <div className="admin-card">
        <p className="admin-card__title">Experience</p>
        {expItems.map((exp, i) => (
          <div key={i} className="admin-exp-item">
            <div className="admin-exp-item__header">
              <input className="admin-input" style={{ flex:1 }} placeholder="Jun 2023 – Aug 2024" value={exp.date} onChange={e=>updateExp(i,"date",e.target.value)} />
              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>removeExp(i)} type="button">Remove</button>
            </div>
            <input className="admin-input" placeholder="Company | Role" value={exp.title} onChange={e=>updateExp(i,"title",e.target.value)} />
            <textarea className="admin-textarea" rows={2} placeholder="Description..." value={exp.description} onChange={e=>updateExp(i,"description",e.target.value)} style={{ minHeight:"60px" }} />
          </div>
        ))}
        <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addExp} type="button" style={{ marginTop:"4px" }}>+ Add experience</button>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1rem" }}>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
          {saving ? <><Spinner /> Saving...</> : "↗ Save changes"}
        </button>
      </div>
    </div>
  );
};

export default SectionHome;