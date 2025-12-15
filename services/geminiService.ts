import { FormData, AnalysisResult, ClaimStatus, IssueCategory, JournalEntry } from "../types";

// Local rule-based analysis engine (No AI dependency)
export const analyzeClaim = async (data: FormData): Promise<AnalysisResult> => {
  // Simulate processing time for better UX
  await new Promise(resolve => setTimeout(resolve, 600));

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  // --- 1. LOGIKA DIAGNOSIS SPI (Sistem Pengendalian Internal) ---
  let riskAnalysis = "";
  let correctiveActions: string[] = [];
  let responsibleUnit = "";

  if (data.status === ClaimStatus.APPROVED) {
    riskAnalysis = "Status Klaim 'Layak Bayar' menunjukkan kepatuhan administratif yang baik. Risiko finansial rendah, pendapatan dapat diakui secara akrual dengan keyakinan tinggi (High Assurance).";
    correctiveActions = [
      "Lakukan pemantauan aging schedule (umur piutang) hingga kas diterima.",
      "Arsip digital dokumen pendukung (SEP, Resume) untuk audit tahunan.",
      "Siapkan jurnal penerimaan kas (LRA) saat dana masuk ke rekening BLUD."
    ];
    responsibleUnit = "Sub-Bagian Perbendaharaan & Verifikasi";
  } else if (data.status === ClaimStatus.PENDING) {
    riskAnalysis = `Status 'Pending' dengan kategori '${data.issueCategory}' mengakibatkan risiko penundaan arus kas (Cashflow Delay). Secara akuntansi, Pendapatan LO tetap diakui, namun kualitas aset (Piutang) menurun karena ketidakpastian waktu bayar.`;
    
    // Logika Tindakan Korektif Berdasarkan Kategori Masalah
    switch (data.issueCategory) {
      case IssueCategory.CODING:
        correctiveActions = [
          "Review ulang kesesuaian kode diagnosis ICD-10 dengan resume medis oleh Koder Senior.",
          "Pastikan tidak ada 'upcoding' atau 'fragmentation' yang memicu pending.",
          "Lengkapi lembar verifikasi internal koding."
        ];
        responsibleUnit = "Unit Casemix / Tim Koding";
        break;
      case IssueCategory.DOCS:
        correctiveActions = [
          "Lengkapi tanda tangan DPJP pada resume medis elektronik/fisik.",
          "Lampirkan hasil pemeriksaan penunjang (Lab/Radiologi) yang valid.",
          "Pastikan SEP sesuai dengan rujukan Faskes tingkat 1."
        ];
        responsibleUnit = "Administrasi Rawat Inap / Admisi";
        break;
      case IssueCategory.TECHNICAL:
        correctiveActions = [
          "Cek koneksi bridging V-Claim dan SIMRS.",
          "Lakukan generate ulang file TXT/JSON klaim.",
          "Koordinasi dengan tim IT BPJS Kesehatan setempat."
        ];
        responsibleUnit = "Instalasi SIMRS / IT";
        break;
      case IssueCategory.NON_COVERED:
        correctiveActions = [
          "Verifikasi ulang status kepesertaan pasien saat pelayanan.",
          "Buat kronologis kejadian untuk kasus kecelakaan/gawat darurat.",
          "Pastikan kasus bukan termasuk kosmetik/estetika murni."
        ];
        responsibleUnit = "Tim JKN / Penjaminan";
        break;
      default:
        correctiveActions = [
          "Lakukan rekonsiliasi data klaim dengan berita acara verifikasi.",
          "Identifikasi penyebab pending melalui aplikasi E-Klaim."
        ];
        responsibleUnit = "Tim Kendali Mutu & Biaya (TKMKB)";
    }
  } else { // Case: DENIED / Gagal Bayar
    riskAnalysis = `Status 'Gagal Bayar' (Denied) menimbulkan risiko kerugian finansial material. Piutang yang telah dicatat berisiko menjadi 'Bad Debt' (Piutang Tak Tertagih) dan memerlukan penyisihan (allowance) sesuai kebijakan akuntansi BLUD.`;
    correctiveActions = [
      "Lakukan telaah sejawat komite medik untuk opsi pengajuan keberatan (Dispute).",
      "Jika dispute gagal, siapkan dokumen Berita Acara Penghapusan Piutang.",
      "Evaluasi SPO pelayanan medis terkait untuk mencegah penolakan berulang di masa depan."
    ];
    responsibleUnit = "Komite Medik & Bagian Keuangan";
  }

  // --- 2. LOGIKA JURNAL AKUNTANSI (Accrual Basis - PSAP 13) ---
  // Jurnal standar pengakuan pendapatan saat layanan diberikan/diklaim
  const journalEntries: JournalEntry[] = [
    {
      debit: "Piutang Klaim Pelayanan Kesehatan",
      credit: "",
      amount: data.amount,
      description: "Pengakuan Hak Tagih (Aset Lancar)"
    },
    {
      debit: "",
      credit: "Pendapatan Jasa Layanan Pasien - LO",
      amount: data.amount,
      description: "Pengakuan Pendapatan Operasional (Basis Akrual)"
    }
  ];

  // --- 3. LOGIKA PENYISIHAN PIUTANG (Uncollectible) ---
  // Hanya muncul jika status Gagal Bayar atau risiko tinggi
  let uncollectibleEntry: JournalEntry | undefined = undefined;
  if (data.status === ClaimStatus.DENIED) {
    uncollectibleEntry = {
      debit: "Beban Penyisihan Piutang Tak Tertagih",
      credit: "Akumulasi Penyisihan Piutang",
      amount: data.amount, // Konservatif: menyisihkan 100% jika ditolak
      description: "Antisipasi kerugian atas klaim gagal bayar"
    };
  }

  // --- 4. DAMPAK LAPORAN KEUANGAN ---
  const balanceSheetImpact = [
    `Aset Lancar (Pos Piutang) bertambah sebesar ${formatCurrency(data.amount)}.`,
  ];
  if (data.status === ClaimStatus.DENIED) {
    balanceSheetImpact.push(`Nilai Buku Piutang (Net) berkurang karena pembentukan akun kontra (Akumulasi Penyisihan) sebesar ${formatCurrency(data.amount)}.`);
  } else {
    balanceSheetImpact.push(`Ekuitas Dana Lancar meningkat seiring dengan pengakuan Surplus-LO.`);
  }

  const operationalReportImpact = [
    `Pendapatan-LO (Operasional) bertambah sebesar ${formatCurrency(data.amount)} pada periode berjalan.`,
  ];
  if (data.status === ClaimStatus.DENIED) {
    operationalReportImpact.push(`Beban Operasional meningkat akibat pengakuan Beban Penyisihan Piutang, mengurangi Surplus bersih.`);
  } else {
    operationalReportImpact.push(`Surplus/Defisit-LO dipengaruhi positif secara langsung oleh pendapatan ini.`);
  }

  return {
    diagnosis: {
      riskAnalysis,
      correctiveActions,
      responsibleUnit
    },
    journalEntries,
    uncollectibleEntry,
    financialImpact: {
      balanceSheet: balanceSheetImpact,
      operationalReport: operationalReportImpact,
      note: "Pencatatan ini berbasis Akrual (SAK/SAP). Pendapatan-LRA (Basis Kas) dan Arus Kas Masuk baru diakui saat dana benar-benar diterima di Rekening Kas BLUD."
    }
  };
};