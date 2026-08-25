import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  FileCheck2,
  Gauge,
  MessageSquareText,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";
import { fadeUp } from "../../utils/animations";

export default function DashboardPreview() {
  return (
    <motion.div variants={fadeUp} className="dashboard-wrap">
      <div className="dashboard-shadow" />
      <div className="dashboard-card border border-[#dfe7e2] shadow-2xl rounded-2xl overflow-hidden">
        <div className="dashboard-topbar bg-[#fafcfb] border-b border-[#dfe7e2] px-4 py-2.5 flex items-center justify-between">
          <div className="window-dots flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            <i className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <i className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div className="preview-url font-mono text-[10px] bg-white border border-[#dfe7e2] px-4 py-1 rounded-full text-[#68756f]">
            app.skillcart.ai / overview
          </div>
          <div className="p-1 rounded-lg bg-emerald-50 text-[#19714e]">
            <Bell size={14} />
          </div>
        </div>
        <div className="dashboard-content bg-white">
          <aside className="preview-sidebar bg-[#f7faf8] border-r border-[#dfe7e2] p-4">
            <div className="mini-brand mb-6 flex items-center gap-2">
              <span className="logo-mark w-6 h-6 rounded-lg bg-[#123c2c] text-[#b9ef84] flex items-center justify-center font-bold text-xs">
                S
              </span>
              <span className="font-['Space_Grotesk'] font-bold text-xs text-[#12221d]">SkillCart</span>
            </div>
            <div className="side-nav active bg-[#dff8eb] text-[#19714e] font-bold p-2 rounded-xl flex items-center gap-2 text-xs mb-1.5">
              <BarChart3 size={15} /> Overview
            </div>
            <div className="side-nav text-[#68756f] hover:text-[#12221d] p-2 rounded-xl flex items-center gap-2 text-xs mb-1.5 cursor-pointer">
              <FileCheck2 size={15} /> Resume Builder
            </div>
            <div className="side-nav text-[#68756f] hover:text-[#12221d] p-2 rounded-xl flex items-center gap-2 text-xs mb-1.5 cursor-pointer">
              <BriefcaseBusiness size={15} /> Live Jobs
            </div>
            <div className="side-nav text-[#68756f] hover:text-[#12221d] p-2 rounded-xl flex items-center gap-2 text-xs mb-1.5 cursor-pointer">
              <MessageSquareText size={15} /> Community
            </div>
            <div className="sidebar-bottom mt-24 pt-4 border-t border-[#dfe7e2] flex items-center gap-2 text-xs">
              <div className="avatar w-7 h-7 rounded-xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-white font-bold flex items-center justify-center text-[10px]">
                AM
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#12221d] text-[11px] leading-tight">Alex Morgan</span>
                <span className="text-[9px] text-[#19714e] font-semibold">Verified Pro</span>
              </div>
            </div>
          </aside>
          <main className="preview-main p-5 flex-1">
            <div className="preview-header flex items-center justify-between mb-5">
              <div>
                <div className="preview-kicker font-mono text-[9px] text-[#68756f] uppercase tracking-wider">
                  MONDAY, OCTOBER 21
                </div>
                <h4 className="text-xl font-bold font-['Space_Grotesk'] text-[#12221d] leading-tight">
                  Good morning, Alex <span className="text-amber-500">✦</span>
                </h4>
              </div>
              <div className="preview-status text-xs font-bold text-[#19714e] bg-[#dff8eb] border border-[#19714e]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#19714e] animate-pulse" /> Profile Match: 88%
              </div>
            </div>
            <div className="stat-row grid grid-cols-3 gap-3 mb-4">
              <div className="stat-box stat-featured bg-gradient-to-br from-[#dff8eb]/60 to-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <div className="stat-label text-[10px] font-bold text-emerald-800 uppercase">ATS Resume score</div>
                <div className="score-number font-['Space_Grotesk'] font-extrabold text-2xl text-[#123c2c] my-1">
                  88<span className="text-xs text-[#68756f] font-mono">/100</span>
                </div>
                <div className="progress w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden mb-2">
                  <div className="w-[88%] h-full bg-[#19714e] rounded-full" />
                </div>
                <div className="stat-foot text-[10px] font-bold text-[#19714e] flex items-center justify-between">
                  <span>↑ +14 pts this week</span>
                  <Gauge size={14} />
                </div>
              </div>
              <div className="stat-box bg-[#f7faf8] border border-[#dfe7e2] p-3.5 rounded-2xl">
                <div className="stat-label text-[10px] font-bold text-[#68756f] uppercase">AI Job matches</div>
                <div className="stat-value font-['Space_Grotesk'] font-extrabold text-2xl text-[#12221d] my-1">
                  24
                </div>
                <div className="stat-foot text-[10px] text-[#68756f] flex items-center justify-between">
                  <span className="font-semibold text-teal-700">8 new this week</span>
                  <Target size={14} className="text-teal-600" />
                </div>
              </div>
              <div className="stat-box bg-[#f7faf8] border border-[#dfe7e2] p-3.5 rounded-2xl">
                <div className="stat-label text-[10px] font-bold text-[#68756f] uppercase">Practice streak</div>
                <div className="stat-value font-['Space_Grotesk'] font-extrabold text-2xl text-[#12221d] my-1">
                  06 <small className="text-xs text-[#68756f] font-normal">days</small>
                </div>
                <div className="stat-foot text-[10px] text-[#68756f] flex items-center justify-between">
                  <span className="font-semibold text-amber-600">Keep it going</span>
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
            </div>
            <div className="preview-grid grid grid-cols-12 gap-3">
              <div className="chart-box col-span-7 bg-white border border-[#dfe7e2] p-4 rounded-2xl">
                <div className="box-title text-xs font-bold text-[#12221d] flex items-center justify-between mb-3">
                  <span>Application activity</span>
                  <span className="text-[10px] font-normal text-[#68756f] bg-[#f7faf8] px-2 py-0.5 rounded-md border border-[#dfe7e2] flex items-center gap-1">
                    Last 30 days <ChevronDown size={12} />
                  </span>
                </div>
                <div className="chart flex items-end h-24 gap-2 pt-4">
                  <div className="chart-lines flex-1 relative h-full">
                    <svg viewBox="0 0 320 100" preserveAspectRatio="none" className="w-full h-full text-[#19714e]">
                      <path
                        d="M0,86 C25,80 33,72 52,76 S85,64 103,68 S126,32 148,47 S178,62 196,44 S223,51 240,30 S269,24 288,35 S305,10 320,14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="jobs-box col-span-5 bg-[#f7faf8] border border-[#dfe7e2] p-4 rounded-2xl space-y-2.5">
                <div className="box-title text-xs font-bold text-[#12221d] flex items-center justify-between">
                  <span>Top matches</span>
                  <span className="text-[10px] font-bold text-[#19714e] flex items-center gap-0.5 cursor-pointer">
                    View all <ArrowRight size={10} />
                  </span>
                </div>
                <div className="job-item flex items-center gap-2 p-2 rounded-xl bg-white border border-[#dfe7e2]/70 text-xs">
                  <div className="company-logo bg-purple-600 text-white font-bold w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">F</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-[#12221d] block text-[11px] truncate">Product Designer</strong>
                    <small className="text-[#68756f] text-[9px] block">Figma · Remote</small>
                  </div>
                  <span className="font-bold text-[#19714e] bg-[#dff8eb] text-[10px] px-1.5 py-0.5 rounded-md">96%</span>
                </div>
                <div className="job-item flex items-center gap-2 p-2 rounded-xl bg-white border border-[#dfe7e2]/70 text-xs">
                  <div className="company-logo bg-blue-600 text-white font-bold w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">N</div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-[#12221d] block text-[11px] truncate">UX Researcher</strong>
                    <small className="text-[#68756f] text-[9px] block">Notion · NY</small>
                  </div>
                  <span className="font-bold text-[#19714e] bg-[#dff8eb] text-[10px] px-1.5 py-0.5 rounded-md">91%</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="float-card score-float bg-white/95 backdrop-blur-md border border-[#dff8eb] shadow-xl p-3 rounded-2xl flex items-center gap-3"
      >
        <div className="float-icon w-8 h-8 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center font-bold">
          <Check size={16} />
        </div>
        <div>
          <strong className="text-xs text-[#12221d] block font-['Space_Grotesk']">ATS score improved</strong>
          <span className="text-[10px] text-[#19714e] font-bold">+14 points this week</span>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 4.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="float-card match-float bg-white/95 backdrop-blur-md border border-indigo-100 shadow-xl p-3 rounded-2xl flex items-center gap-3"
      >
        <div className="match-avatars flex -space-x-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white">A</span>
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white">B</span>
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white">C</span>
        </div>
        <div>
          <strong className="text-xs text-[#12221d] block font-['Space_Grotesk']">24 AI Matches</strong>
          <span className="text-[10px] text-[#19714e] font-bold">Waiting for you</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
