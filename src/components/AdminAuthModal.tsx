import React, { useState } from 'react';
import { ShieldCheck, Lock, X, KeyRound, Check, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onSuccess: () => void;
  actionMessage?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onSuccess,
  actionMessage,
}) => {
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPin = currentPin || 'VSI7789';
    if (inputPin.trim() === targetPin) {
      setError(false);
      setInputPin('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Mode Penguji / Admin (Akses CRUD)</h3>
              <p className="text-[11px] text-slate-400">Verifikasi PIN Keamanan Asesor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {actionMessage ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Akses Admin Diperlukan</p>
                <p className="text-[11px] text-amber-700 mt-0.5">{actionMessage}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Mode Penguji / Asesor</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Secara default, platform ini berada pada <strong>Akses Peserta (View Only)</strong>. Masukkan PIN untuk membuka fitur Input Assessment, Tambah/Edit Peserta, dan Pengaturan.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Masukkan PIN Keamanan Admin *
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                value={inputPin}
                onChange={(e) => {
                  setInputPin(e.target.value);
                  setError(false);
                }}
                placeholder="Masukkan PIN Admin"
                autoFocus
                className="w-full py-2.5 px-3 text-center tracking-widest text-base font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-center">
              🔐 <span>Masukkan kode PIN Keamanan Admin yang valid.</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>PIN Keamanan salah. Silakan periksa kembali PIN Admin Anda.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Buka Akses Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
