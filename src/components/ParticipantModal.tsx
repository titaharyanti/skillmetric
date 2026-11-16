import React, { useState, useEffect } from 'react';
import { Participant, DEPARTMENT_OPTIONS } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantToEdit?: Participant | null;
  onSaveParticipant: (participant: Participant) => void;
}

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  participantToEdit,
  onSaveParticipant,
}) => {
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<string>(DEPARTMENT_OPTIONS[0]);
  const [role, setRole] = useState('Specialist');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (participantToEdit) {
      setNip(participantToEdit.nip);
      setName(participantToEdit.name);
      setDepartment(participantToEdit.department || DEPARTMENT_OPTIONS[0]);
      setRole(participantToEdit.role);
      setEmail(participantToEdit.email);
      setPhone(participantToEdit.phone);
    } else {
      setNip(`TRN-2026-00${Math.floor(Math.random() * 90 + 10)}`);
      setName('');
      setDepartment(DEPARTMENT_OPTIONS[0]);
      setRole('Specialist');
      setEmail('');
      setPhone('');
    }
  }, [participantToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nip) {
      alert('Nama dan NIP/ID Peserta wajib diisi.');
      return;
    }

    const saved: Participant = {
      id: participantToEdit ? participantToEdit.id : `part-${Date.now()}`,
      nip,
      name,
      department,
      role,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@company.id`,
      phone: phone || '0812-0000-0000',
    };

    onSaveParticipant(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto sm:my-8">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">
              {participantToEdit ? 'Edit Data Peserta' : 'Tambah Peserta Training Baru'}
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
          <div>
            <label className="block font-bold text-slate-700 mb-1">NIP / ID Peserta *</label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Peserta *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Kurniawan"
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Departemen / Divisi</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
              >
                <optgroup label="Internal Divisions">
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="External Divisions">
                  <option value="calon customer (pitching)">calon customer (pitching)</option>
                  <option value="calon customer (demonstration)">calon customer (demonstration)</option>
                  <option value="customer (training)">customer (training)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jabatan / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Senior Technician"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.id"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
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
              <span>Simpan Peserta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
