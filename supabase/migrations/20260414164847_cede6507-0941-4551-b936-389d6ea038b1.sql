CREATE TABLE public.detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transcript TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert detections"
  ON public.detections
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read detections"
  ON public.detections
  FOR SELECT
  USING (true);

CREATE INDEX idx_detections_created_at ON public.detections (created_at DESC);