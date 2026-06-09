// inside Admin.js snippet for updating Contact
const handleUpdateContact = async (e) => {
  e.preventDefault();
  await setDoc(doc(db, "meta", "contact"), {
    email: emailInput,
    github: githubInput,
    linkedin: linkedinInput
  });
  alert("Contact updated successfully!");
};