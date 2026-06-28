import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ImgSlot.css";

const ImgSlot = ({ label, value, onChange }) => {
  const [preview, setPreview] = useState(value || null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="admin-img-slot">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFile} 
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          opacity: 0, cursor: 'pointer', zIndex: 10
        }}
        title={label} 
      />
      {preview ? (
        <>
          <img src={preview} alt="preview" className="admin-img-slot__preview" />
          <button className="admin-img-slot__clear" onClick={clear} type="button">×</button>
        </>
      ) : (
        <div className="admin-img-slot__placeholder">
          <span>+</span>
          <span>{label}</span>
        </div>
      )}
    </div>
  );
};

export default ImgSlot;