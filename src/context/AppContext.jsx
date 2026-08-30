import {
  createContext,
  useContext,
  useState,
} from "react";
import resumeService from "../services/resumeService";

const AppContext = createContext(null);

export function AppProvider({ children }) {

  // ============================================================
  // LOADING
  // ============================================================

  const [isLoading, setIsLoading] =
    useState(false);

  // ============================================================
  // RESUME DATA
  // ============================================================

  const [resumeData, setResumeData] =
    useState(null);

  // ============================================================
  // EXTRACTED SKILLS
  // ============================================================

  const [extractedSkills, setExtractedSkills] =
    useState([]);

  // ============================================================
  // TARGET JOB TITLE
  // ============================================================

  const [targetJobTitle, setTargetJobTitle] =
    useState("");

  // ============================================================
  // RESUME ID
  //
  // First try React state from localStorage.
  // Ayush's login response gives us "Rid".
  // AuthContext stores it as "res_id".
  // ============================================================

  const [resumeId, setResumeIdState] =
    useState(() => {
      return (
        localStorage.getItem("res_id") ||
        localStorage.getItem("resume_id") ||
        null
      );
    });

  // ============================================================
  // DOWNLOAD URL
  // ============================================================

  const [downloadUrl, setDownloadUrl] =
    useState(null);

  // ============================================================
  // SET RESUME ID
  //
  // This updates both:
  // 1. React state
  // 2. localStorage
  // ============================================================

  const setResumeId = (id) => {

    if (id) {

      setResumeIdState(id);

      localStorage.setItem(
        "res_id",
        String(id)
      );

      localStorage.setItem(
        "resume_id",
        String(id)
      );

    } else {

      setResumeIdState(null);

      localStorage.removeItem(
        "res_id"
      );

      localStorage.removeItem(
        "resume_id"
      );
    }
  };

  // ============================================================
  // SET RESUME STATE
  // ============================================================

  const setResumeState = (data) => {

    setResumeData(data);

    // ========================================================
    // EXTRACT SKILLS
    // ========================================================

    if (data?.skills) {

      let allSkills = [];

      if (Array.isArray(data.skills)) {

        // Backend parsed JSON structure:
        //
        // skills: [
        //   {
        //     category: "...",
        //     skills: ["Python", "JavaScript"]
        //   }
        // ]

        const isGroupedSkills =
          data.skills.some(
            (item) =>
              item &&
              typeof item === "object" &&
              Array.isArray(item.skills)
          );

        if (isGroupedSkills) {

          allSkills =
            data.skills.flatMap(
              (item) =>
                Array.isArray(item?.skills)
                  ? item.skills
                  : []
            );

        } else {

          allSkills =
            data.skills;
        }
      }

      setExtractedSkills(
        allSkills
      );
    } else {

      setExtractedSkills([]);
    }

    // ========================================================
    // EXTRACT TARGET JOB TITLE
    // ========================================================

    const foundJobTitle =
      data?.targetJobTitle ||
      data?.jobTitle ||
      data?.experience?.[0]?.role ||
      "";

    if (foundJobTitle) {

      setTargetJobTitle(
        foundJobTitle
      );
    }

    // ========================================================
    // EXTRACT RESUME ID
    // ========================================================

    const foundResId =
      data?.id ||
      data?.resume_id ||
      data?.resumeId ||
      data?.res_id ||
      data?.Rid ||
      data?.data?.id ||
      data?.data?.resume_id ||
      data?.data?.resumeId ||
      data?.data?.res_id ||
      data?.data?.Rid ||
      data?.apiResponse?.data?.res_id ||
      data?.apiResponse?.data?.Rid;

    if (foundResId) {

      setResumeId(
        foundResId
      );
    }

    // ========================================================
    // EXTRACT DOWNLOAD URL
    // ========================================================

    const foundDownloadUrl =
      data?.downloadUrl ||
      data?.download_url ||
      data?.data?.downloadUrl ||
      data?.data?.download_url ||
      data?.apiResponse?.data?.download_url ||
      data?.apiResponse?.download_url;

    if (foundDownloadUrl) {

      setDownloadUrl(
        foundDownloadUrl
      );
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  const fetchResumeData = async () => {
    const storedResumeId =
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id");

    if (!storedResumeId) {
      console.log("No resume_id found");
      return null;
    }

    try {
      setIsLoading(true);

      console.log(
        "Fetching resume:",
        storedResumeId
      );

      const response =
        await resumeService.getParsedResume(
          storedResumeId
        );

      console.log(
        "Parsed resume response:",
        response
      );

      const parsedData =
        response?.data;

      if (!parsedData) {
        console.warn(
          "No parsed resume data found"
        );
        return null;
      }

      // Save complete parsed resume
      setResumeData(parsedData);

      // Extract skills
      if (Array.isArray(parsedData.skills)) {

        const skills =
          parsedData.skills.flatMap(
            (category) =>
              Array.isArray(category?.skills)
                ? category.skills
                : []
          );

        setExtractedSkills(skills);
      } else {
        setExtractedSkills([]);
      }

      // Extract job title
      const jobTitle =
        parsedData?.experience?.[0]?.role ||
        "";

      setTargetJobTitle(jobTitle);

      // Save resume ID
      setResumeIdState(
        storedResumeId
      );

      return parsedData;

    } catch (error) {

      console.error(
        "FETCH RESUME DATA ERROR:",
        error
      );

      return null;

    } finally {

      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
  value={{
    isLoading,
    setIsLoading,

    resumeData,
    setResumeData,

    extractedSkills,

    targetJobTitle,

    resumeId,
    setResumeId,

    downloadUrl,
    setDownloadUrl,

    setResumeState,

    fetchResumeData,
  }}
>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// USE APP
// ============================================================

export function useApp() {

  const context =
    useContext(AppContext);

  if (!context) {

    throw new Error(
      "useApp must be used within an AppProvider"
    );
  }

  return context;
}

export default AppContext;