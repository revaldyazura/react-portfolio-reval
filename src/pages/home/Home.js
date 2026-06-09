// src/pages/home/Home.js
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Home = () => {
  const [homeData, setHomeData] = useState({ aboutMeText: "", cvUrl: "" });
  const [showCv, setShowCv] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      const docSnap = await getDoc(doc(db, "meta", "home"));
      if (docSnap.exists()) setHomeData(docSnap.data());
    };
    fetchHomeData();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "80vh" }}>
        {/* Main Content Side */}
        <div style={{ flex: 1, padding: "20px", minWidth: "300px" }}>
          <h1>Welcome to My Portfolio</h1>
          <p>{homeData.aboutMeText}</p>
          
          <button onClick={() => setShowCv(!showCv)}>
            {showCv ? "Hide CV" : "Preview CV Side-by-Side"}
          </button>
          
          {homeData.cvUrl && (
            <a href={homeData.cvUrl} download target="_blank" rel="noreferrer">
              <button style={{ marginLeft: "10px" }}>Download CV</button>
            </a>
          )}
        </div>

        {/* Side-by-Side CV Preview Panel */}
        {showCv && homeData.cvUrl && (
          <div style={{ flex: 1, padding: "20px", borderLeft: "2px solid #ccc", minWidth: "300px" }}>
            <h3>CV Preview</h3>
            <iframe src={homeData.cvUrl} title="CV Preview" width="100%" height="500px" />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;