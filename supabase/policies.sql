
-- Habilita a Segurança de Nível de Linha (RLS) para a tabela de clientes
-- Isso garante que as políticas que definirmos abaixo sejam aplicadas.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Remove qualquer política antiga de "INSERT" para garantir um estado limpo.
-- O 'IF EXISTS' evita erros se a política não existir.
DROP POLICY IF EXISTS "Public clients are insertable" ON public.clients;

-- Cria uma nova política que permite a qualquer pessoa (usuário anônimo/público)
-- inserir um novo registro na tabela de clientes.
-- A cláusula 'USING (true)' significa que esta política se aplica a todas as tentativas de inserção.
CREATE POLICY "Public clients are insertable"
ON public.clients
FOR INSERT
WITH CHECK (true);


-- Remove qualquer política antiga de "SELECT" para garantir um estado limpo.
DROP POLICY IF EXISTS "Public clients are viewable by everyone" ON public.clients;

-- Cria uma nova política que permite a qualquer pessoa (usuário anônimo/público)
-- visualizar (ler) todos os registros na tabela de clientes.
-- A cláusula 'USING (true)' significa que esta política se aplica a todas as tentativas de leitura.
CREATE POLICY "Public clients are viewable by everyone"
ON public.clients
FOR SELECT
USING (true);

