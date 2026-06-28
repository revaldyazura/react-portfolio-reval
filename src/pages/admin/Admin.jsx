import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  doc, getDoc, setDoc,
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  orderBy, query,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import "./Admin.css";
import ImgSlot from "../../components/imgslot/ImgSlot.jsx";
// import SectionHome from "../../components/sectionhome/SectionHome.jsx";


/* ════════════════════════════════════════════════════════════
   FILE UPLOAD UTILITY
   - Dev mode  → POST ke /dev-upload (Vite plugin nulis ke public/)
   - Prod mode → reminder manual copy saja
════════════════════════════════════════════════════════════ */
const isDev = import.meta.env.DEV;

const uploadToPublic = async (file, destPath) => {
  if (!isDev) {
    // production: tidak bisa auto-upload, return path saja
    return { ok: false, path: "/" + destPath, manual: true };
  }

  const formData = new FormData();
  formData.append("path", destPath);
  formData.append("file", file);

  const res  = await fetch("/dev-upload", { method: "POST", body: formData });
  const json = await res.json();
  return json; // { ok: true, path: "/cv.pdf" }
};

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);
  return { toast, show };
};

/* ════════════════════════════════════════════════════════════
   SHARED COMPONENTS
════════════════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`admin-toast ${toast.type}`} role="alert" aria-live="polite">
      <span>{toast.type === "success" ? "✓" : "✕"}</span>
      {toast.msg}
    </div>
  );
};

const Spinner = () => <span className="admin-spinner" aria-hidden="true" />;

const Field = ({ label, children }) => (
  <div className="admin-field">
    <label className="admin-label">{label}</label>
    {children}
  </div>
);

// const ImgSlot = ({ label, value, onChange }) => {
//   const [preview, setPreview] = useState(value || null);

//   useEffect(() => {
//     setPreview(value);
//   }, [value]);

//   const handleFile = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setPreview(URL.createObjectURL(file));
//     onChange(file);
//   };

//   const clear = (e) => {
//     e.stopPropagation();
//     setPreview(null);
//     onChange(null);
//   };

//   return (
//     <div className="admin-img-slot">
//       <input 
//         type="file" 
//         accept="image/*" 
//         onChange={handleFile} 
//         style={{
//           position: 'absolute',
//           top: 0, left: 0, width: '100%', height: '100%',
//           opacity: 0, cursor: 'pointer', zIndex: 10
//         }}
//         title={label} 
//       />
//       {preview ? (
//         <>
//           <img src={preview} alt="preview" className="admin-img-slot__preview" />
//           <button className="admin-img-slot__clear" onClick={clear} type="button">×</button>
//         </>
//       ) : (
//         <div className="admin-img-slot__placeholder">
//           <span>+</span>
//           <span>{label}</span>
//         </div>
//       )}
//     </div>
//   );
// };

/* ════════════════════════════════════════════════════════════
   SECTION: HOME
════════════════════════════════════════════════════════════ */
const SectionHome = ({ showToast }) => {
  const [data, setData]             = useState({ name:"", role:"", bio:"", skills:[], cvPath:"/cv.pdf" });
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
          setData({ name: d.name||"", role: d.role||"", bio: d.bio||"", skills: d.skills||[], cvPath: d.cvPath||"/cv.pdf" });
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
      let cvPath = data.cvPath;

      if (cvFile) {
        const ext    = cvFile.name.split(".").pop();
        const dest   = `cv.${ext}`; // → public/cv.pdf
        const result = await uploadToPublic(cvFile, dest);

        if (result.ok) {
          cvPath = result.path; // "/cv.pdf"
          showToast("CV uploaded to public/cv.pdf ✓");
        } else if (result.manual) {
          cvPath = "/" + dest;
          showToast(`Production: copy "${cvFile.name}" → public/cv.pdf manually`, "error");
        } else {
          showToast("CV upload failed: " + result.error, "error");
        }
      }

      await setDoc(doc(db, "meta", "home"), { ...data, cvPath, experience: expItems });
      setData(p => ({ ...p, cvPath }));
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
          Current path: <span style={{ color:"var(--cyan)" }}>{data.cvPath}</span>
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

/* ════════════════════════════════════════════════════════════
   SECTION: PROJECTS
════════════════════════════════════════════════════════════ */
const SectionProjects = ({ showToast }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const blank = () => ({
    title:"", description:"", techStack:[], images:[null,null,null],
    githubUrl:"", liveUrl:"", order: projects.length,
  });

  const [form, setForm]         = useState(blank());
  const [tagInput, setTagInput] = useState("");
  const [imgFiles, setImgFiles] = useState([null,null,null]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q    = query(collection(db,"projects"), orderBy("order","asc"));
        const snap = await getDocs(q);
        setProjects(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const selectProject = (p) => {
    setActiveId(p.id);
    setForm({ ...p, techStack:p.techStack||[], images:p.images||[null,null,null] });
    setImgFiles([null,null,null]);
    setTagInput("");
  };

  const newProject = () => {
    setActiveId("__new__");
    setForm(blank());
    setImgFiles([null,null,null]);
    setTagInput("");
  };

  const addTag    = () => { const v=tagInput.trim(); if(!v||form.techStack.includes(v))return; setForm(p=>({...p,techStack:[...p.techStack,v]})); setTagInput(""); };
  const removeTag = (t) => setForm(p=>({...p,techStack:p.techStack.filter(x=>x!==t)}));
  const setImg    = (i,file) => { const a=[...imgFiles]; a[i]=file; setImgFiles(a); };

  const save = async () => {
    if (!form.title.trim()) { showToast("Title is required.", "error"); return; }
    setSaving(true);
    try {
      const slug   = form.title.trim().toLowerCase().replace(/\s+/g,"-");
      const images = [...(form.images||[null,null,null])];

      /* upload each selected image file */
      for (let i = 0; i < 3; i++) {
        const file = imgFiles[i];
        if (!file) continue;

        const ext    = file.name.split(".").pop();
        const dest   = `${slug}/image_${i+1}.${ext}`;
        const result = await uploadToPublic(file, dest);

        if (result.ok) {
          images[i] = result.path; // "/{slug}/image_1.jpg"
          showToast(`Image ${i+1} uploaded ✓`);
        } else if (result.manual) {
          images[i] = "/" + dest;
          showToast(`Production: copy image ${i+1} → public/${dest}`, "error");
        } else {
          showToast(`Image ${i+1} upload failed: ${result.error}`, "error");
        }
      }

      const payload = { ...form, images, order: form.order ?? projects.length };

      if (activeId === "__new__") {
        const ref  = await addDoc(collection(db,"projects"), payload);
        setProjects(p => [...p, { id:ref.id, ...payload }]);
        setActiveId(ref.id);
        showToast("Project created.");
      } else {
        await updateDoc(doc(db,"projects",activeId), payload);
        setProjects(p => p.map(x => x.id===activeId ? {...x,...payload} : x));
        showToast("Project saved.");
      }

      setImgFiles([null,null,null]);
      setForm(p => ({ ...p, images }));
    } catch (err) {
      showToast("Failed to save: " + err.message, "error");
    } finally { setSaving(false); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db,"projects",id));
      setProjects(p => p.filter(x=>x.id!==id));
      if (activeId===id) { setActiveId(null); setForm(blank()); }
      showToast("Project deleted.");
    } catch { showToast("Failed to delete.", "error"); }
    finally { setDeleting(null); }
  };

  if (loading) return <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)" }}>Loading...</p>;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"1.5rem", alignItems:"start" }}>
      {/* list */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
            {projects.length} project{projects.length!==1?"s":""}
          </span>
          <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={newProject}>+ New</button>
        </div>
        {projects.map((p,i) => (
          <div key={p.id} className={`admin-project-item ${activeId===p.id?"active":""}`} onClick={()=>selectProject(p)}>
            <span className="admin-project-item__index">{String(i+1).padStart(2,"0")}</span>
            <span className="admin-project-item__title">{p.title||"Untitled"}</span>
            <div className="admin-project-item__actions">
              <button className="admin-btn admin-btn--danger admin-btn--sm"
                onClick={e=>{e.stopPropagation();deleteProject(p.id);}} disabled={deleting===p.id}>
                {deleting===p.id ? <Spinner /> : "✕"}
              </button>
            </div>
          </div>
        ))}
        {projects.length===0 && <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--muted)", padding:"12px 0" }}>No projects yet.</p>}
      </div>

      {/* form */}
      {activeId ? (
        <div>
          <h2 className="admin-section-title">{activeId==="__new__"?"New project":"Edit project"}<span>.</span></h2>
          <p className="admin-section-sub">
            {isDev
              ? <span style={{ color:"var(--cyan)" }}>✓ Dev mode — gambar otomatis disimpan ke public/{"{slug}"}/image_N.ext</span>
              : <span>Production: copy gambar ke public/{"{slug}"}/image_N.ext lalu deploy ulang.</span>
            }
          </p>

          <div className="admin-card">
            <p className="admin-card__title">Details</p>
            <Field label="Title">
              <input className="admin-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Project name" />
            </Field>
            <Field label="Description">
              <textarea className="admin-textarea" rows={4} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="What is this project about?" style={{ minHeight:"100px" }} />
            </Field>
            <Field label="Order (sort position)">
              <input className="admin-input" type="number" min={0} value={form.order} onChange={e=>setForm(p=>({...p,order:Number(e.target.value)}))} style={{ width:"100px" }} />
            </Field>
          </div>

          <div className="admin-card">
            <p className="admin-card__title">Links</p>
            <Field label="GitHub URL">
              <input className="admin-input" value={form.githubUrl||""} onChange={e=>setForm(p=>({...p,githubUrl:e.target.value}))} placeholder="https://github.com/..." />
            </Field>
            <Field label="Live demo URL">
              <input className="admin-input" value={form.liveUrl||""} onChange={e=>setForm(p=>({...p,liveUrl:e.target.value}))} placeholder="https://..." />
            </Field>
          </div>

          <div className="admin-card">
            <p className="admin-card__title">Tech stack</p>
            <div className="admin-skills-list">
              {form.techStack.map(t => (
                <span key={t} className="admin-skill-tag">
                  {t}
                  <button className="admin-skill-remove" onClick={()=>removeTag(t)} type="button">×</button>
                </span>
              ))}
            </div>
            <div className="admin-skill-add">
              <input className="admin-input" placeholder="React" value={tagInput}
                onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addTag())} />
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addTag} type="button">+ Add</button>
            </div>
          </div>

          <div className="admin-card">
            <p className="admin-card__title">Images (3 slots)</p>
            <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--muted)", marginBottom:"10px", lineHeight:"1.6" }}>
              Path: <span style={{ color:"var(--cyan)" }}>
                public/{form.title?.toLowerCase().replace(/\s+/g,"-")||"{title}"}/image_1.ext
              </span>
            </p>
            <div className="admin-img-grid">
              {[0,1,2].map(i => (
                <ImgSlot key={i} label={`img ${i+1}`} value={form.images?.[i]} onChange={(file)=>setImg(i,file)} />
              ))}
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1rem" }}>
            <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
              {saving ? <><Spinner /> Saving...</> : (activeId==="__new__"?"↗ Create project":"↗ Save changes")}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"200px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"6px" }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)" }}>← Select a project or create new</p>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SECTION: CONTACT
════════════════════════════════════════════════════════════ */
const SectionContact = ({ showToast }) => {
  const [data, setData]           = useState({ name:"", email:"", phone:"", location:"", github:"", linkedin:"", instagram:"", additionalLinks:[] });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [linkInput, setLinkInput] = useState({ label:"", url:"" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db,"meta","contact"));
        if (snap.exists()) {
          const d = snap.data();
          setData({ name:d.name||"", email:d.email||"", phone:d.phone||"", location:d.location||"", github:d.github||"", linkedin:d.linkedin||"", instagram:d.instagram||"", additionalLinks:d.additionalLinks||[] });
        }
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const addLink    = () => { if(!linkInput.label.trim()||!linkInput.url.trim())return; setData(p=>({...p,additionalLinks:[...p.additionalLinks,{...linkInput}]})); setLinkInput({label:"",url:""}); };
  const removeLink = (i) => setData(p=>({...p,additionalLinks:p.additionalLinks.filter((_,idx)=>idx!==i)}));

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db,"meta","contact"), data);
      showToast("Contact info saved.");
    } catch { showToast("Failed to save.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)" }}>Loading...</p>;

  return (
    <div>
      <h2 className="admin-section-title">Contact<span>.</span></h2>
      <p className="admin-section-sub">Edit footer contact details and social links.</p>

      <div className="admin-card">
        <p className="admin-card__title">Identity</p>
        <Field label="Display name (shown in footer copyright)">
          <input className="admin-input" value={data.name} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder="Your Name" />
        </Field>
      </div>

      <div className="admin-card">
        <p className="admin-card__title">Contact details</p>
        <Field label="Email"><input className="admin-input" type="email" value={data.email} onChange={e=>setData(p=>({...p,email:e.target.value}))} placeholder="you@email.com" /></Field>
        <Field label="Phone"><input className="admin-input" type="tel" value={data.phone} onChange={e=>setData(p=>({...p,phone:e.target.value}))} placeholder="+62 ..." /></Field>
        <Field label="Location"><input className="admin-input" value={data.location} onChange={e=>setData(p=>({...p,location:e.target.value}))} placeholder="South Tangerang, ID" /></Field>
      </div>

      <div className="admin-card">
        <p className="admin-card__title">Social links</p>
        <Field label="GitHub URL"><input className="admin-input" value={data.github} onChange={e=>setData(p=>({...p,github:e.target.value}))} placeholder="https://github.com/..." /></Field>
        <Field label="LinkedIn URL"><input className="admin-input" value={data.linkedin} onChange={e=>setData(p=>({...p,linkedin:e.target.value}))} placeholder="https://linkedin.com/in/..." /></Field>
        <Field label="Instagram URL"><input className="admin-input" value={data.instagram} onChange={e=>setData(p=>({...p,instagram:e.target.value}))} placeholder="https://instagram.com/..." /></Field>
      </div>

      <div className="admin-card">
        <p className="admin-card__title">Additional links</p>
        {data.additionalLinks.map((link,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--cyan)", flex:"0 0 80px" }}>{link.label}</span>
            <span style={{ fontFamily:"var(--font-body)", fontSize:"0.78rem", color:"var(--muted)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{link.url}</span>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>removeLink(i)} type="button">✕</button>
          </div>
        ))}
        <div className="admin-divider" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:"8px", alignItems:"center" }}>
          <input className="admin-input" placeholder="Label" value={linkInput.label} onChange={e=>setLinkInput(p=>({...p,label:e.target.value}))} />
          <input className="admin-input" placeholder="https://..." value={linkInput.url} onChange={e=>setLinkInput(p=>({...p,url:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addLink()} />
          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addLink} type="button">+ Add</button>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1rem" }}>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
          {saving ? <><Spinner /> Saving...</> : "↗ Save changes"}
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   ADMIN ROOT
════════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id:"home",     label:"Home",     icon:"⌂" },
  { id:"projects", label:"Projects", icon:"◈" },
  { id:"contact",  label:"Contact",  icon:"✉" },
];

const Admin = () => {
  const [active, setActive]        = useState("home");
  const { dispatch }               = useContext(AuthContext);
  const navigate                   = useNavigate();
  const { toast, show: showToast } = useToast();

  const logout = async () => {
    await signOut(auth);
    dispatch({ type:"LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="admin">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar__brand">
          <p className="admin-sidebar__brand-name">Dev<span>/</span></p>
          <p className="admin-sidebar__brand-sub">
            Admin panel {isDev && <span style={{ color:"var(--cyan)" }}>· dev</span>}
          </p>
        </div>
        <nav className="admin-sidebar__nav" aria-label="Sections">
          <p className="admin-sidebar__label">Content</p>
          {SECTIONS.map(s => (
            <button key={s.id} className={`admin-nav-btn ${active===s.id?"active":""}`}
              onClick={()=>setActive(s.id)} aria-current={active===s.id?"page":undefined}>
              <span className="admin-nav-btn__icon">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <button className="admin-logout" onClick={logout}>
            <span>↩</span> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {active==="home"     && <SectionHome     showToast={showToast} />}
        {active==="projects" && <SectionProjects showToast={showToast} />}
        {active==="contact"  && <SectionContact  showToast={showToast} />}
      </main>

      <Toast toast={toast} />
    </div>
  );
};

export default Admin;