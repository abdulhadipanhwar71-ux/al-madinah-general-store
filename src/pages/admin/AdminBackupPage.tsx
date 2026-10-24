import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  Lock, 
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { apiAdmin, checkHealth } from '../../services/api';
import { BackupRestoreResult } from '../../types';

export const AdminBackupPage: React.FC = () => {
  const { user } = useAuth();
  const { products, customers, transactions, orders, expenses } = useStore();

  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePayload, setRestorePayload] = useState<any | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<BackupRestoreResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    checkHealth().then(status => setDbHealthy(status));
  }, []);

  const handleDownloadJson = async () => {
    try {
      setExportingJson(true);
      await apiAdmin.downloadBackupJson();
    } catch (err: any) {
      alert(`Export JSON failed: ${err.message || 'Error occurred'}`);
    } finally {
      setExportingJson(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setExportingCsv(true);
      await apiAdmin.downloadBackupCsv();
    } catch (err: any) {
      alert(`Export CSV ZIP failed: ${err.message || 'Error occurred'}`);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    setRestoreResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setRestoreError('Please upload a valid JSON backup file.');
      return;
    }

    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.version) {
          setRestoreError('Unrecognized backup format: missing schema version.');
          setRestorePayload(null);
          return;
        }
        setRestorePayload(parsed);
      } catch (err) {
        setRestoreError('Failed to parse JSON file. Please ensure it is not corrupt.');
        setRestorePayload(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!restorePayload) return;
    try {
      setRestoring(true);
      setRestoreError(null);
      setShowConfirmModal(false);

      const result = await apiAdmin.restoreBackup(restorePayload);
      setRestoreResult(result);
    } catch (err: any) {
      setRestoreError(err.message || 'Restore process failed.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Database Backup & Disaster Recovery
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Production Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Safeguard store data with transactional JSON backups, multi-table CSV spreadsheet archives, and safe restore with duplicate detection.
          </p>
        </div>

        {/* Database Health Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-stone-200 shadow-sm self-start sm:self-auto">
          <Database className={`w-4 h-4 ${dbHealthy ? 'text-emerald-600' : 'text-amber-500'}`} />
          <div className="text-xs">
            <p className="font-bold text-stone-800">
              {dbHealthy ? 'Backend API & Database Online' : 'Connecting to Backend API...'}
            </p>
            <p className="text-[10px] text-stone-500">
              {dbHealthy ? 'FastAPI + SQLAlchemy Engine' : 'Probing /api/health endpoint'}
            </p>
          </div>
          <span className={`w-2 h-2 rounded-full ${dbHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
        </div>
      </div>

      {/* Access Permission Warning for Non-Owners */}
      {!isOwner && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
          <Lock className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div className="text-xs">
            <span className="font-bold">Restricted Owner Privileges:</span> You are currently signed in with a cashier/staff role. Database backup downloads and restore operations require Owner level authorization.
          </div>
        </div>
      )}

      {/* Database Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Catalog Products</p>
          <p className="text-xl font-black text-stone-900 mt-1">{products.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">With SKU & Cost</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Customer Ledgers</p>
          <p className="text-xl font-black text-stone-900 mt-1">{customers.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Udhaar Accounts</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Sales Invoices</p>
          <p className="text-xl font-black text-stone-900 mt-1">{transactions.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Atomic Records</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Customer Orders</p>
          <p className="text-xl font-black text-stone-900 mt-1">{orders.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Web & WhatsApp</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Store Expenses</p>
          <p className="text-xl font-black text-stone-900 mt-1">{expenses.length}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Ledger Entries</p>
        </div>
      </div>

      {/* Main Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EXPORT SECTION */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">Export Store Data</h2>
              <p className="text-xs text-stone-500">Download complete transactional snapshots for offline preservation.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* JSON Option */}
            <div className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 transition-colors bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileJson className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Full JSON Backup (.json)</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Includes all relational models, stock movement logs, Udhaar repayments, and order audit trail. Ideal for 1-click restore.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Schema Version 3.0 • Transactionally Consistent</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadJson}
                disabled={exportingJson || !isOwner}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 flex-shrink-0"
              >
                {exportingJson ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* CSV ZIP Option */}
            <div className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 transition-colors bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Spreadsheet CSV Archive (.zip)</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Compressed archive containing individual CSVs for products, customers, transactions, expenses, repayments, and orders.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-teal-700 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Compatible with Microsoft Excel, Google Sheets, & Audits</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadCsv}
                disabled={exportingCsv || !isOwner}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 flex-shrink-0"
              >
                {exportingCsv ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Zipping...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download CSV ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-emerald-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              Automated Backup Best Practice
            </p>
            <p className="text-emerald-800/80 text-[11px]">
              We recommend downloading a weekly JSON backup after Sunday closing or before initiating major catalog price adjustments.
            </p>
          </div>
        </div>

        {/* RESTORE SECTION */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">Restore Store Data</h2>
              <p className="text-xs text-stone-500">Import records from an existing DukaanOS JSON backup file.</p>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl p-6 text-center transition-colors">
            <input
              type="file"
              id="backupFileInput"
              accept=".json"
              disabled={!isOwner}
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="backupFileInput"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  {restoreFile ? restoreFile.name : 'Click to select DukaanOS JSON backup'}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {restoreFile ? `${(restoreFile.size / 1024).toFixed(1)} KB selected` : 'Accepts .json files exported from DukaanOS'}
                </p>
              </div>
            </label>
          </div>

          {/* Parsed Payload Summary */}
          {restorePayload && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700">Backup Schema Version:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                  v{restorePayload.version || '3.0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700">Exported Timestamp:</span>
                <span className="text-stone-600 font-mono text-[11px]">
                  {restorePayload.exported_at ? new Date(restorePayload.exported_at).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200 text-center text-xs">
                <div className="p-2 bg-white rounded border border-stone-200">
                  <p className="text-[10px] text-stone-500">Products</p>
                  <p className="font-bold text-stone-800">{restorePayload.products?.length || 0}</p>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200">
                  <p className="text-[10px] text-stone-500">Customers</p>
                  <p className="font-bold text-stone-800">{restorePayload.customers?.length || 0}</p>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200">
                  <p className="text-[10px] text-stone-500">Orders</p>
                  <p className="font-bold text-stone-800">{restorePayload.orders?.length || 0}</p>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={restoring || !isOwner}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Verify & Restore into Database</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {restoreError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Restore Success Summary */}
          {restoreResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{restoreResult.message}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-medium text-emerald-800">
                <div>Products: +{restoreResult.imported_products}</div>
                <div>Customers: +{restoreResult.imported_customers}</div>
                <div>Orders: +{restoreResult.imported_orders}</div>
                <div>Duplicates Skipped: {restoreResult.skipped_duplicates}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-stone-900">Confirm Database Restore</h3>
              <p className="text-xs text-stone-500">
                You are about to import records from <span className="font-semibold text-stone-700">{restoreFile?.name}</span> into your live database.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Smart Duplicate Protection Active</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Existing products matching SKUs, customers matching phone numbers, and transactions matching invoice numbers will be safely preserved to prevent duplication.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={restoring}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {restoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <span>Yes, Proceed Restore</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBackupPage;
