
CREATE TABLE public.nexa_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile JSONB NOT NULL,
  ai_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nexa_saves TO authenticated;
GRANT ALL ON public.nexa_saves TO service_role;

ALTER TABLE public.nexa_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own save"
  ON public.nexa_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_nexa_saves_updated_at
  BEFORE UPDATE ON public.nexa_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
