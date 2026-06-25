import "./SkillGroup.css";

const SkillGroup = ({ label, skills }) => (
  <div className="mb-4">
    <p className="skill-group__label">{label}</p>
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <span key={s} className="skill-tag">
          <span className="skill-tag__dot" aria-hidden="true" />
          {s}
        </span>
      ))}
    </div>
  </div>
);

export default SkillGroup;