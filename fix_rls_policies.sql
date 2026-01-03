-- ========================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- Copie e cole este script no SQL Editor
-- ========================================

-- 1. Remover TODAS as políticas antigas da tabela profiles
DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Administradores têm acesso total" ON public.profiles;
DROP POLICY IF EXISTS "Public Access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas SIMPLES sem recursão

-- Permitir que todos os usuários autenticados vejam todos os perfis
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que usuários insiram apenas seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Permitir que usuários deletem apenas seu próprio perfil
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
