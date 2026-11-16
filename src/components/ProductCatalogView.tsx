import React, { useState } from 'react';
import {
  ProductCategory,
  TrainingProduct,
  TrainingSession,
  Participant,
  AppSettings,
  TrainingType,
} from '../types';
import { ImportExcelModal, ImportType } from './ImportExcelModal';
import {
  Boxes,
  Laptop,
  Cpu,
  Plus,
  Search,
  CheckCircle,
  Edit,
  Trash2,
  FileSpreadsheet,
  Lock,
  Upload,
  Building2,
  Briefcase,
  Users,
} from 'lucide-react';

interface ProductCatalogViewProps {
  products: TrainingProduct[];
  sessions: TrainingSession[];
  participants: Participant[];
  settings: AppSettings;
  onAddNewProduct: () => void;
  onEditProduct: (product: TrainingProduct) => void;
  onDeleteProduct: (productId: string) => void;
  isAdmin: boolean;
  onRequireAdmin: (msg?: string, pendingAction?: () => void) => void;
  onImportParticipants: (newParticipants: Participant[]) => void;
  onImportProducts: (newProducts: TrainingProduct[]) => void;
  onImportSessions: (newSessions: TrainingSession[]) => void;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({
  products,
  sessions,
  participants,
  settings,
  onAddNewProduct,
  onEditProduct,
  onDeleteProduct,
  isAdmin,
  onRequireAdmin,
  onImportParticipants,
  onImportProducts,
  onImportSessions,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | ProductCategory>('All');
  const [activeTrainingType, setActiveTrainingType] = useState<'All' | TrainingType>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [importExcelType, setImportExcelType] = useState<ImportType>('products');

  const filteredProducts = products.filter((prod) => {
    if (activeCategory !== 'All' && prod.category !== activeCategory) return false;
    if (activeTrainingType !== 'All' && (prod.trainingType || 'Internal') !== activeTrainingType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        prod.name.toLowerCase().includes(term) ||
        prod.code.toLowerCase().includes(term) ||
        prod.description.toLowerCase().includes(term) ||
        (prod.targetAudience && prod.targetAudience.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const softwareCount = products.filter((p) => p.category === 'Software').length;
  const hardwareCount = products.filter((p) => p.category === 'Hardware').length;
  const internalCount = products.filter((p) => (p.trainingType || 'Internal') === 'Internal').length;
  const eksternalCount = products.filter((p) => p.trainingType === 'Eksternal').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-800">
              Katalog Produk Training (Software & Hardware)
            </h2>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full border border-indigo-200">
              2 Jenis: Internal & Eksternal
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Modul pelatihan dikategorikan menjadi <strong>Training Internal</strong> (Karyawan: Sales, Ops, Teknisi, CS) dan <strong>Training Eksternal</strong> (Calon Customer / Pitching, Demo, Customer).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isAdmin) {
                onRequireAdmin('Akses Admin diperlukan untuk mengimpor katalog produk.', () => {
                  setImportExcelType('products');
                  setIsImportExcelOpen(true);
                });
              } else {
                setImportExcelType('products');
                setIsImportExcelOpen(true);
              }
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Excel Produk</span>
          </button>

          <button
            onClick={() => {
              if (!isAdmin) {
                onRequireAdmin('Akses Admin diperlukan untuk menambah modul produk training baru.', onAddNewProduct);
              } else {
                onAddNewProduct();
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
          >
            {isAdmin ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-amber-300" />}
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeCategory === 'All'
                  ? 'bg-white text-slate-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setActiveCategory('Software')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                activeCategory === 'Software'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Software ({softwareCount})</span>
            </button>
            <button
              onClick={() => setActiveCategory('Hardware')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                activeCategory === 'Hardware'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware ({hardwareCount})</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Training Type Filter (Internal vs Eksternal) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTrainingType('All')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTrainingType === 'All'
                  ? 'bg-white text-slate-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jenis
            </button>
            <button
              onClick={() => setActiveTrainingType('Internal')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                activeTrainingType === 'Internal'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Internal ({internalCount})</span>
            </button>
            <button
              onClick={() => setActiveTrainingType('Eksternal')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                activeTrainingType === 'Eksternal'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Eksternal ({eksternalCount})</span>
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, kode, atau target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 space-y-2">
            <Boxes className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Tidak ada produk training ditemukan untuk filter ini.</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const productSessions = sessions.filter((s) => s.productId === prod.id);
            const passedCount = productSessions.filter((s) => s.status === 'Kompeten').length;
            const tType = prod.trainingType || 'Internal';

            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-2 rounded-lg text-white font-bold text-xs ${
                          prod.category === 'Software' ? 'bg-blue-600' : 'bg-amber-600'
                        }`}
                      >
                        {prod.category === 'Software' ? (
                          <Laptop className="w-4 h-4" />
                        ) : (
                          <Cpu className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            {prod.code} • {prod.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                              tType === 'Internal'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {tType === 'Internal' ? <Building2 className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                            <span>Training {tType}</span>
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{prod.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            onRequireAdmin('Akses Admin diperlukan untuk mengedit data produk.', () =>
                              onEditProduct(prod)
                            );
                          } else {
                            onEditProduct(prod);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        title="Edit Produk"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            onRequireAdmin('Akses Admin diperlukan untuk menghapus produk.', () =>
                              onDeleteProduct(prod.id)
                            );
                          } else {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Target Audience Bar */}
                  {prod.targetAudience && (
                    <div className="mb-2.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-2 text-[11px] text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        <strong className="text-slate-800">Target Audien:</strong> {prod.targetAudience}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{prod.description}</p>

                  {/* Competency Requirements */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Persyaratan Kompetensi Wajib:
                    </span>
                    <ul className="space-y-1">
                      {prod.competencyRequirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Stats Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Batas KKM:</span>
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {prod.defaultKKM}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong>{productSessions.length}</strong> Sesi Ujian (
                      <span className="text-emerald-600 font-bold">{passedCount} Lulus</span>)
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ImportExcelModal
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        defaultType={importExcelType}
        participants={participants}
        products={products}
        sessions={sessions}
        settings={settings}
        onImportParticipants={onImportParticipants}
        onImportProducts={onImportProducts}
        onImportSessions={onImportSessions}
      />
    </div>
  );
};
