/**
 * Upload Screen — Upload a call recording for scam analysis.
 * Supports audio file upload with drag-and-drop, displays transcript
 * and threat analysis results.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileAudio,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { analyzeAudioFile } from "@/services/audioAnalysis.functions";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Recording — VoxShield AI" },
      { name: "description", content: "Upload a call recording for AI-powered scam analysis." },
    ],
  }),
  component: UploadPage,
});

/** Max file size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/webm", "audio/m4a", "audio/mp4", "audio/x-m4a"];

interface AnalysisResult {
  riskScore: number;
  category: string;
  explanation: string;
  suggestion: string;
  transcript: string;
  timestamp: string;
  fileName: string;
}

function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  /** Validate and set file */
  const handleFile = useCallback((f: File) => {
    setError(null);
    setResult(null);

    if (f.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Accept any audio type
    if (!f.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, OGG, M4A, WebM).");
      return;
    }

    setFile(f);
  }, []);

  /** Drag handlers */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  /** File input change */
  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  /** Convert file to base64 and analyze */
  const handleAnalyze = useCallback(async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(10);
    setStatusText("Reading audio file...");

    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // Strip the data:audio/xxx;base64, prefix
          const base64Data = dataUrl.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setProgress(30);
      setStatusText("Transcribing audio with AI...");

      // Send to server for transcription + analysis
      const analysisResult = await analyzeAudioFile({
        data: {
          audioBase64: base64,
          mimeType: file.type || "audio/mpeg",
          fileName: file.name,
        },
      });

      setProgress(100);
      setStatusText("Analysis complete!");
      setResult(analysisResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze audio"
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [file]);

  /** Reset state */
  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatusText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-24 pt-8">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-2 flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Upload Recording</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload a call recording to analyze for scam threats
        </p>
      </motion.div>

      {/* Results View */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            className="mt-8 w-full max-w-sm space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Risk Score */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <RiskScoreGauge score={result.riskScore} />
                <div className="flex items-center gap-2">
                  {result.riskScore > 70 ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                  <span className="font-semibold">{result.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Explanation */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                  ANALYSIS
                </h3>
                <p className="text-sm leading-relaxed">{result.explanation}</p>
              </CardContent>
            </Card>

            {/* Suggestion */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                  RECOMMENDATION
                </h3>
                <p className="text-sm leading-relaxed">{result.suggestion}</p>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                  TRANSCRIPT
                </h3>
                <p className="max-h-40 overflow-y-auto text-sm leading-relaxed text-muted-foreground">
                  {result.transcript}
                </p>
              </CardContent>
            </Card>

            {/* File info */}
            <p className="text-center text-xs text-muted-foreground">
              File: {result.fileName} · {result.timestamp.split("T")[0]}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Upload Another
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  navigate({
                    to: result.riskScore > 70 ? "/alert" : "/safe",
                    search: {
                      score: result.riskScore,
                      explanation: result.explanation,
                      suggestion: result.suggestion,
                    },
                  })
                }
              >
                View Details
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            className="mt-8 w-full max-w-sm space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Drop Zone */}
            <Card
              className={`cursor-pointer border-2 border-dashed transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/50 hover:border-primary/30"
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={onFileChange}
                  className="hidden"
                />

                {file ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                      <FileAudio className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                    >
                      <X className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {isDragOver ? "Drop audio file here" : "Tap to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, OGG, M4A, WebM · Max 10MB
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            {isAnalyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm">{statusText}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Analyze Button */}
            {file && !isAnalyzing && (
              <Button
                className="w-full gap-2 font-semibold"
                size="lg"
                onClick={handleAnalyze}
              >
                <Shield className="h-5 w-5" />
                Analyze Recording
              </Button>
            )}

            {/* Or use live monitoring */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate({ to: "/monitoring" })}
            >
              <Mic className="h-4 w-4" />
              Use Live Monitoring
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.p
          className="mt-4 max-w-sm text-center text-sm text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
