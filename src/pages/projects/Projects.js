// src/pages/projects/Projects.js
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(list);
    };
    fetchProjects();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h2>My Projects</h2>
        {projects.map((project) => (
          <div key={project.id} style={{ marginBottom: "40px", borderBottom: "1px solid #eee" }}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {project.images?.map((imgUrl, idx) => (
                <img key={idx} src={imgUrl} alt="Project sample" style={{ width: "200px", height: "150px", objectFit: "cover" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Projects;