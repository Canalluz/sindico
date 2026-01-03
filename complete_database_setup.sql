-- ========================================
-- SCRIPT COMPLETO DE CRIAÇÃO DE TABELAS
-- Copie e cole este script inteiro no SQL Editor
-- ========================================

-- 1. Frações
create table public.fractions (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  owner_name text,
  nif text,
  permilage numeric,
  monthly_quota numeric,
  status text check (status in ('PAID', 'PENDING', 'LATE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Transações Financeiras (Finance)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('INCOME', 'EXPENSE')),
  category text,
  iva_rate numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Inspeções (Maintenance)
create table public.inspections (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  last_date date,
  next_date date,
  status text check (status in ('OK', 'WARNING', 'EXPIRED', 'COMPLETED', 'CANCELLED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Ocorrências
create table public.occurrences (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text,
  fraction_code text,
  status text check (status in ('OPEN', 'RESOLVED', 'PENDING')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Visitantes (Security)
create table public.visitors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  doc_id text,
  fraction_code text,
  entry_time timestamp with time zone default timezone('utc'::text, now()),
  exit_time timestamp with time zone,
  status text check (status in ('IN', 'OUT')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Áreas Comuns
create table public.common_areas (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  capacity integer,
  price numeric,
  rules text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Reservas (Bookings)
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  area_id uuid references public.common_areas(id),
  fraction_id uuid,
  date date,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Assembleias (NOVA TABELA)
create table public.assemblies (
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

-- 9. Perfis de Usuários (NOVA TABELA - ESSENCIAL PARA LOGIN)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'RESIDENT' check (role in ('ADMIN', 'MANAGER', 'RESIDENT', 'STAFF')),
  fraction_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================

alter table public.fractions enable row level security;
create policy "Public Access" on public.fractions for all using (true);

alter table public.transactions enable row level security;
create policy "Public Access" on public.transactions for all using (true);

alter table public.inspections enable row level security;
create policy "Public Access" on public.inspections for all using (true);

alter table public.occurrences enable row level security;
create policy "Public Access" on public.occurrences for all using (true);

alter table public.visitors enable row level security;
create policy "Public Access" on public.visitors for all using (true);

alter table public.common_areas enable row level security;
create policy "Public Access" on public.common_areas for all using (true);

alter table public.bookings enable row level security;
create policy "Public Access" on public.bookings for all using (true);

alter table public.assemblies enable row level security;
create policy "Public Access" on public.assemblies for all using (true);

-- Políticas de acesso para a tabela profiles
alter table public.profiles enable row level security;

create policy "Usuários autenticados podem ver perfis"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Administradores têm acesso total"
  on public.profiles for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('ADMIN', 'MANAGER')
    )
  );

-- ========================================
-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- ========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'RESIDENT')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ========================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ========================================

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_fraction_code on public.profiles(fraction_code);
create index if not exists idx_fractions_code on public.fractions(code);
create index if not exists idx_occurrences_status on public.occurrences(status);
create index if not exists idx_visitors_status on public.visitors(status);
create index if not exists idx_bookings_date on public.bookings(date);
create index if not exists idx_assemblies_date on public.assemblies(date);

-- ========================================
-- FIM DO SCRIPT
-- ========================================
