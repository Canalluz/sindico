-- Script para adicionar o perfil do usuário seo@gestao.com
-- Execute este script DEPOIS de executar setup_profiles_table.sql

-- PASSO 1: Primeiro, encontre o ID do usuário seo@gestao.com
-- Vá em: Authentication > Users no Supabase Dashboard
-- Copie o UUID do usuário seo@gestao.com

-- PASSO 2: Substitua 'SEU_USER_ID_AQUI' pelo UUID copiado e execute:

INSERT INTO public.profiles (id, name, email, role, fraction_code)
VALUES (
    'SEU_USER_ID_AQUI',  -- ⚠️ SUBSTITUA PELO ID REAL DO USUÁRIO
    'SEO Admin',
    'seo@gestao.com',
    'ADMIN',
    NULL
)
ON CONFLICT (id) DO UPDATE SET
    name = 'SEO Admin',
    role = 'ADMIN',
    updated_at = NOW();

-- Verificar se o perfil foi criado corretamente:
SELECT * FROM public.profiles WHERE email = 'seo@gestao.com';
