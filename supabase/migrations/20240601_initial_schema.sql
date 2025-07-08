-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create designs table
CREATE TABLE IF NOT EXISTS designs_pf7b3x9c4k (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL,
  background_color TEXT,
  canvas_json JSONB,
  thumbnail_url TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE designs_pf7b3x9c4k ENABLE ROW LEVEL SECURITY;

-- Secure the tables
CREATE POLICY "Users can read their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Design policies
CREATE POLICY "Users can read their own designs" 
  ON designs_pf7b3x9c4k FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs" 
  ON designs_pf7b3x9c4k FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs" 
  ON designs_pf7b3x9c4k FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs" 
  ON designs_pf7b3x9c4k FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();