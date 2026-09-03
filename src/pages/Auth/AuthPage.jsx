import { useState } from "react";
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
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
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

  // Handle form mode switch
  const handleToggleMode = (mode) => {
    if (mode === isLogin) return;
    setIsLogin(mode);
    setErrors({});
    setApiError("");
    setApiSuccess("");
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
    <div className="min-h-screen bg-[#f7faf8] text-[#12221d] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#dff8eb] selection:text-[#19714e]">
      {/* Subtle Background Glows matching landing page */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#dff8eb] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-[#b9ef84]/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Logo />
        <Link
          to="/"
          className="text-xs font-semibold text-[#52615a] hover:text-[#19714e] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dfe7e2]/60 bg-white/70 backdrop-blur-xs"
        >
          ← Back to site
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-4xl bg-white border border-[#dfe7e2] shadow-xl shadow-[#123c2c]/5 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* Left Branding Column (Visible on md+) */}
          <div className="hidden md:flex md:col-span-5 bg-[#123c2c] text-white p-8 md:p-10 flex-col justify-between relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#b9ef84]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#19714e]/40 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#b9ef84] text-xs font-medium backdrop-blur-xs mb-6 border border-white/10">
                <Sparkles size={14} /> AI Career Copilot
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] leading-tight tracking-tight text-white mb-4">
                Make your next move <span className="text-[#b9ef84] italic">remarkable.</span>
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-8">
                Join thousands of ambitious professionals using AI tools to analyze resumes, optimize applications, and ace interviews.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="relative z-10 space-y-3.5 my-auto py-4 border-y border-white/10">
              <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                <div className="w-6 h-6 rounded-lg bg-[#b9ef84]/20 text-[#b9ef84] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>ATS Resume Parsing & Score Checker</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                <div className="w-6 h-6 rounded-lg bg-[#b9ef84]/20 text-[#b9ef84] flex items-center justify-center shrink-0">
                  <Zap size={14} />
                </div>
                <span>Smart Match Confidence Engine</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                <div className="w-6 h-6 rounded-lg bg-[#b9ef84]/20 text-[#b9ef84] flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <span>AI Interview Practice & Feedback</span>
              </div>
            </div>

            {/* Bottom Proof */}
            <div className="relative z-10 pt-4 flex items-center gap-3 text-xs text-white/70">
              <div className="flex -space-x-2">
                <span className="w-7 h-7 rounded-full bg-[#19714e] border-2 border-[#123c2c] flex items-center justify-center text-[10px] font-bold text-white">SR</span>
                <span className="w-7 h-7 rounded-full bg-[#b9ef84] border-2 border-[#123c2c] flex items-center justify-center text-[10px] font-bold text-[#123c2c]">DC</span>
                <span className="w-7 h-7 rounded-full bg-white/20 border-2 border-[#123c2c] flex items-center justify-center text-[10px] font-bold text-white">+</span>
              </div>
              <span>12,000+ career moves made</span>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            {/* Top Toggle Pills */}
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#f7faf8] p-1 rounded-xl border border-[#dfe7e2] flex gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className={`px-5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
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
                  className={`px-5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
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
                  className="font-semibold text-[#19714e] hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-xs text-[#68756f] mt-1">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-[#123c2c]/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#68756f] z-10">
        © 2026 SkillCart, Inc. All rights reserved.
      </footer>
    </div>
  );
}
