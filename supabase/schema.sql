-- Tabela de Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    document VARCHAR(50) UNIQUE,
    client_type VARCHAR(50) NOT NULL,
    frequent_services TEXT,
    internal_notes TEXT,
    registration_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    company VARCHAR(255),
    responsable VARCHAR(255),
    segment VARCHAR(100),
    avatar_url TEXT
);

-- Tabela de Perfis de Usuários (para dados públicos)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Tabela de Propostas
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    service_description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    ai_generated_draft TEXT,
    assigned_to UUID REFERENCES auth.users(id)
);

-- Tabela de Ordens de Serviço
CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    service_type TEXT NOT NULL,
    products_used TEXT,
    execution_deadline DATE,
    service_value NUMERIC(10, 2),
    status VARCHAR(50) NOT NULL,
    assigned_to UUID REFERENCES auth.users(id)
);

-- Tabela de Faturas
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50)
);

-- Tabela de Itens da Fatura
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL
);

-- Tabela de Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(100) NOT NULL, -- Ex: 'Novo Lead', 'Qualificação', etc.
    source VARCHAR(100),
    assigned_to UUID REFERENCES auth.users(id),
    last_contacted_at TIMESTAMPTZ,
    notes TEXT
);

-- Gatilho para manter a coluna `updated_at` atualizada
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_proposals_update
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_service_orders_update
BEFORE UPDATE ON service_orders
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();

-- Gatilho para criar um perfil de usuário quando um novo usuário se registra no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- Habilitar RLS (Row Level Security) para as tabelas principais
-- ATENÇÃO: As políticas concretas devem ser adicionadas conforme a lógica de negócio.
-- Por padrão, nenhuma linha será acessível após habilitar RLS sem políticas.
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Exemplo (PERMISSIVAS - AJUSTE PARA PRODUÇÃO)
-- Permite que usuários autenticados leiam todos os clientes.
CREATE POLICY "Allow authenticated users to read clients" ON clients FOR SELECT TO authenticated USING (true);
-- Permite que usuários insiram novos clientes.
CREATE POLICY "Allow authenticated users to insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
-- Permite que o dono do registro ou um admin o atualize/delete.
CREATE POLICY "Allow owner to update or delete clients" ON clients FOR UPDATE USING (auth.uid() = (SELECT user_id FROM proposals WHERE client_id = id LIMIT 1)); -- Exemplo complexo, idealmente haveria um campo owner_id
CREATE POLICY "Allow owner to delete clients" ON clients FOR DELETE USING (auth.uid() = (SELECT user_id FROM proposals WHERE client_id = id LIMIT 1));

-- Permite que usuários vejam seu próprio perfil.
CREATE POLICY "Allow users to view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Permite que usuários atualizem seu próprio perfil.
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
