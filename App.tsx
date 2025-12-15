import React, { useState } from 'react';
import { FormData, ClaimStatus, IssueCategory, AnalysisResult } from './types';
import InputForm from './components/InputForm';
import AnalysisResultDisplay from './components/AnalysisResult';
import { analyzeClaim } from './services/geminiService';
import { Activity, Landmark } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    transactionId: '',
    amount: 0,
    status: ClaimStatus.PENDING,
    issueCategory: IssueCategory.TECHNICAL,
    deadlineDays: 10,
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeClaim(formData);
      setResult(analysis);
    } catch (err) {
      setError("Gagal memproses analisis. Pastikan API Key valid dan coba lagi. " + (err instanceof Error ? err.message : ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">FICS Agent</h1>
              <p className="text-xs text-slate-400">Financial Compliance & SIA Reporting System</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-400">Powered by</div>
            <div className="text-sm font-semibold text-blue-400 flex items-center gap-1 justify-end">
              <Activity className="w-3 h-3" /> Gemini 3 Pro (Preview)
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        
        {/* Intro Banner */}
        <div className="bg-white border-l-4 border-blue-600 p-6 rounded-r-lg shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Sistem Integrasi Akuntansi & Kepatuhan BLUD</h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-4xl">
            Agen ini membantu staf akuntansi dalam menganalisis status klaim, memverifikasi dokumen SPI, 
            dan mensimulasikan pencatatan jurnal penyesuaian (Akrual Basis) sesuai PSAP 13.
            Output simulasi mencakup dampak pada Neraca dan Laporan Operasional.
          </p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24">
              <InputForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              
              <div className="mt-6 text-xs text-slate-400 text-center px-4">
                Sistem Pengendalian Internal (SPI) Level 1 <br/>
                Verifikasi Dokumen & Integritas Data
              </div>
            </div>
          </div>

          {/* Right Column: Output Cards */}
          <div className="lg:col-span-8">
             <AnalysisResultDisplay result={result} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;