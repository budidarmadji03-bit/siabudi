import React from 'react';
import { FormData, ClaimStatus, IssueCategory } from '../types';
import { CLAIM_STATUS_OPTIONS, ISSUE_CATEGORY_OPTIONS } from '../constants';
import { Calculator, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface InputFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'deadlineDays' ? Number(value) : value,
    }));
  };

  const isApproved = formData.status === ClaimStatus.APPROVED;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <FileText className="text-blue-400 w-5 h-5" />
        <h2 className="text-lg font-semibold text-white">Input Data Klaim (SIA)</h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Transaction ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ID Transaksi / Nomor Klaim
          </label>
          <input
            type="text"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="CONTOH: KLAIM-2024-X01"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nilai Total Klaim (IDR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">Rp</span>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              placeholder="0"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Nilai pendapatan yang akan diakrualkan.</p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status Klaim Saat Ini
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {CLAIM_STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Conditional Fields for Non-Approved Claims */}
        {!isApproved && (
          <div className="space-y-6 bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Kategori Kendala SPI
              </label>
              <select
                name="issueCategory"
                value={formData.issueCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
              >
                {ISSUE_CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Batas Waktu Perbaikan (Hari)
              </label>
              <input
                type="number"
                name="deadlineDays"
                value={formData.deadlineDays || ''}
                onChange={handleChange}
                placeholder="10"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={isLoading || !formData.transactionId || !formData.amount}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-md transition-all ${
            isLoading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Analisis...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Lakukan Analisis & Jurnal Akuntansi
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;