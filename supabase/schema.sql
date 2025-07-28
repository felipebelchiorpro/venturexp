
-- ========== TABELAS ENUM E TIPOS PERSONALIZADOS ==========

CREATE TYPE public.user_role AS ENUM ('Admin', 'Executive', 'Manager', 'Member', 'Analyst');
CREATE TYPE public.team_member_status AS ENUM ('Active', 'Pending Invitation', 'Inactive');
CREATE TYPE public.client_status AS ENUM ('Ativo', 'Inativo', 'Potencial');
CREATE TYPE public.client_type AS ENUM ('Pessoa Física', 'Pessoa Jurídica');
CREATE TYPE public.proposal_status AS ENUM ('Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Arquivada');
CREATE TYPE public.invoice_status AS ENUM ('Pendente', 'Paga', 'Atrasada', 'Cancelada');
CREATE TYPE public.payment_method AS ENUM ('Cartão de Crédito', 'PIX', 'Dinheiro');
CREATE TYPE public.payment_condition AS ENUM ('À vista', 'Parcelado');
CREATE TYPE public.service_order_status AS ENUM ('Aberta', 'Em Andamento', 'Finalizada', 'Aguardando Peças', 'Aguardando Aprovação', 'Cancelada');
CREATE TYPE public.access_status AS ENUM ('Ativo', 'Inativo', 'Aguardando Ativação');

-- ========== TABELAS PRINCIPAIS ==========

-- Tabela de Perfis de Usuários (ligada ao auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'Member'::public.user_role,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  company TEXT,
  phone TEXT,
  status client_status DEFAULT 'Ativo'::public.client_status,
  responsable TEXT,
  segment TEXT,
  address TEXT,
  document TEXT,
  client_type client_type,
  frequent_services TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  registration_date TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Propostas
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL, -- Mantido para simplicidade, mesmo com client_id
  service_description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  deadline TIMESTAMPTZ,
  status proposal_status DEFAULT 'Rascunho'::public.proposal_status,
  ai_generated_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Leads (Funil de Vendas)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL, -- Ex: 'Novo Lead', 'Qualificação', etc.
  source TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_contacted TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Ordens de Serviço
CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  contact_phone TEXT,
  service_address TEXT,
  service_type TEXT NOT NULL,
  products_used TEXT,
  creation_date TIMESTAMPTZ DEFAULT NOW(),
  execution_deadline TIMESTAMPTZ,
  service_value NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'BRL',
  additional_notes TEXT,
  status service_order_status DEFAULT 'Aberta'::public.service_order_status,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Tabela de Faturas
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  status invoice_status DEFAULT 'Pendente'::public.invoice_status,
  payment_method payment_method,
  payment_condition payment_condition,
  installments TEXT,
  notes TEXT
);

-- Tabela de Itens da Fatura
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL
);

-- Tabela de Perfis de Acesso (para controle de permissões)
CREATE TABLE public.access_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB, -- Ex: {"clients": ["read", "create"], "proposals": ["read"]}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Membros da Equipe (associação entre usuário e perfil de acesso)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_profile_id UUID NOT NULL REFERENCES public.access_profiles(id) ON DELETE RESTRICT,
  status team_member_status DEFAULT 'Active'::public.team_member_status,
  joined_date TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FUNÇÕES HELPER (Ex: para atualizar 'updated_at') ==========

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== TRIGGERS ==========

-- Trigger para criar um perfil quando um novo usuário se cadastra no Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para auto-atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
