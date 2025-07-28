-- supabase/schema.sql

-- Tabela de Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Ativo'::character varying NOT NULL,
    responsable VARCHAR(255),
    segment VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    avatar_url TEXT,
    address TEXT,
    document VARCHAR(50) UNIQUE,
    client_type VARCHAR(50),
    frequent_services TEXT,
    internal_notes TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela de Propostas
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    service_description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL'::character varying NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'Rascunho'::character varying NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ai_generated_draft TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL
);

-- Tabela de Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    assigned_to VARCHAR(255),
    last_contacted TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT
);

-- Tabela de Ordens de Serviço
CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255),
    contact_phone VARCHAR(50),
    service_address TEXT,
    service_type TEXT NOT NULL,
    products_used TEXT,
    creation_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    execution_deadline TIMESTAMPTZ,
    service_value NUMERIC(10, 2),
    currency VARCHAR(10) DEFAULT 'BRL'::character varying,
    additional_notes TEXT,
    status VARCHAR(50) NOT NULL,
    assigned_to VARCHAR(255),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL
);

-- Tabela de Perfis de Acesso
CREATE TABLE access_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaborator_name VARCHAR(255) NOT NULL,
    login_email VARCHAR(255) UNIQUE NOT NULL,
    role_or_function VARCHAR(255) NOT NULL,
    permissions JSONB,
    activate_individual_dashboard BOOLEAN DEFAULT false,
    restrictions JSONB,
    activation_date TIMESTAMPTZ NOT NULL,
    access_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela de Membros da Equipe (para vincular usuários a perfis)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT auth.users (id),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    status VARCHAR(50),
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT,
    access_profile_id UUID REFERENCES access_profiles(id)
);

-- Habilitar Row Level Security (RLS) para todas as tabelas como boa prática
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Exemplos - ajuste conforme necessário)
-- Permitir que usuários logados leiam todos os clientes (exemplo simples)
CREATE POLICY "Allow logged-in users to read clients" ON clients
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários logados insiram clientes
CREATE POLICY "Allow logged-in users to insert clients" ON clients
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Adicione outras políticas conforme a lógica de negócios da sua aplicação.
-- Ex: Permitir que usuários vejam apenas seus próprios leads.
-- CREATE POLICY "Users can see own leads" ON leads
-- FOR SELECT USING (auth.uid() = (SELECT id FROM team_members WHERE email = assigned_to));

