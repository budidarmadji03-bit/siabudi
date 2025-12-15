import React from 'react';
import { AnalysisResult } from '../types';
import { ShieldAlert, BookOpen, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface AnalysisResultProps {
  result: AnalysisResult | null;
}

const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({ result }) => {
  if (!result) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
      <BookOpen className="w-16 h-16 mb-4 opacity-50" />
      <p className="text-center font-medium">Belum ada analisis.</p>
      <p className="text-sm text-center">Silakan masukkan data klaim untuk simulasi akuntansi.</p>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* Kartu 1: Diagnosis SPI */}
      <div className="bg-white rounded-xl shadow-md border-l-4 border-amber-500 overflow-hidden">
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900">1. Diagnosis Kendala SPI & Rekomendasi</h3>
          </div>
          <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-1 rounded">
            Unit: {result.diagnosis.responsibleUnit}
          </span>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Analisis Risiko Finansial</h4>
            <p className="text-slate-800 leading-relaxed">{result.diagnosis.riskAnalysis}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Tindakan Korektif (Verifikasi Berjenjang)</h4>
            <ul className="space-y-2">
              {result.diagnosis.correctiveActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="bg-amber-100 text-amber-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Kartu 2: Simulasi Jurnal */}
      <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-600 overflow-hidden">
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-blue-900">2. Simulasi Jurnal Akrual (PSAP 13)</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2">Akun (Deskripsi)</th>
                  <th className="px-4 py-2 text-right">Debit (Dr)</th>
                  <th className="px-4 py-2 text-right">Kredit (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.journalEntries.map((entry, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {entry.debit}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{entry.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{formatCurrency(entry.amount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-800 pl-8">
                        {entry.credit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">-</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{formatCurrency(entry.amount)}</td>
                    </tr>
                  </React.Fragment>
                ))}
                
                {/* Uncollectible Entry if exists */}
                {result.uncollectibleEntry && (
                  <>
                     <tr className="bg-red-50/50">
                      <td className="px-4 py-3 font-medium text-red-800 border-l-2 border-red-400">
                        {result.uncollectibleEntry.debit}
                        <div className="text-xs text-red-400 font-normal mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3"/> {result.uncollectibleEntry.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-700">{formatCurrency(result.uncollectibleEntry.amount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-400">-</td>
                    </tr>
                    <tr className="bg-red-50/50">
                      <td className="px-4 py-3 font-medium text-red-800 pl-8 border-l-2 border-red-400">
                        {result.uncollectibleEntry.credit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-400">-</td>
                      <td className="px-4 py-3 text-right font-mono text-red-700">{formatCurrency(result.uncollectibleEntry.amount)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kartu 3: Laporan Keuangan */}
      <div className="bg-white rounded-xl shadow-md border-l-4 border-emerald-500 overflow-hidden">
        <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-emerald-900">3. Dampak Laporan Keuangan BLUD</h3>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-3 border-b pb-2">Laporan Neraca (Balance Sheet)</h4>
            <ul className="space-y-2">
               {result.financialImpact.balanceSheet.map((item, i) => (
                 <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                   <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                   {item}
                 </li>
               ))}
            </ul>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-3 border-b pb-2">Laporan Operasional (LO)</h4>
             <ul className="space-y-2">
               {result.financialImpact.operationalReport.map((item, i) => (
                 <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                   <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                   {item}
                 </li>
               ))}
            </ul>
          </div>
        </div>
        <div className="bg-slate-100 px-6 py-3 text-xs text-slate-500 italic border-t border-slate-200">
          <span className="font-bold">Catatan PENTING:</span> {result.financialImpact.note}
        </div>
      </div>

    </div>
  );
};

export default AnalysisResultDisplay;