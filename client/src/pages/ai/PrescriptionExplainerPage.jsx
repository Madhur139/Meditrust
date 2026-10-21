import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Scan,
  AlertTriangle,
  Clock,
  Pill,
  X,
  RefreshCw,
  ImagePlus
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import aiService from '../../services/aiService';
import { logoutUser } from '../../features/auth/authSlice';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const isUnclear = (value) =>
  value === null || value === undefined || String(value).trim() === '';

export default function PrescriptionExplainerPage({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [result, setResult] = useState(null);

  const go = (route, legacyId) => {
    if (typeof onNavigate === 'function' && legacyId) {
      try {
        onNavigate(legacyId);
      } catch {
        // ignore legacy demo navigator errors
      }
    }
    navigate(route);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (candidate) => {
    if (!candidate) return 'Please choose an image file.';
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      return 'Unsupported file type. Use JPG, JPEG, PNG, or WEBP.';
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      return `File is too large. Keep it under ${MAX_SIZE_MB}MB.`;
    }
    return '';
  };

  const handleSelectFile = (candidate) => {
    const problem = validateFile(candidate);
    setValidationError(problem);
    if (problem) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
    setScanError('');
    setResult(null);
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setValidationError('');
    setScanError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    const problem = validateFile(file);
    if (problem) {
      setValidationError(problem);
      return;
    }
    setIsScanning(true);
    setScanError('');
    try {
      const prescription = await aiService.scanPrescription({
        file,
        token: user?.token,
      });
      setResult(prescription);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('user');
        dispatch(logoutUser());
        navigate('/login');
        return;
      }
      setResult(null);
      setScanError(
        err?.response?.data?.error ||
          err?.response?.data?.details ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not analyze the prescription.',
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="purple" size="sm">
          Vision OCR & Clinical Parser
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Prescription Explainer
        </h1>
        <p className="text-sm text-slate-600">
          Upload any handwritten doctor's slip or clinic discharge summary. Our medical vision model deciphers medication schedules, food instructions, and safety precautions.
        </p>
      </div>

      {/* Upload Zone & Scan State */}
      <Card className="p-8 border-dashed border-2 border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 text-center transition-all">

        {isScanning ? (
          /* Animated Scanning State */
          <div className="py-10 space-y-4 max-w-md mx-auto animate-pulse">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Scan className="w-10 h-10 animate-spin" />
              </div>
              <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl animate-ping" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-indigo-950">
                Scanning Doctor's Handwriting...
              </h3>
              <p className="text-xs text-indigo-700/80">
                Running optical character recognition and matching against FDA pharmacopeia database...
              </p>
            </div>

            <div className="w-48 bg-indigo-200 rounded-full h-1.5 mx-auto overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div
            className="py-6 space-y-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer?.files?.[0]) handleSelectFile(e.dataTransfer.files[0]);
            }}
          >
            {previewUrl ? (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-indigo-200 shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Selected prescription preview"
                    className="w-full max-h-72 object-contain bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-rose-600 shadow"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 truncate">{file?.name}</p>
              </div>
            ) : (
              <div
                className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {previewUrl ? 'Prescription Image Ready' : "Drag & Drop Your Prescription Image"}
              </h3>
              <p className="text-xs text-slate-400">
                Supports JPG, JPEG, PNG, WEBP up to {MAX_SIZE_MB}MB. Clear lighting produces best accuracy.
              </p>
            </div>

            {validationError && (
              <p className="text-xs font-semibold text-rose-600">{validationError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSelectFile(e.target.files[0]);
              }}
            />

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              {!previewUrl && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  icon={ImagePlus}
                >
                  Choose Image
                </Button>
              )}
              {previewUrl && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  icon={RefreshCw}
                >
                  Replace Image
                </Button>
              )}
              <Button
                variant="ai"
                size="md"
                onClick={handleAnalyze}
                disabled={!file || isScanning}
                icon={Sparkles}
              >
                Analyze Prescription
              </Button>
            </div>
          </div>
        )}

      </Card>

      {/* Error State */}
      {scanError && !isScanning && (
        <Card className="p-6 text-center space-y-3 border-rose-200">
          <p className="text-sm font-semibold text-rose-700">
            Could not analyze this prescription
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{scanError}</p>
          <Button variant="outline" size="sm" onClick={handleAnalyze} icon={RefreshCw}>
            Retry Analysis
          </Button>
        </Card>
      )}

      {/* Extracted Results Section (actual backend response fields only) */}
      {result && !isScanning && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Metadata Strip */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold">
                  RX-{String(result._id ?? '').slice(-6).toUpperCase()}
                </span>
                <Badge variant="success" size="sm" dot>
                  AI Extracted
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Prescribed by: {isUnclear(result.doctor_name) ? 'Unclear — please verify' : result.doctor_name}
              </h3>
              <p className="text-xs text-slate-500">
                Patient: {isUnclear(result.patient_name) ? 'Unclear — please verify' : result.patient_name}
                {' • '}Date: {isUnclear(result.date) ? 'Unclear — please verify' : result.date}
              </p>
              {result.diagnosis_notes && (
                <p className="text-xs text-teal-700 font-medium mt-1">
                  Notes: {result.diagnosis_notes}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => go('/pharmacy', 'pharmacy')}
              icon={Pill}
            >
              Order Medicines via Pharmacy
            </Button>
          </div>

          {/* Scanned image reference */}
          {result.image && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <FileText className="w-4 h-4 text-teal-600 shrink-0" />
              <a
                href={result.image}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-teal-700 hover:underline truncate"
              >
                View scanned prescription image
              </a>
            </div>
          )}

          {/* Cards for each extracted medicine */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Extracted Medications ({(result.medicines ?? []).length})
            </h3>

            {(result.medicines ?? []).length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-xs text-slate-500">
                  No medicines could be read clearly from this image. Try a sharper photo with better lighting.
                </p>
              </Card>
            )}

            {(result.medicines ?? []).map((med, index) => (
              <Card key={index} className="p-6 border-slate-200 shadow-xs space-y-4">

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {isUnclear(med?.name) ? 'Unclear medicine — please verify' : med.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Dosage & Schedule
                    </span>
                    <p className="text-xs font-medium text-slate-800 flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      Dosage: {isUnclear(med?.dosage) ? 'Unclear — please verify' : med.dosage}
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1 space-y-0.5">
                      <p>Frequency: {isUnclear(med?.frequency) ? 'Unclear — please verify' : med.frequency}</p>
                      <p>Duration: {isUnclear(med?.duration) ? 'Unclear — please verify' : med.duration}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pharmacist Notes & Uncertainty Flags
                    </span>
                    {isUnclear(med?.notes) ? (
                      <p className="text-xs text-slate-500">
                        No additional notes extracted for this medicine.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-900 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        {med.notes}
                      </p>
                    )}
                  </div>

                </div>

              </Card>
            ))}
          </div>

          <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-500 text-center">
            MediTrust AI extraction is an assistive readout. Always double-check dosage instructions with the packaging label and your pharmacist.
          </div>

        </div>
      )}

    </div>
  );
}
