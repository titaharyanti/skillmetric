import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

interface SpecificDateFilterProps {
  dateFilterType: 'single' | 'range';
  setDateFilterType: (type: 'single' | 'range') => void;
  selectedExactDate: string;
  setSelectedExactDate: (date: string) => void;
  selectedStartDate: string;
  setSelectedStartDate: (date: string) => void;
  selectedEndDate: string;
  setSelectedEndDate: (date: string) => void;
  className?: string;
}

export const SpecificDateFilter: React.FC<SpecificDateFilterProps> = ({
  dateFilterType,
  setDateFilterType,
  selectedExactDate,
  setSelectedExactDate,
  selectedStartDate,
  setSelectedStartDate,
  selectedEndDate,
  setSelectedEndDate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilter =
    (dateFilterType === 'single' && selectedExactDate !== '') ||
    (dateFilterType === 'range' && (selectedStartDate !== '' || selectedEndDate !== ''));

  const getDisplayText = () => {
    if (dateFilterType === 'single') {
      if (selectedExactDate) return selectedExactDate;
      return 'Pilih Tanggal';
    } else {
      if (selectedStartDate && selectedEndDate) {
        return `${selectedStartDate} s/d ${selectedEndDate}`;
      }
      if (selectedStartDate) return `Dari ${selectedStartDate}`;
      if (selectedEndDate) return `s/d ${selectedEndDate}`;
      return 'Pilih Rentang Tanggal';
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExactDate('');
    setSelectedStartDate('');
    setSelectedEndDate('');
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
        <Calendar className="w-3 h-3 text-purple-600" />
        <span>Tanggal Spesifik</span>
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-1.5 px-2.5 bg-white border rounded-lg outline-none text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer shadow-2xs ${
          hasActiveFilter
            ? 'border-purple-500 text-purple-900 bg-purple-50/30'
            : 'border-slate-300 text-slate-700 hover:border-slate-400'
        }`}
      >
        <span className="truncate pr-1">{getDisplayText()}</span>
        <div className="flex items-center gap-1 shrink-0">
          {hasActiveFilter && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-purple-200/60 text-purple-700 cursor-pointer"
              title="Bersihkan Tanggal"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay for outside click close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover box */}
          <div className="absolute right-0 lg:left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                Mode Filter Tanggal
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setDateFilterType('single');
                    setSelectedStartDate('');
                    setSelectedEndDate('');
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    dateFilterType === 'single'
                      ? 'bg-purple-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single Date
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilterType('range');
                    setSelectedExactDate('');
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    dateFilterType === 'range'
                      ? 'bg-purple-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Range Date
                </button>
              </div>
            </div>

            {dateFilterType === 'single' ? (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Pilih Tanggal Spesifik
                </label>
                <input
                  type="date"
                  value={selectedExactDate}
                  onChange={(e) => setSelectedExactDate(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-xs font-medium"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={selectedStartDate}
                    onChange={(e) => setSelectedStartDate(e.target.value)}
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    s/d Tanggal
                  </label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    onChange={(e) => setSelectedEndDate(e.target.value)}
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-xs font-medium"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedExactDate('');
                  setSelectedStartDate('');
                  setSelectedEndDate('');
                }}
                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Reset Tanggal
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-medium cursor-pointer shadow-2xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
