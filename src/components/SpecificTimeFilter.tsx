import React, { useState } from 'react';
import { Clock, ChevronDown, X, Check } from 'lucide-react';

interface SpecificTimeFilterProps {
  timeFilterType: 'single' | 'range';
  setTimeFilterType: (type: 'single' | 'range') => void;
  timeFilterMode: 'interval' | 'free';
  setTimeFilterMode: (mode: 'interval' | 'free') => void;
  selectedTimes: string[];
  setSelectedTimes: (times: string[]) => void;
  selectedTimeRangeStart: string;
  setSelectedTimeRangeStart: (time: string) => void;
  selectedTimeRangeEnd: string;
  setSelectedTimeRangeEnd: (time: string) => void;
  timeFreeText: string;
  setTimeFreeText: (text: string) => void;
  className?: string;
}

export const SpecificTimeFilter: React.FC<SpecificTimeFilterProps> = ({
  timeFilterType,
  setTimeFilterType,
  timeFilterMode,
  setTimeFilterMode,
  selectedTimes,
  setSelectedTimes,
  selectedTimeRangeStart,
  setSelectedTimeRangeStart,
  selectedTimeRangeEnd,
  setSelectedTimeRangeEnd,
  timeFreeText,
  setTimeFreeText,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeIntervals = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const hasActiveFilter =
    (timeFilterType === 'single' &&
      ((timeFilterMode === 'interval' && selectedTimes.length > 0) ||
        (timeFilterMode === 'free' && timeFreeText.trim() !== ''))) ||
    (timeFilterType === 'range' &&
      (selectedTimeRangeStart !== '' || selectedTimeRangeEnd !== ''));

  const getDisplayText = () => {
    if (timeFilterType === 'single') {
      if (timeFilterMode === 'interval') {
        if (selectedTimes.length === 0) return 'Pilih Jam';
        if (selectedTimes.length === 1) return `${selectedTimes[0]} WIB`;
        return `${selectedTimes.length} Jam Terpilih`;
      } else {
        if (timeFreeText) return timeFreeText;
        return 'Pilih Jam';
      }
    } else {
      if (selectedTimeRangeStart && selectedTimeRangeEnd) {
        return `${selectedTimeRangeStart} - ${selectedTimeRangeEnd}`;
      }
      if (selectedTimeRangeStart) return `Mulai ${selectedTimeRangeStart}`;
      if (selectedTimeRangeEnd) return `Selesai ${selectedTimeRangeEnd}`;
      return 'Pilih Rentang Jam';
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTimes([]);
    setSelectedTimeRangeStart('');
    setSelectedTimeRangeEnd('');
    setTimeFreeText('');
  };

  const toggleTimeSelection = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const selectAllIntervals = () => {
    setSelectedTimes([...timeIntervals]);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Jam / Waktu</span>
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-1.5 px-2.5 bg-white border rounded-lg outline-none text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer shadow-2xs ${
          hasActiveFilter
            ? 'border-amber-500 text-amber-900 bg-amber-50/30'
            : 'border-slate-300 text-slate-700 hover:border-slate-400'
        }`}
      >
        <span className="truncate pr-1">{getDisplayText()}</span>
        <div className="flex items-center gap-1 shrink-0">
          {hasActiveFilter && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-amber-200/60 text-amber-700 cursor-pointer"
              title="Bersihkan Jam"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover box */}
          <div className="absolute right-0 lg:left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3.5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Mode Filter Jam
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setTimeFilterType('single');
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    timeFilterType === 'single'
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single / Multi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeFilterType('range');
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    timeFilterType === 'range'
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rentang (Range)
                </button>
              </div>
            </div>

            {/* Sub Mode Toggle: Interval vs Free Text */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sumber Jam</span>
              <div className="inline-flex rounded-lg bg-slate-50 border border-slate-200 p-0.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeFilterMode('interval')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    timeFilterMode === 'interval'
                      ? 'bg-slate-200 text-slate-800 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Interval
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilterMode('free')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    timeFilterMode === 'free'
                      ? 'bg-slate-200 text-slate-800 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Bebas
                </button>
              </div>
            </div>

            {/* Single / Multi selection content */}
            {timeFilterType === 'single' ? (
              timeFilterMode === 'interval' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">Pilih Jam (Bisa Multi-Select)</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllIntervals}
                        className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTimes([])}
                        className="text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto pr-1">
                    {timeIntervals.map((time) => {
                      const isSelected = selectedTimes.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => toggleTimeSelection(time)}
                          className={`py-1 text-[10px] font-semibold rounded-md border text-center transition-all cursor-pointer relative flex items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
                          <span>{time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Ketik Jam Bebas / Pencarian
                  </label>
                  <input
                    type="text"
                    value={timeFreeText}
                    onChange={(e) => setTimeFreeText(e.target.value)}
                    placeholder="Contoh: 08:15 atau 14:00"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 text-xs font-medium"
                  />
                </div>
              )
            ) : (
              /* Range Time Mode */
              <div className="space-y-3">
                {timeFilterMode === 'interval' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Dari Jam
                      </label>
                      <select
                        value={selectedTimeRangeStart}
                        onChange={(e) => setSelectedTimeRangeStart(e.target.value)}
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 text-xs font-medium"
                      >
                        <option value="">Semua</option>
                        {timeIntervals.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Sampai Jam
                      </label>
                      <select
                        value={selectedTimeRangeEnd}
                        onChange={(e) => setSelectedTimeRangeEnd(e.target.value)}
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 text-xs font-medium"
                      >
                        <option value="">Semua</option>
                        {timeIntervals.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Dari Jam
                      </label>
                      <input
                        type="text"
                        value={selectedTimeRangeStart}
                        onChange={(e) => setSelectedTimeRangeStart(e.target.value)}
                        placeholder="Contoh: 08:30"
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 text-xs font-medium animate-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Sampai Jam
                      </label>
                      <input
                        type="text"
                        value={selectedTimeRangeEnd}
                        onChange={(e) => setSelectedTimeRangeEnd(e.target.value)}
                        placeholder="Contoh: 17:15"
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 text-xs font-medium animate-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedTimes([]);
                  setSelectedTimeRangeStart('');
                  setSelectedTimeRangeEnd('');
                  setTimeFreeText('');
                }}
                className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
              >
                Reset Jam
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1 rounded-lg font-bold cursor-pointer shadow-2xs"
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
