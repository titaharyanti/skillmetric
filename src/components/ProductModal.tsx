import React, { useState, useEffect } from 'react';
import { ProductCategory, TrainingProduct, TrainingType } from '../types';
import { X, Boxes, Plus, Trash2, Save, Building2, Briefcase } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: TrainingProduct | null;
  onSaveProduct: (product: TrainingProduct) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Software');
  const [trainingType, setTrainingType] = useState<TrainingType>('Internal');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');
  const [defaultKKM, setDefaultKKM] = useState(75);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCode(productToEdit.code);
      setCategory(productToEdit.category);
      setTrainingType(productToEdit.trainingType || 'Internal');
      setTargetAudience(productToEdit.targetAudience || '');
      setDescription(productToEdit.description);
      setDefaultKKM(productToEdit.defaultKKM);
      setRequirements(productToEdit.competencyRequirements || []);
    } else {
      setName('');
      setCode(`SOFT-${Math.floor(Math.random() * 900 + 100)}`);
      setCategory('Software');
      setTrainingType('Internal');
      setTargetAudience('Sales Hardware, Sales Software, Telesales, Operation, Technician, Customer Success');
      setDescription('');
      setDefaultKKM(75);
      setRequirements(['Pemahaman Arsitektur & Konfigurasi Modul', 'Hands-On Troubleshooting SOP']);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddReq = () => {
    if (!newReq.trim()) return;
    setRequirements([...requirements, newReq.trim()]);
    setNewReq('');
  };

  const handleRemoveReq = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      alert('Nama dan Kode Produk wajib diisi.');
      return;
    }

    const saved: TrainingProduct = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      name,
      code,
      category,
      trainingType,
      targetAudience: targetAudience.trim() || (trainingType === 'Internal' ? 'Karyawan Internal Perusahaan' : 'Calon Customer (Pitching) & Client'),
      description,
      defaultKKM: Number(defaultKKM),
      competencyRequirements: requirements.length > 0 ? requirements : ['Standard Competency'],
    };

    onSaveProduct(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto sm:my-8">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              {productToEdit ? 'Edit Modul Produk Training' : 'Tambah Produk Training Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Produk Training *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Terminal EDC Android v3"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Produk *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold bg-white"
              >
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>
          </div>

          {/* Training Type Selector (Internal vs Eksternal) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800">Jenis Training Produk *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTrainingType('Internal');
                  if (!targetAudience || targetAudience.includes('Customer')) {
                    setTargetAudience('Sales Hardware, Sales Software, Sales Maritime, Telesales, Operation, Teknisi, Customer Success');
                  }
                }}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-all ${
                  trainingType === 'Internal'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-4 h-4 shrink-0 mt-0.5 ${trainingType === 'Internal' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <strong className="block font-bold text-xs">Training Internal</strong>
                  <span className="text-[10px] opacity-80 block leading-tight">
                    Untuk Karyawan Internal (Sales, Ops, Teknisi, CS, QA)
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrainingType('Eksternal');
                  if (!targetAudience || targetAudience.includes('Sales')) {
                    setTargetAudience('Calon Customer (Pitching), Demonstrasi Awal, Customer Perusahaan');
                  }
                }}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-all ${
                  trainingType === 'Eksternal'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Briefcase className={`w-4 h-4 shrink-0 mt-0.5 ${trainingType === 'Eksternal' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <strong className="block font-bold text-xs">Training Eksternal</strong>
                  <span className="text-[10px] opacity-80 block leading-tight">
                    Untuk Calon Customer (Pitching), Demo Awal & Klien
                  </span>
                </div>
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 mt-2">Target Audien / Divisi Peserta</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Contoh: Sales Hardware, Telesales, Demo Pitching Klien..."
                className="w-full py-1.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Unik Produk *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SOFT-001 / HARD-002"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard KKM (Passing Grade)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={defaultKKM}
                onChange={(e) => setDefaultKKM(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat Modul</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan produk yang di-training-kan..."
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-16"
            />
          </div>

          {/* Requirements List */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Standard Kompetensi Wajib</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                placeholder="Tambah butir kompetensi..."
                className="flex-1 py-1.5 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddReq}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-1 max-h-28 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-slate-50">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200 text-slate-800">
                  <span>• {req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReq(idx)}
                    className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Produk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
