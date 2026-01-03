-- Script para criar a tabela profiles no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar a tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'RESIDENT',
    fraction_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de acesso
-- Permitir que usuários autenticados leiam todos os perfis
CREATE POLICY "Usuários autenticados podem ver perfis"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Permitir que administradores façam tudo
CREATE POLICY "Administradores têm acesso total"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
        )
    );

-- 4. Criar trigger para criar perfil automaticamente quando um usuário é criado
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

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Criar perfil para o usuário seo@gestao.com (se já existe no Auth)
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário no Auth
-- Você pode encontrar o ID em: Authentication > Users no Supabase Dashboard

-- Exemplo (descomente e substitua o ID):
-- INSERT INTO public.profiles (id, name, email, role, fraction_code)
-- VALUES (
--     'USER_ID_AQUI',
--     'SEO Admin',
--     'seo@gestao.com',
--     'ADMIN',
--     NULL
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     name = EXCLUDED.name,
--     role = EXCLUDED.role;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_fraction_code ON public.profiles(fraction_code);

-- 7. Comentários na tabela
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema de gestão de condomínios';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência ao auth.users)';
COMMENT ON COLUMN public.profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.profiles.role IS 'Papel do usuário: ADMIN, MANAGER, RESIDENT, STAFF';
COMMENT ON COLUMN public.profiles.fraction_code IS 'Código da fração associada (para residentes)';
