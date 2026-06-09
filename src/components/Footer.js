import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Footer = () => {
  const [contact, setContact] = useState({ email: "", github: "", linkedin: "" });

  useEffect(() => {
    const fetchContact = async () => {
      const docRef = doc(db, "meta", "contact");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContact(docSnap.data());
      }
    };
    fetchContact();
  }, []);

  return (
    <footer>
      <hr />
      <p>Connect with me:</p>
      <p>Email: {contact.email}</p>
      <a href={contact.github}>GitHub</a> | <a href={contact.linkedin}>LinkedIn</a>
    </footer>
  );
};

export default Footer;