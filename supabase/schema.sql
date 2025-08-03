-- Apaga tabelas antigas se existirem para uma nova configuração limpa
drop table if exists "public"."invoice_items";
drop table if exists "public"."invoices";
drop table if exists "public"."service_orders";
drop table if exists "public"."proposals";
drop table if exists "public"."products";
drop table if exists "public"."leads";
drop table if exists "public"."clients";
drop table if exists "public"."profiles";

-- Tabela de Clientes
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    document text,
    client_type text NOT NULL,
    frequent_services text,
    internal_notes text,
    registration_date date NOT NULL,
    status text NOT NULL,
    company text,
    responsable text,
    segment text,
    avatar_url text
);
COMMENT ON TABLE public.clients IS 'Tabela para armazenar informações dos clientes.';

-- Tabela de Leads
CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    company text,
    email text,
    phone text,
    status text NOT NULL,
    source text,
    notes text,
    assigned_to uuid,
    last_contacted_at timestamp with time zone
);
COMMENT ON TABLE public.leads IS 'Armazena leads de vendas e seu progresso no funil.';

-- Tabela de Produtos/Serviços
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    category text,
    sku text,
    stock_quantity integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.products IS 'Catálogo de produtos e serviços oferecidos.';

-- Tabela de Propostas
CREATE TABLE public.proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    client_name text NOT NULL,
    service_description text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'BRL'::text NOT NULL,
    deadline date NOT NULL,
    status text NOT NULL,
    ai_generated_draft text,
    client_id uuid,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.proposals IS 'Armazena propostas comerciais enviadas aos clientes.';

-- Tabela de Ordens de Serviço
CREATE TABLE public.service_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    order_number text NOT NULL,
    client_id uuid NOT NULL,
    service_type text NOT NULL,
    status text NOT NULL,
    products_used text,
    service_value numeric,
    execution_deadline date,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.service_orders IS 'Gerencia as ordens de serviço para os clientes.';

-- Tabela de Faturas
CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    invoice_number text NOT NULL,
    client_id uuid NOT NULL,
    proposal_id uuid,
    amount numeric NOT NULL,
    status text NOT NULL,
    due_date date NOT NULL,
    paid_date date,
    payment_method text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.invoices IS 'Armazena informações de faturamento.';

-- Tabela de Itens da Fatura
CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    invoice_id uuid NOT NULL,
    description text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    total numeric NOT NULL
);
COMMENT ON TABLE public.invoice_items IS 'Detalha os itens dentro de cada fatura.';

-- Tabela de Perfis de Usuário
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    updated_at timestamp with time zone,
    username text,
    full_name text,
    avatar_url text,
    website text,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);
COMMENT ON TABLE public.profiles IS 'Armazena dados de perfil para usuários autenticados.';

-- Adicionando Foreign Keys
ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.service_orders ADD CONSTRAINT service_orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.service_orders ADD CONSTRAINT service_orders_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE SET NULL;
ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitando Row Level Security (RLS) para todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- Permitir que usuários logados leiam/escrevam em seus próprios dados ou em todos os dados.
-- (Esta é uma política simples. Uma aplicação multi-tenant real precisaria de uma coluna 'organization_id')

CREATE POLICY "Allow all access for authenticated users" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.proposals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.service_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access for authenticated users" ON public.invoice_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow logged-in users to view and edit their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Função para lidar com a atualização da coluna `updated_at`
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Triggers para `updated_at`
create trigger on_proposals_updated
  before update on public.proposals
  for each row execute procedure public.handle_updated_at();

create trigger on_service_orders_updated
  before update on public.service_orders
  for each row execute procedure public.handle_updated_at();

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Seed de dados iniciais (opcional, mas recomendado)
-- Você pode adicionar alguns produtos aqui para começar
-- INSERT INTO public.products (name, price, category, description) VALUES
-- ('Instalação de Câmera de Segurança', 350.00, 'Segurança', 'Instalação completa de uma unidade de câmera de segurança.'),
-- ('Manutenção de Ar Condicionado', 150.00, 'Manutenção', 'Limpeza e verificação de sistema de ar condicionado split.');
