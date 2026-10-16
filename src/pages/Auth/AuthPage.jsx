import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  FileText,
  KeyRound,
  RotateCw,
  Send,
  Edit3,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, resumeId } = useAuth();

  // Mode toggle: true = Login, false = Register
  const [isLogin, setIsLogin] = useState(true);

  // Form input state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP State for Registration
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", ""]);
  const otpInputsRef = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Popup Toast Notification State
  const [popup, setPopup] = useState(null); // { type: "success" | "error", message: string }
  const popupTimeoutRef = useRef(null);

  const showPopup = (type, message) => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    setPopup({ type, message });
    popupTimeoutRef.current = setTimeout(() => {
      setPopup(null);
    }, 4500);
  };

  // Countdown timer for re-sending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Handle form mode switch
  const handleToggleMode = (mode) => {
    if (mode === isLogin) return;
    setIsLogin(mode);
    setErrors({});
    setApiError("");
    setApiSuccess("");
    setOtpSent(false);
    setOtp("");
    setOtpDigits(["", "", "", "", ""]);
    setResendTimer(0);
    setOtpError("");
    setOtpSuccess("");
    setIsOtpVerified(false);
    setPopup(null);
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
    if (apiSuccess) setApiSuccess("");

    // If email or password is changed after OTP verification, reset verification
    if (!isLogin && (name === "email" || name === "password")) {
      if (isOtpVerified) {
        setIsOtpVerified(false);
        setOtpSuccess("");
      }
      if (otpSent && name === "email") {
        setOtpSent(false);
        setOtp("");
        setOtpError("");
      }
    }
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    setApiError("");
    setApiSuccess("");
    setOtpError("");
    setOtpSuccess("");

    // Validate fields before sending OTP
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 2) {
      newErrors.username = "Username must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await authService.sendOtp({ email: formData.email.trim() });
      const msg =
        response?.message ||
        response?.msg ||
        "OTP sent successfully. Please check your email.";
      setOtpSuccess(msg);
      setOtpSent(true);
      setOtp("");
      setOtpDigits(["", "", "", "", ""]);
      setResendTimer(45); // 45s resend cooldown
      setIsOtpVerified(false);

      // Popup success notification on successful request
      showPopup("success", msg);

      // Focus first digit box after OTP is sent
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err) {
      const errMsg =
        err?.data?.message ||
        err?.message ||
        "Unable to send OTP request. Please check your connection and try again.";
      setOtpError(errMsg);
      // Popup error notification if unable to complete request
      showPopup("error", errMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Auto-verify OTP handler
  const handleVerifyOtp = async (codeToVerify) => {
    const code = (codeToVerify || otpDigits.join("")).trim();
    if (!code || code.length !== 5) return;

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const response = await authService.verifyOtp({
        email: formData.email.trim(),
        otp: code,
      });

      // Backend returns boolean true or object with success/status true
      const isSuccess =
        response === true ||
        response?.success === true ||
        response?.success === "true" ||
        response?.status === true ||
        response?.status === "true" ||
        response?.verified === true;

      if (isSuccess) {
        setIsOtpVerified(true);
        setOtpError("");
        const successMsg = "OTP verified successfully! You can now create your account.";
        setOtpSuccess(successMsg);
        showPopup("success", successMsg);
      } else {
        setIsOtpVerified(false);
        const errMsg =
          response?.message ||
          response?.msg ||
          "Invalid OTP. Please check the code and try again.";
        setOtpError(errMsg);
        showPopup("error", errMsg);
      }
    } catch (err) {
      setIsOtpVerified(false);
      const errMsg =
        err?.data?.message ||
        err?.message ||
        "Invalid OTP. Please check the code and try again.";
      setOtpError(errMsg);
      showPopup("error", errMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Individual digit change handler
  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      setOtp(newDigits.join(""));
      setOtpError("");
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    const fullCode = newDigits.join("");
    setOtp(fullCode);
    setOtpError("");

    // Auto-advance to next box (for 5 digits: index 0 to 4)
    if (index < 4) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify if all 5 digits entered
    if (fullCode.length === 5 && !newDigits.includes("")) {
      handleVerifyOtp(fullCode);
    }
  };

  // Backspace navigation handler
  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  // Paste full OTP handler
  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!pastedData) return;

    const newDigits = ["", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    const fullCode = newDigits.join("");
    setOtp(fullCode);
    setOtpError("");

    const targetIdx = Math.min(pastedData.length, 4);
    otpInputsRef.current[targetIdx]?.focus();

    if (fullCode.length === 5) {
      handleVerifyOtp(fullCode);
    }
  };

  // Client validation
  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!isLogin && formData.username.trim().length < 2) {
      newErrors.username = "Username must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to extract actual error reason
  const getAuthErrorMessage = (err, isLoginMode) => {
    if (!err) {
      return isLoginMode
        ? "Failed to log in. Please check your credentials."
        : "Failed to register. Please check your details.";
    }

    // 1. Check data payload message/error/detail
    const dataMsg =
      err?.data?.message ||
      err?.data?.error ||
      err?.data?.detail ||
      err?.data?.msg ||
      err?.data?.description;

    if (typeof dataMsg === "string" && dataMsg.trim()) {
      const trimmed = dataMsg.trim();
      if (!trimmed.toLowerCase().includes("failed to fetch")) {
        return trimmed;
      }
    }

    // 2. Check err.message
    if (typeof err.message === "string" && err.message.trim()) {
      const trimmed = err.message.trim();
      if (
        trimmed.toLowerCase().includes("failed to fetch") ||
        trimmed.toLowerCase().includes("networkerror") ||
        trimmed.toLowerCase().includes("load failed")
      ) {
        return "Unable to connect to the authentication server. Please check your internet connection or try again.";
      }
      return trimmed;
    }

    // 3. Fallback based on HTTP status code
    if (err.status === 400) return "Invalid request. Please check your entered details.";
    if (err.status === 401) return "Incorrect email or password. Please verify your credentials.";
    if (err.status === 403) return "Access denied. Account may already exist or credentials invalid.";
    if (err.status === 404) return "No account found with this email address.";
    if (err.status === 409) return "An account with this email or username already exists.";
    if (err.status === 422) return "Validation error. Please verify your email and password format.";
    if (err.status >= 500) return "Authentication server encountered an issue. Please try again shortly.";

    return isLoginMode
      ? "Failed to log in. Please check your credentials."
      : "Failed to register. Please try again.";
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const response = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        // Check user object from response for valid resumeId
        const userObj = response?.user;
        const userResumeId =
          userObj?.resumeId ||
          userObj?.resume_id ||
          userObj?.res_id ||
          userObj?.Rid ||
          userObj?.rid ||
          response?.resumeId ||
          response?.res_id ||
          response?.Rid ||
          response?.rid;

        const hasValidResumeId = Boolean(
          userResumeId &&
          userResumeId !== "null" &&
          userResumeId !== "undefined" &&
          String(userResumeId).trim() !== ""
        );

        if (!hasValidResumeId) {
          navigate("/resume");
        } else {
          navigate("/home");
        }
      } else {
        try {
          await register({
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
          });

          localStorage.setItem("justRegistered", "true");
          localStorage.setItem("isNewUser", "true");

          try {
            await login({
              email: formData.email.trim(),
              password: formData.password,
            });
          } catch (loginErr) {
            console.warn("Auto-login post registration error:", loginErr);
          }

          // Redirect user directly to /resume on successful registration
          navigate("/resume");
        } catch (err) {
          if (err.status === 403) {
            localStorage.setItem("justRegistered", "true");
            setIsLogin(true);
            setApiSuccess("Account already exists. Please sign in with your credentials.");
          } else if (err.status === 409) {
            setApiError(getAuthErrorMessage(err, false) || "Email or username already exists.");
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      setApiError(getAuthErrorMessage(err, isLogin));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#12221d] flex flex-col justify-between relative overflow-x-hidden scrollbar-none font-sans selection:bg-[#dff8eb] selection:text-[#19714e]">
      {/* Floating Popup Notification Toast */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none"
          >
            <div
              className={`p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 pointer-events-auto backdrop-blur-md ${
                popup.type === "success"
                  ? "bg-[#123c2c] text-white border-[#19714e]/40 shadow-[#123c2c]/20"
                  : "bg-red-900 text-white border-red-700/50 shadow-red-950/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    popup.type === "success"
                      ? "bg-[#b9ef84] text-[#123c2c]"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {popup.type === "success" ? (
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  ) : (
                    <AlertCircle size={16} strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-xs font-medium leading-relaxed">{popup.message}</div>
              </div>
              <button
                type="button"
                onClick={() => setPopup(null)}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-md shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Background Glows matching landing page */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#dff8eb] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-[#b9ef84]/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-5 py-3 sm:py-4 flex items-center justify-between z-10 shrink-0">
        <Logo />
        <Link
          to="/"
          className="text-xs font-semibold text-[#52615a] hover:text-[#19714e] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dfe7e2]/60 bg-white/70 backdrop-blur-xs"
        >
          ← Back to site
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-2 sm:py-4 z-10">
        <div className="w-full max-w-4xl bg-white border border-[#dfe7e2] shadow-xl shadow-[#123c2c]/5 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[520px]">
          
          {/* Left Branding Column (Visible on md+) */}
          <div className="hidden md:flex md:col-span-5 bg-[#123c2c] text-white p-6 lg:p-8 flex-col justify-between relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#b9ef84]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#19714e]/40 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#b9ef84] text-xs font-medium backdrop-blur-xs mb-4 border border-white/10">
                <Sparkles size={14} /> AI Career Copilot
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] leading-tight tracking-tight text-white mb-3">
                Make your next move <span className="text-[#b9ef84] italic">remarkable.</span>
              </h2>
              <p className="text-white/75 text-xs sm:text-sm leading-relaxed mb-4">
                Join thousands of ambitious professionals using AI tools to analyze resumes, optimize applications, and ace interviews.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="relative z-10 space-y-2.5 my-auto py-3 border-y border-white/10">
              <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                <div className="w-5.5 h-5.5 rounded-lg bg-[#b9ef84]/20 text-[#b9ef84] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} />
                </div>
                <span>ATS Resume Parsing & Score Checker</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                <div className="w-5.5 h-5.5 rounded-lg bg-[#b9ef84]/20 text-[#b9ef84] flex items-center justify-center shrink-0">
                  <Zap size={13} />
                </div>
                <span>Smart Match Confidence Engine</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                <div className="w-5.5 h-5.5 rounded-lg bg-[#b9ef84]/20 text-[#b9ef84] flex items-center justify-center shrink-0">
                  <ShieldCheck size={13} />
                </div>
                <span>AI Interview Practice & Feedback</span>
              </div>
            </div>

            {/* Bottom Proof */}
            <div className="relative z-10 pt-3 flex items-center gap-3 text-xs text-white/70">
              <div className="flex -space-x-2">
                <span className="w-6.5 h-6.5 rounded-full bg-[#19714e] border-2 border-[#123c2c] flex items-center justify-center text-[9px] font-bold text-white">SR</span>
                <span className="w-6.5 h-6.5 rounded-full bg-[#b9ef84] border-2 border-[#123c2c] flex items-center justify-center text-[9px] font-bold text-[#123c2c]">DC</span>
                <span className="w-6.5 h-6.5 rounded-full bg-white/20 border-2 border-[#123c2c] flex items-center justify-center text-[9px] font-bold text-white">+</span>
              </div>
              <span className="text-[11px]">12,000+ career moves made</span>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="col-span-1 md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-center bg-white">
            
            {/* Top Toggle Pills */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="bg-[#f7faf8] p-1 rounded-xl border border-[#dfe7e2] flex gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className={`px-4 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    isLogin
                      ? "bg-white text-[#123c2c] shadow-xs"
                      : "text-[#68756f] hover:text-[#12221d]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className={`px-4 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    !isLogin
                      ? "bg-white text-[#123c2c] shadow-xs"
                      : "text-[#68756f] hover:text-[#12221d]"
                  }`}
                >
                  Register
                </button>
              </div>

              <span className="text-xs text-[#68756f] hidden sm:inline">
                {isLogin ? "New here?" : "Have an account?"}{" "}
                <button
                  onClick={() => handleToggleMode(!isLogin)}
                  className="font-semibold text-[#19714e] hover:underline cursor-pointer"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-xs text-[#68756f] mt-0.5">
                {isLogin
                  ? "Enter your credentials to access your workspace."
                  : "Start building your AI-enhanced profile today."}
              </p>
            </div>

            {/* API Error Notification */}
            <AnimatePresence mode="wait">
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* API Success Notification */}
            <AnimatePresence mode="wait">
              {apiSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-5 p-3.5 rounded-xl bg-[#dff8eb] border border-[#19714e]/30 flex items-start gap-2.5 text-xs text-[#19714e]"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#19714e]" />
                  <span>{apiSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Resume ID Indicator */}
            {/* <AnimatePresence>
              {resumeId && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-5 p-3 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] flex items-center justify-between text-xs text-[#12221d]"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FileText size={16} className="text-[#19714e]" />
                    <span>Resume ID: <strong className="font-bold text-[#19714e]">#{resumeId}</strong></span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#dff8eb] text-[#19714e] font-semibold border border-[#19714e]/20">
                    Fetched & Active
                  </span>
                </motion.div>
              )}
            </AnimatePresence> */}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login-fields" : "register-fields"}
                  initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <Input
                      label="Username"
                      id="username"
                      type="text"
                      placeholder="e.g. alexmorgan"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      icon={User}
                      required
                    />
                  )}

                  <Input
                    label="Email address"
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                    required
                  />

                  <div>
                    <Input
                      label="Password"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      icon={Lock}
                      required
                    />
                    {isLogin && (
                      <div className="flex justify-end mt-1.5">
                        <a
                          href="#forgot"
                          onClick={(e) => e.preventDefault()}
                          className="text-xs text-[#68756f] hover:text-[#19714e] transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* In Register mode: Show Get OTP button, or OTP input field + Resend link */}
              {!isLogin && (
                <div className="space-y-3 pt-1">
                  {/* If OTP is not sent yet, show Get OTP button */}
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full mt-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#123c2c] to-[#19714e] hover:from-[#19714e] hover:to-[#123c2c] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#123c2c]/15 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-[#b9ef84]" />
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} className="text-[#b9ef84]" />
                          <span>Get OTP</span>
                          <ArrowRight size={16} strokeWidth={2.2} />
                        </>
                      )}
                    </button>
                  )}

                  {/* If OTP was sent and not yet verified: Show Enhanced OTP Card */}
                  {otpSent && !isOtpVerified && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-[#dfe7e2] bg-[#f7faf8]/80 p-4 sm:p-5 shadow-xs space-y-3.5 backdrop-blur-xs"
                    >
                      {/* Header with Email badge & edit */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#dfe7e2]/70">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#19714e]/10 text-[#19714e] flex items-center justify-center">
                            <KeyRound size={15} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#12221d] tracking-tight">Enter Security Code</p>
                            <p className="text-[11px] text-[#68756f] truncate max-w-[190px] sm:max-w-[240px]">
                              Sent to <span className="font-semibold text-[#12221d]">{formData.email}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setOtpDigits(["", "", "", "", ""]);
                            setOtpError("");
                            setOtpSuccess("");
                          }}
                          className="text-[11px] font-medium text-[#19714e] hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/80 transition-colors cursor-pointer"
                          title="Change email address"
                        >
                          <Edit3 size={11} /> Change
                        </button>
                      </div>

                      {/* Status feedback alerts inside the card */}
                      <AnimatePresence mode="wait">
                        {otpError && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="p-2.5 rounded-xl bg-red-50 border border-red-200/90 flex items-center gap-2 text-xs text-red-700"
                          >
                            <AlertCircle size={14} className="shrink-0 text-red-500" />
                            <span className="font-medium">{otpError}</span>
                          </motion.div>
                        )}
                        {!otpError && otpSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="p-2.5 rounded-xl bg-[#dff8eb] border border-[#19714e]/30 flex items-center gap-2 text-xs text-[#19714e]"
                          >
                            <CheckCircle2 size={14} className="shrink-0 text-[#19714e]" />
                            <span className="font-medium">{otpSuccess}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 5 Digit Input Boxes */}
                      <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 pt-1" onPaste={handleDigitPaste}>
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpInputsRef.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="\d{1}"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleDigitKeyDown(index, e)}
                            disabled={isVerifyingOtp}
                            aria-label={`OTP Digit ${index + 1}`}
                            className={`w-12 sm:w-14 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl transition-all duration-200 outline-none shadow-xs ${
                              digit
                                ? "border-[#19714e] bg-white text-[#123c2c] ring-2 ring-[#19714e]/20"
                                : otpError
                                ? "border-red-400 bg-white text-red-700 focus:ring-2 focus:ring-red-400/20"
                                : "border-[#dfe7e2] bg-white text-[#12221d] hover:border-[#19714e]/50 focus:border-[#19714e] focus:ring-2 focus:ring-[#19714e]/20"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Verify Button & Spinner */}
                      <button
                        type="button"
                        onClick={() => handleVerifyOtp(otpDigits.join(""))}
                        disabled={isVerifyingOtp || otpDigits.join("").length !== 5}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 size={15} className="animate-spin text-[#b9ef84]" />
                            <span>Verifying Code...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} className="text-[#b9ef84]" />
                            <span>Verify Code</span>
                          </>
                        )}
                      </button>

                      {/* Resend Link with Countdown Timer */}
                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-[#68756f]">Didn't get code?</span>
                        {resendTimer > 0 ? (
                          <span className="text-[11px] text-[#68756f] font-medium bg-white px-2.5 py-1 rounded-full border border-[#dfe7e2]">
                            Resend in <span className="font-bold text-[#123c2c]">{resendTimer}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className="font-semibold text-[#19714e] hover:text-[#123c2c] hover:underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer text-xs"
                          >
                            {isSendingOtp ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <RotateCw size={12} />
                                <span>Re-send OTP</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Once OTP is verified: Success Card */}
                  {otpSent && isOtpVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-[#dff8eb] to-[#eafff4] border border-[#19714e]/30 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#19714e] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#123c2c]">Email Verified</p>
                          <p className="text-[11px] text-[#19714e]">{formData.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-[11px] font-semibold text-[#19714e] hover:text-[#123c2c] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        title="Resend code if needed"
                      >
                        <RotateCw size={11} /> Re-send
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Submit Button: Always shown in Login mode; in Register mode, only shown when OTP response is verified (true) */}
              {(isLogin || isOtpVerified) && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-[#123c2c]/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight size={16} strokeWidth={2.2} />
                    </>
                  )}
                </button>
              )}
            </form>

            {/* Bottom Mobile Toggle */}
            <div className="mt-6 text-center sm:hidden">
              <span className="text-xs text-[#68756f]">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => handleToggleMode(!isLogin)}
                  className="font-semibold text-[#19714e]"
                >
                  {isLogin ? "Register" : "Sign in"}
                </button>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-2.5 text-center text-[11px] text-[#68756f] z-10 shrink-0">
        © 2026 SkillCart, Inc. All rights reserved.
      </footer>
    </div>
  );
}
