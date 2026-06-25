import "./CvPanel.css";

const CvPanel = ({ cvPath, onClose }) => (
  <aside className="cv-panel" id="cv-panel" aria-label="CV preview panel">
    <div className="cv-panel__header">
      <span className="cv-panel__filename">curriculum_vitae.pdf</span>
      <div className="cv-panel__actions">
        <a
          href={cvPath}
          download
          target="_blank"
          rel="noreferrer"
          className="cv-panel__download"
        >
          ↓ Download
        </a>
        <button
          className="cv-panel__close"
          onClick={onClose}
          aria-label="Close CV preview"
        >
          ×
        </button>
      </div>
    </div>
    <iframe
      src={cvPath}
      title="CV Preview"
      className="cv-panel__iframe"
    />
  </aside>
);

export default CvPanel;