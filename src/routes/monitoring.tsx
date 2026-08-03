/**
 * Monitoring Screen — Live listening UI with waveform animation.
 * Captures speech, sends to API, and navigates to Alert or Safe screen.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WaveformAnimation } from "@/components/WaveformAnimation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { analyzeTranscript } from "@/services/apiService";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring — VoxShield AI" },
      { name: "description", content: "Live call monitoring and scam detection." },
    ],
  }),
  component: MonitoringPage,
});

function MonitoringPage() {
  const navigate = useNavigate();
  const { transcript, isListening, error, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /** Analyze the captured transcript */
  const handleAnalyze = useCallback(async () => {
    if (!transcript.trim()) return;

    setIsAnalyzing(true);
    setApiError(null);
    stopListening();

    try {
      const result = await analyzeTranscript(transcript.trim());

      // Navigate based on risk score threshold
      if (result.riskScore > 70) {
        navigate({
          to: "/alert",
          search: {
            score: result.riskScore,
            explanation: result.explanation,
            suggestion: result.suggestion,
          },
        });
      } else {
        navigate({
          to: "/safe",
          search: {
            score: result.riskScore,
            explanation: result.explanation,
          },
        });
      }
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to analyze transcript"
      );
      setIsAnalyzing(false);
    }
  }, [transcript, stopListening, navigate]);

  // Auto-analyze after 10 seconds of captured speech
  useEffect(() => {
    if (transcript.length > 200 && isListening) {
      handleAnalyze();
    }
  }, [transcript, isListening, handleAnalyze]);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-24 pt-8">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Call Monitor</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isListening ? "Listening to your call..." : "Tap the mic to start"}
        </p>
      </motion.div>

      {/* Waveform Visualization */}
      <div className="my-8 w-full max-w-sm">
        <Card className="border-border/50 bg-card/50 overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 p-6">
            <WaveformAnimation isActive={isListening} />

            {/* Mic Toggle Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className="h-16 w-16 rounded-full p-0"
                onClick={isListening ? stopListening : startListening}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : isListening ? (
                  <MicOff className="h-7 w-7" />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </Button>
            </motion.div>

            <span className="text-xs text-muted-foreground">
              {isAnalyzing
                ? "Analyzing transcript..."
                : isListening
                  ? "Tap to stop"
                  : "Tap to start monitoring"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  LIVE TRANSCRIPT
                </span>
                <button
                  onClick={resetTranscript}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
              <p className="max-h-32 overflow-y-auto text-sm leading-relaxed">
                {transcript}
              </p>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          {!isAnalyzing && transcript.trim().length > 10 && (
            <Button
              className="mt-4 w-full font-semibold"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              Analyze Now
            </Button>
          )}
        </motion.div>
      )}

      {/* Error Display */}
      {(error || apiError) && (
        <motion.p
          className="mt-4 text-sm text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error || apiError}
        </motion.p>
      )}
    </div>
  );
}
