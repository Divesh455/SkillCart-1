import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  // USER RESUME STATE (In-Memory temporary storage, NO localStorage as per specification)
  // TODO: Replace with backend stored resume data
  const [resumeData, setResumeData] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [resumeId, setResumeId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  /**
   * Store extracted resume data for smart job matching
   * TODO: Use backend response from resume/analyze or resume/generate
   */
  const setResumeState = (data) => {
    setResumeData(data);

    // Extract skills if available
    if (data?.skills) {
      const allSkills = Array.isArray(data.skills)
        ? data.skills
        : data.skills.flatMap((s) => s.skills || []);
      setExtractedSkills(allSkills);
    }

    // Extract target job title
    if (data?.targetJobTitle || data?.jobTitle || data?.experience?.[0]?.role) {
      setTargetJobTitle(data.targetJobTitle || data.jobTitle || data.experience?.[0]?.role || "Software Engineer");
    }

    // Extract resume ID
    const foundResId =
      data?.id ||
      data?.resume_id ||
      data?.res_id ||
      data?.data?.res_id ||
      data?.apiResponse?.data?.res_id;
    if (foundResId) {
      setResumeId(foundResId);
    }

    // Extract download URL from backend response structure:
    // data.download_url or data.data.download_url or data.apiResponse.data.download_url
    const foundDownloadUrl =
      data?.downloadUrl ||
      data?.download_url ||
      data?.data?.download_url ||
      data?.apiResponse?.data?.download_url ||
      data?.apiResponse?.download_url;
    if (foundDownloadUrl) {
      setDownloadUrl(foundDownloadUrl);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        setIsLoading,
        resumeData,
        extractedSkills,
        targetJobTitle,
        resumeId,
        downloadUrl,
        setDownloadUrl,
        setResumeState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
