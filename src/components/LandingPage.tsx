import React from 'react';
import {
  HeartPulse,
  Flame,
  Shield,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { EmergencyType, EmergencyReport } from '../types';
import { AnimeGrassBackground } from './AnimeGrassBackground';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onSelectCategory: (category: EmergencyType) => void;
  onOpenAuth: () => void;
}

// Minimalist Botanical Sage Leaf SVG Variants
const SlenderLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 36 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M18 2C9 16 3 32 9 48C12 55 18 62 18 62C18 62 24 55 27 48C33 32 27 16 18 2Z"
      fill="currentColor"
    />
    <path
      d="M18 10V56"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.45"
    />
    <path
      d="M18 24C14 27 12 30 11 32"
      stroke="#ffffff"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeOpacity="0.35"
    />
    <path
      d="M18 34C22 37 24 40 25 42"
      stroke="#ffffff"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeOpacity="0.35"
    />
  </svg>
);

const OvalLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 44 58" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M22 2C11 12 5 27 10 42C13 49 22 56 22 56C22 56 31 49 34 42C39 27 33 12 22 2Z"
      fill="currentColor"
    />
    <path
      d="M22 8V50"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.45"
    />
    <path
      d="M22 22C17 25 14 28 13 31"
      stroke="#ffffff"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeOpacity="0.35"
    />
    <path
      d="M22 32C27 35 30 38 31 41"
      stroke="#ffffff"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeOpacity="0.35"
    />
  </svg>
);

const TwinLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 54 62" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M27 32C19 28 10 32 7 40C5 45 9 52 14 53C20 54 25 47 27 32Z"
      fill="currentColor"
    />
    <path
      d="M27 32C33 22 43 19 49 25C53 29 51 37 46 41C40 45 32 41 27 32Z"
      fill="currentColor"
    />
    <path
      d="M27 60C27 48 27 32 27 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
  </svg>
);

// 8 Ambient Botanical Leaves positioned on the outer periphery
const AMBIENT_SAGE_LEAVES = [
  {
    id: 'leaf-1',
    Component: SlenderLeafIcon,
    className: 'top-[6%] left-[3%] w-8 h-14 text-[#2E7D6B] animate-leaf-sway-left',
    style: { opacity: 0.14, animationDelay: '0s', transform: 'rotate(18deg)' },
  },
  {
    id: 'leaf-2',
    Component: OvalLeafIcon,
    className: 'top-[22%] left-[8%] w-9 h-13 text-[#10B981] animate-leaf-sway-right',
    style: { opacity: 0.18, animationDelay: '3.5s', transform: 'rotate(-24deg)' },
  },
  {
    id: 'leaf-3',
    Component: TwinLeafIcon,
    className: 'top-[56%] left-[4%] w-10 h-14 text-[#2E7D6B] animate-leaf-sway-left',
    style: { opacity: 0.16, animationDelay: '6s', transform: 'rotate(32deg)' },
  },
  {
    id: 'leaf-4',
    Component: SlenderLeafIcon,
    className: 'bottom-[9%] left-[9%] w-8 h-13 text-[#10B981] animate-leaf-sway-right',
    style: { opacity: 0.20, animationDelay: '1.8s', transform: 'rotate(-14deg)' },
  },
  {
    id: 'leaf-5',
    Component: OvalLeafIcon,
    className: 'top-[8%] right-[4%] w-9 h-14 text-[#2E7D6B] animate-leaf-sway-right',
    style: { opacity: 0.15, animationDelay: '4.2s', transform: 'rotate(-28deg)' },
  },
  {
    id: 'leaf-6',
    Component: SlenderLeafIcon,
    className: 'top-[28%] right-[7%] w-7 h-12 text-[#10B981] animate-leaf-sway-left',
    style: { opacity: 0.19, animationDelay: '7.5s', transform: 'rotate(16deg)' },
  },
  {
    id: 'leaf-7',
    Component: TwinLeafIcon,
    className: 'top-[60%] right-[5%] w-11 h-15 text-[#2E7D6B] animate-leaf-sway-right',
    style: { opacity: 0.17, animationDelay: '2.5s', transform: 'rotate(-20deg)' },
  },
  {
    id: 'leaf-8',
    Component: OvalLeafIcon,
    className: 'bottom-[11%] right-[10%] w-8 h-13 text-[#10B981] animate-leaf-sway-left',
    style: { opacity: 0.21, animationDelay: '5.2s', transform: 'rotate(26deg)' },
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectCategory,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { reports } = useReports();
  const activeReportsCount = reports.filter((r: EmergencyReport) => r.status !== 'RESOLVED').length;

  const categories = [
    {
      type: 'Medical' as EmergencyType,
      label: 'Medical',
      icon: HeartPulse,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 group-hover:bg-red-100/80',
      borderColor: 'border-red-200/80 hover:border-red-400',
      glow: 'group-hover:shadow-red-500/10',
      delayClass: 'delay-600',
    },
    {
      type: 'Fire' as EmergencyType,
      label: 'Fire',
      icon: Flame,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50 group-hover:bg-orange-100/80',
      borderColor: 'border-orange-200/80 hover:border-orange-400',
      glow: 'group-hover:shadow-orange-500/10',
      delayClass: 'delay-700',
    },
    {
      type: 'Security' as EmergencyType,
      label: 'Security',
      icon: Shield,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 group-hover:bg-purple-100/80',
      borderColor: 'border-purple-200/80 hover:border-purple-400',
      glow: 'group-hover:shadow-purple-500/10',
      delayClass: 'delay-800',
    },
    {
      type: 'Hazard' as EmergencyType,
      label: 'Hazard',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 group-hover:bg-amber-100/80',
      borderColor: 'border-amber-200/80 hover:border-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
      delayClass: 'delay-900',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* 1. Vibrant Genshin Impact-style Cel-Shaded Anime Grass Animated Background */}
      <AnimeGrassBackground />

      {/* 2. Ambient Drifting Sage Leaves Layer */}
      <div
        className="pointer-events-none overflow-hidden inset-0 fixed z-1 select-none"
        aria-hidden="true"
      >
        {AMBIENT_SAGE_LEAVES.map((leaf) => {
          const LeafComp = leaf.Component;
          return (
            <div
              key={leaf.id}
              className={`absolute ${leaf.className}`}
              style={leaf.style}
            >
              <LeafComp className="w-full h-full" />
            </div>
          );
        })}
      </div>

      {/* 3. Slow "Breathing" Emerald Aura behind centerpiece */}
      <div
        className="absolute top-1/2 left-1/2 w-[650px] sm:w-[820px] h-[460px] sm:h-[580px] bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.24)_0%,_rgba(46,125,107,0.12)_45%,_transparent_72%)] rounded-full blur-3xl pointer-events-none animate-aura-breathe z-1"
        aria-hidden="true"
      />

      {/* 4. Frosted Glass Centerpiece Hero Container */}
      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center justify-center my-auto glass-panel-anime p-6 sm:p-10 md:p-12 animate-fade-in-up">
        {/* Sleek Frosted Glass Status Badge */}
        <div className="glass-badge-anime inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-4 sm:mb-6 animate-fade-in-up delay-100 hover:border-[#10B981]/60 transition-all duration-300 cursor-default">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-800">
            <span className="text-[#10B981]">●</span> System Online • Real-Time Dispatch
          </span>
        </div>

        {/* Live Active Reports Banner for Authenticated Students */}
        {currentUser && activeReportsCount > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('my-reports')}
            className="mb-5 px-4 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 backdrop-blur-md text-slate-900 inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-all animate-pulse-gentle shadow-sm cursor-pointer"
          >
            <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>You have {activeReportsCount} active incident report{activeReportsCount > 1 ? 's' : ''} in dispatch</span>
            <span className="text-[#2E7D6B] font-extrabold flex items-center gap-0.5">
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        )}

        {/* Bold, Dominant Centerpiece Title with high-contrast text & soft glow */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.1] mb-4 sm:mb-5 animate-fade-in-up delay-200 max-w-3xl select-none title-anime-glow">
          Campus Emergency <span className="text-[#2E7D6B]">Alert System</span>
        </h1>

        {/* Single Concise, Reassuring Subtitle with high-contrast text */}
        <p className="text-sm sm:text-lg md:text-xl text-[#334155] font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 animate-fade-in-up delay-300">
          Rapid emergency dispatch and real-time incident coordination for university students, faculty, and safety responders.
        </p>

        {/* Centerpiece "Report an Emergency" CTA Button with Frosted Glass Styling */}
        <div className="flex items-center justify-center mb-10 sm:mb-12 animate-fade-in-up delay-450 w-full">
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
              } else {
                onNavigate('report');
              }
            }}
            className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold text-white glass-btn-primary inline-flex items-center gap-2.5 cursor-pointer w-full sm:w-auto justify-center"
          >
            <ShieldAlert className="w-5 h-5 text-emerald-200" />
            <span>Report an Emergency</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* 4 Compact Icon-Only Category Cards wrapped in Frosted Glass */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.type);
                  if (!currentUser) {
                    onOpenAuth();
                  }
                }}
                className={`group p-4 sm:p-5 rounded-2xl glass-card-anime border ${cat.borderColor} cursor-pointer flex flex-col items-center justify-center gap-3 text-center animate-fade-in-up ${cat.delayClass}`}
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.iconColor} transition-transform duration-300 group-hover:scale-110 shadow-2xs`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] group-hover:text-[#2E7D6B] transition-colors duration-200">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
