'use client';

import React, { useState } from 'react';
import { Upload, FileText, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';
import { SAMPLE_DOCUMENTS } from '@/lib/documents/sample-documents';

interface DocumentUploadProps {
  onDocumentLoaded: (doc: DocumentAnalysis) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentLoaded,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setLoading(true);
    setLoadingMsg(`Extracting text & analyzing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse document');
      }

      onDocumentLoaded(json.data);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    setErrorMsg(null);
    setLoading(true);
    setLoadingMsg('Loading precomputed legal intelligence...');

    try {
      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load sample document');
      }

      onDocumentLoaded(json.data);
    } catch (err) {
      console.error('Sample load error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error loading sample');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setErrorMsg(null);
    setLoading(true);
    setLoadingMsg('Running legal intelligence pipeline on text...');

    try {
      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, filename: 'Pasted Document' }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze text');
      }

      onDocumentLoaded(json.data);
    } catch (err) {
      console.error('Text analysis error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error analyzing text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Error Banner */}
      {errorMsg && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div className="relative group p-8 sm:p-12 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 transition-all text-center backdrop-blur-sm">
        <input
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileUpload}
          disabled={loading}
          aria-label="Upload a PDF or text legal document"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Upload your legal document (PDF, TXT)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Drag and drop your file here, or click to browse. We support employment contracts, NDAs, rental agreements, and service agreements.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#5e595d] bg-[#f6f4fb] px-4 py-1.5 rounded-full border border-[#ece7f2]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Files processed securely &amp; sanitized client-side</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center space-y-3 z-10">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-white">{loadingMsg}</p>
            <p className="text-xs text-slate-400">Classifying clauses, extracting obligations, and validating grounding...</p>
          </div>
        )}
      </div>

      {/* Or Select Safe Fictional Sample Agreements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Or Try 1-Click Sample Agreements (Instant Demo)
            </h3>
          </div>
          <span className="text-xs text-slate-500">No upload required</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => !loading && handleSelectSample(sample.id)}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-slate-900/80 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {sample.type}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                  {sample.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Legal Call Demo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Text Paste Option */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowPasteArea(!showPasteArea)}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
        >
          {showPasteArea ? 'Hide Text Input' : 'Prefer to paste raw agreement text directly? Click here'}
        </button>

        {showPasteArea && (
          <form onSubmit={handleTextSubmit} className="mt-4 text-left space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste contract clauses or text here..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!rawText.trim() || loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition"
            >
              Analyze Pasted Text
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
