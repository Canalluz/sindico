-- ========================================
-- SCRIPT PARA ADICIONAR APENAS AS TABELAS QUE FALTAM
-- Copie e cole este script no SQL Editor
-- ========================================

-- 1. Criar tabela ASSEMBLIES (se não existir)
CREATE TABLE IF NOT EXISTS public.assemblies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date not null,
  time text,
  location text,
  type text check (type in ('ORDINARY', 'EXTRAORDINARY')),
  status text check (status in ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
  notice_text text,
  minutes_text text,
  resolutions jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criar tabela PROFILES (ESSENCIAL PARA LOGIN)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'RESIDENT' check (role in ('ADMIN', 'MANAGER', 'RESIDENT', 'STAFF')),
  fraction_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- HABILITAR RLS PARA AS NOVAS TABELAS
-- ========================================

-- RLS para assemblies
ALTER TABLE public.assemblies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON public.assemblies;
CREATE POLICY "Public Access" ON public.assemblies FOR ALL USING (true);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON public.profiles;
CREATE POLICY "Usuários autenticados podem ver perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Administradores têm acesso total" ON public.profiles;
CREATE POLICY "Administradores têm acesso total"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ========================================
-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'RESIDENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_fraction_code ON public.profiles(fraction_code);
CREATE INDEX IF NOT EXISTS idx_assemblies_date ON public.assemblies(date);

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Verificar se as tabelas foram criadas:
SELECT 'assemblies' as tabela, COUNT(*) as registros FROM public.assemblies
UNION ALL
SELECT 'profiles' as tabela, COUNT(*) as registros FROM public.profiles;
