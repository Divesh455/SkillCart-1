import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Briefcase, Sparkles, BookmarkCheck, LogOut, User } from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "HOME", path: "/home", icon: Home },
    { label: "JOBS", path: "/jobs", icon: Briefcase },
    { label: "FOR YOU", path: "/for-you", icon: Sparkles, badge: "AI" },
    { label: "SAVED JOBS", path: "/for-you?view=saved", icon: BookmarkCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* ── TOP HEADER BAR (Desktop & Mobile) ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-[#dfe7e2]/90 shadow-2xs font-sans"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-17 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center shrink-0 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <Logo />
          </motion.div>

          {/* Center: Main Desktop Navigation Tabs (HOME, JOBS, FOR YOU, SAVED JOBS) */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2 bg-[#f7faf8] p-1.5 rounded-2xl border border-[#dfe7e2]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSavedTab = item.path.includes("view=saved");
              const isActive = isSavedTab
                ? location.search.includes("view=saved")
                : (location.pathname === item.path && !location.search.includes("view=saved")) ||
                  (item.path === "/for-you" && location.pathname === "/foryou" && !location.search.includes("view=saved"));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold tracking-wide transition-colors shrink-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPillDesktop"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#123c2c] to-[#19714e] rounded-xl shadow-md shadow-[#123c2c]/15"
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-white" : "text-[#68756f] hover:text-[#12221d]"}`}>
                    <Icon size={16} strokeWidth={isActive ? 2.4 : 1.9} className={isActive ? "text-[#b9ef84]" : ""} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                        isActive ? "bg-[#b9ef84] text-[#123c2c]" : "bg-[#dff8eb] text-[#19714e]"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Profile Controls & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 pl-2 border-l border-[#dfe7e2]">
              <motion.div
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate("/resume")}
                title="View Profile / Resume"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-[#f7faf8] hover:bg-[#dff8eb] border border-[#dfe7e2] cursor-pointer transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center font-bold text-xs shadow-xs font-['Space_Grotesk'] shrink-0">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span className="hidden md:inline-block text-xs font-bold text-[#12221d]">
                  {user?.username || "Account"}
                </span>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1, color: "#dc2626" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-[#68756f] hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
              >
                <LogOut size={17} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── BOTTOM MOBILE NAVIGATION BAR (Mobile Screens < 640px) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#dfe7e2] px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSavedTab = item.path.includes("view=saved");
          const isActive = isSavedTab
            ? location.search.includes("view=saved")
            : (location.pathname === item.path && !location.search.includes("view=saved")) ||
              (item.path === "/for-you" && location.pathname === "/foryou" && !location.search.includes("view=saved"));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 px-2.5 py-1 rounded-2xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-[#19714e]"
                  : "text-[#68756f] hover:text-[#12221d]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavPillMobile"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 bg-[#dff8eb] rounded-2xl border border-[#19714e]/20"
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-1">
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#19714e]" : "text-[#68756f]"} />
                <span>{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
