import React from 'react';
import {
  Award,
  BarChart3,
  Boxes,
  PlusCircle,
  Settings,
  Users,
  ShieldCheck,
  Lock,
  LogOut,
  Eye,
  TrendingUp,
  Building2,
  Briefcase,
  Calendar,
} from 'lucide-react';

export type NavTab =
  | 'calendar'
  | 'dashboardInternal'
  | 'dashboardEksternal'
  | 'participantProgress'
  | 'participants'
  | 'products'
  | 'settings';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewAssessment: () => void;
  totalParticipants: number;
  totalSessions: number;
  passRate: number;
  avgFinalScore: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAssessment,
  totalParticipants,
  totalSessions,
  passRate,
  avgFinalScore,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo, Application Title & Role Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-inner text-white">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SkillMetric <span className="text-blue-400 font-medium text-sm">v2.5</span>
                </h1>
                
                {/* Role Status Badge */}
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mode Admin / Asesor (Full CRUD)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Akses Peserta (View Only)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi Penilaian Assessment Teori, Praktek & Role-Play Peserta Training
              </p>
            </div>
          </div>

          {/* Quick Metrics & Mode Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex flex-col min-w-[85px]">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Peserta</span>
              <span className="text-sm font-bold text-white">{totalParticipants} Orang</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex flex-col min-w-[85px]">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Sesi Training</span>
              <span className="text-sm font-bold text-blue-400">{totalSessions} Sesi</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex flex-col min-w-[85px]">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Kelulusan</span>
              <span className="text-sm font-bold text-emerald-400">{passRate}%</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex flex-col min-w-[85px]">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Rata-Rata</span>
              <span className="text-sm font-bold text-amber-300">{avgFinalScore}</span>
            </div>

            {/* Admin Login / Logout Switcher Button */}
            {isAdmin ? (
              <button
                onClick={onLogoutAdmin}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                title="Keluar dari Mode Admin ke Akses Peserta (View Only)"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Keluar Mode Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                title="Masuk sebagai Penguji / Admin untuk menambah or mengedit data"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk Mode Admin</span>
              </button>
            )}

            {/* Action CTA Button for Input Assessment */}
            <button
              onClick={onOpenNewAssessment}
              className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all shrink-0 active:scale-95 cursor-pointer"
              title={isAdmin ? 'Input Penilaian Assessment Baru' : 'Akses Admin Diperlukan untuk Input Assessment Baru'}
            >
              {isAdmin ? (
                <PlusCircle className="w-4 h-4" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Input Assessment Baru</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-slate-800 text-amber-400 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Kalender Training</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30">
              Sync GCal
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dashboardInternal')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'dashboardInternal'
                ? 'bg-slate-800 text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>{isAdmin ? 'Dashboard Internal' : 'Dashboard & Analisis'}</span>
            <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/30">
              Karyawan
            </span>
          </button>

          {/* Dashboard Eksternal ONLY accessible in Admin mode */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('dashboardEksternal')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'dashboardEksternal'
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Dashboard Eksternal</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
                Pitch & Customer
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('participantProgress')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'participantProgress'
                ? 'bg-slate-800 text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Progress & Visualisasi Peserta</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'participants'
                ? 'bg-slate-800 text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Peserta & Hasil Assessment ({totalSessions})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-slate-800 text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Katalog Produk (Software & Hardware)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan & Bobot KKM</span>
          </button>
        </div>
      </div>
    </header>
  );
};
