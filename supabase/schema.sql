-- supabase/schema.sql

-- Habilita a extensão pgcrypto se ainda não estiver habilitada
create extension if not exists "pgcrypto" with schema "extensions";

-- Cria a tabela de clientes (clients)
create table if not exists public.clients (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    name text not null,
    email text not null,
    phone text null,
    address text null,
    document text null,
    client_type text not null,
    frequent_services text null,
    internal_notes text null,
    registration_date date not null,
    status text not null,
    company text null,
    responsable text null,
    segment text null,
    avatar_url text null
);

comment on table public.clients is 'Armazena informações sobre os clientes da empresa.';

-- Cria a tabela de propostas (proposals)
create table if not exists public.proposals (
    id uuid default gen_random_uuid() primary key,
    client_id uuid null references public.clients(id) on delete set null,
    client_name text not null,
    service_description text not null,
    amount numeric not null,
    currency text not null default 'BRL',
    deadline date not null,
    status text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    ai_generated_draft text null,
    assigned_to uuid null -- references auth.users(id) on delete set null (adicionar quando auth estiver configurado)
);

comment on table public.proposals is 'Armazena as propostas comerciais enviadas aos clientes.';

-- Cria a tabela de faturas (invoices)
create table if not exists public.invoices (
    id uuid default gen_random_uuid() primary key,
    client_id uuid not null references public.clients(id) on delete cascade,
    proposal_id uuid null references public.proposals(id) on delete set null,
    invoice_number text not null,
    amount numeric not null,
    status text not null,
    due_date date not null,
    paid_date date null,
    payment_method text null,
    created_at timestamp with time zone not null default now()
);

comment on table public.invoices is 'Registra as faturas emitidas para os clientes.';

-- Cria a tabela de itens da fatura (invoice_items)
create table if not exists public.invoice_items (
    id uuid default gen_random_uuid() primary key,
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    description text not null,
    quantity numeric not null,
    unit_price numeric not null,
    total numeric not null
);

comment on table public.invoice_items is 'Detalha os itens individuais de cada fatura.';

-- Cria a tabela de leads
create table if not exists public.leads (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text null,
    phone text null,
    company text null,
    status text not null,
    source text null,
    assigned_to uuid null, -- references auth.users(id) on delete set null (adicionar quando auth estiver configurado)
    last_contacted_at timestamp with time zone null,
    notes text null,
    created_at timestamp with time zone not null default now()
);

comment on table public.leads is 'Gerencia os leads e prospects do funil de vendas.';

-- Cria a tabela de ordens de serviço (service_orders)
create table if not exists public.service_orders (
    id uuid default gen_random_uuid() primary key,
    order_number text not null,
    client_id uuid not null references public.clients(id) on delete cascade,
    service_type text not null,
    status text not null,
    products_used text null,
    service_value numeric null,
    execution_deadline timestamp with time zone null,
    assigned_to uuid null, -- references auth.users(id) on delete set null (adicionar quando auth estiver configurado)
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

comment on table public.service_orders is 'Controla as ordens de serviço para os clientes.';

-- Cria a tabela de perfis de usuário (profiles) - para complementar auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade not null,
  updated_at timestamp with time zone,
  username text,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

comment on table public.profiles is 'Armazena dados públicos do perfil para cada usuário.';

-- Configura RLS (Row Level Security) para a tabela de perfis
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
