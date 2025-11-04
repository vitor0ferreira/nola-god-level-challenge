# 📖 Arquitetura e Decisões Técnicas: Nola God Level Challenge

Este documento descreve as tecnologias, a arquitetura e as funcionalidades implementadas neste projeto, que visa resolver o problema de análise de dados para donos de restaurantes.

## 1. Tecnologias Utilizadas

O projeto é dividido em dois ecossistemas principais: o ambiente de dados (Docker/Python) e a aplicação web (Next.js/Prisma).

### Aplicação Principal (Monorepo `apps/frontend`)

* **Framework Full-stack:** [Next.js](https://nextjs.org/) (com React 19)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Banco de Dados (ORM):** [Prisma](https://www.prisma.io/) (conectado ao Postgres)
* **Data Fetching (Client-side):** [SWR](https://swr.vercel.app/) (para caching e revalidação de dados em tempo real)
* **UI (Componentes):** [shadcn/ui](https://ui.shadcn.com/) (construído sobre Radix UI e Tailwind CSS)
* **Visualização de Dados:** [Recharts](https://recharts.org/) (para gráficos dinâmicos)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Validação de Schema:** [Zod](https://zod.dev/) (usado nas rotas de API)
* **Ícones:** [Lucide React](https://lucide.dev/)

### Ambiente de Dados e Geração

* **Containerização:** [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
* **Banco de Dados:** [PostgreSQL 15](https://www.postgresql.org/)
* **Scripting de Dados:** [Python 3.11](https://www.python.org/)
* **Bibliotecas Python:** `psycopg2-binary` (para conectar ao Postgres) e `Faker` (para geração de dados massivos)

---

## 2. Decisões Técnicas e Arquitetura

1.  **Monorepo com NPM Workspaces:**
    O projeto está estruturado como um monorepo gerenciado pelo `npm workspaces`. A aplicação (`apps/frontend`) é mantida em um workspace, permitindo o compartilhamento de configurações e facilitando a instalação de dependências com um único `npm install` na raiz.

2.  **Arquitetura "Backend-for-Frontend" (BFF):**
    A aplicação Next.js atua como um sistema full-stack. O frontend (React Server Components e Client Components em `app/page.tsx`) consome dados de suas próprias rotas de API (`app/api/*`). Essas rotas de API, por sua vez, usam o Prisma para se comunicar com o banco de dados. Isso simplifica a arquitetura, elimina a necessidade de um servidor backend separado e melhora a segurança (nenhuma credencial de banco é exposta ao cliente).

3.  **Geração Dinâmica de SQL (O Coração do Desafio):**
    Para atender ao requisito principal de "analytics customizável", a decisão foi **não** usar o ORM para queries complexas. Em vez disso, o `query-builder-helpers.ts` constrói dinamicamente strings de SQL `raw` (SQL puro) com base nas métricas e dimensões selecionadas pelo usuário no `QueryBuilder`. Essas queries são executadas com segurança usando `prisma.$queryRawUnsafe`, o que oferece performance máxima e flexibilidade total de queries, algo que seria difícil ou impossível de alcançar com o ORM puro.

4.  **Data Fetching Otimizado com SWR:**
    O frontend utiliza `useSWR` para buscar dados das rotas de API. Isso oferece uma excelente experiência ao usuário, pois os dados são cacheados e revalidados automaticamente, o que torna a navegação entre filtros e focos de análise quase instantânea após o primeiro carregamento.

5.  **Ambiente de Dados Reprodutível com Docker:**
    O banco de dados e a geração de dados são totalmente containerizados. O `docker-compose.yml` orquestra:
    * Um serviço `postgres` que usa o schema de `database-schema.sql`.
    * Um serviço `data-generator` que aguarda o banco ficar pronto e, em seguida, executa o `generate_data.py` para popular 500k+ de vendas realistas, simulando o ambiente do desafio.

6.  **Prisma Accelerate:**
    O projeto está configurado para usar o `Prisma Accelerate`, uma decisão que visa a performance em produção. Ele fornece um pool de conexões de banco de dados gerenciado, o que é crucial em ambientes Serverless (como a Vercel, onde as rotas de API do Next.js são executadas) para evitar a exaustão de conexões do banco.

---

## 3. Funcionalidades (Features) Implementadas

A plataforma permite que o usuário (como a "Maria", dona do restaurante) explore seus dados de forma intuitiva.

* **Dashboard Principal (`page.tsx`)**:
    * **KPIs Principais:** Exibe os cartões de "Faturamento Total", "Ticket Médio" e "Total de Pedidos" com indicadores de tendência (alta ou baixa) em comparação com o período anterior.
    * **Insights Automáticos:** Analisa os dados e apresenta insights acionáveis em linguagem natural, como "Faturamento em alta" ou "Canal X precisa de atenção".

* **Filtros Globais e Contextuais (`SecondaryFilters`)**:
    * Permite ao usuário filtrar todos os dados do dashboard por **Período** (Hoje, Últimos 7 dias, etc.).
    * Filtros contextuais de **Loja** (multi-seleção), **Canal** e **Produto** aparecem dependendo do foco da análise.

* **Foco de Análise (`AnalysisFocusSidebar`)**:
    Permite ao usuário mudar o contexto do dashboard para se aprofundar em áreas específicas:
    * **Visão Geral:** Panorama do negócio com evolução de faturamento e divisão por canal/loja.
    * **Lojas:** Compara a performance entre lojas e mostra os top produtos da(s) loja(s) selecionada(s).
    * **Produtos:** Exibe um ranking detalhado dos produtos mais vendidos.
    * **Canais de Venda:** Foca na performance de Delivery vs. Presencial.
    * **Análise Temporal:** Mostra padrões de vendas por hora do dia e dia da semana.
    * **Clientes:** (Estrutura pronta para análise de comportamento de clientes).

* **Construtor de Visualizações (`QueryBuilder`)**:
    * **Feature Core:** Esta é a funcionalidade principal que resolve o desafio.
    * Permite que o usuário **crie seu próprio gráfico** selecionando:
        1.  **Uma Métrica:** (O que medir? Ex: Faturamento, Pedidos, Ticket Médio).
        2.  **Uma Dimensão:** (Como agrupar? Ex: Por Loja, Por Dia da Semana, Por Produto).
        3.  **Um Tipo de Gráfico:** (Barras, Linha ou Pizza).
    * Ao clicar em "Gerar Visualização", o frontend envia essa configuração para a API (`/api/query`), que constrói a query SQL dinamicamente e retorna os dados para o `DynamicChart`.
---

## 4. Fluxo de Dados (Exemplo: Análise Customizada)

Para ilustrar como as partes se conectam, este é o fluxo de dados quando um usuário cria uma visualização personalizada:

1.  **UI (Frontend):** O usuário seleciona "Ticket Médio" (métrica) e "Por Dia da Semana" (dimensão) no componente `QueryBuilder` e clica em "Gerar Visualização".
2.  **Estado (Frontend):** O `page.tsx` captura essa mudança e atualiza seu estado `customQuery`. Esta mudança de estado faz com que o hook `useSWR` recalcule a URL da API.
3.  **Fetch (Frontend):** O SWR usa o `fetcher` para fazer uma requisição GET para a URL construída, algo como: `/api/query?metric=ticket&dimension=weekday&startDate=...`
4.  **API Route (Backend):** O endpoint `/api/query/route.ts` recebe a requisição.
5.  **Validação (Backend):** Os parâmetros (`metric`, `dimension`, etc.) são validados usando Zod para garantir que são valores esperados.
6.  **SQL Builder (Backend):** O `query-builder-helpers.ts` é chamado. Ele mapeia "ticket" para `AVG(s.total_amount)` e "weekday" para `EXTRACT(ISODOW FROM s.created_at)`, construindo dinamicamente uma query SQL raw.
7.  **Banco de Dados (Backend):** A API executa a query SQL pura no PostgreSQL usando `prisma.$queryRawUnsafe`.
8.  **Serialização (Backend):** A resposta do banco (que pode incluir tipos `Decimal` ou `BigInt`) é serializada para um JSON seguro usando `serializePrismaData`.
9.  **Resposta (Frontend):** O JSON é retornado ao SWR, que o disponibiliza para o componente `DynamicChart`, renderizando o gráfico de ticket médio por dia da semana para o usuário.

## 5. Estrutura da API (Endpoints)

A aplicação expõe um conjunto de endpoints de API para alimentar o dashboard:

* **`/api/kpis`**: Retorna os KPIs principais (Faturamento, Pedidos, Ticket Médio, Descontos, Cancelados) para o período filtrado.
* **`/api/filters`**: Retorna as listas de Lojas, Canais e Produtos disponíveis para popular os menus de filtro.
* **`/api/sales-timeseries`**: Retorna dados de receita agregados por dia, semana ou mês, usado no gráfico de "Evolução do Faturamento".
* **`/api/ranking/products`**: Fornece uma lista dos produtos mais vendidos, ordenados por receita ou quantidade.
* **`/api/distribution/channel`**: Retorna a receita e o número de vendas agrupados por canal (iFood, Rappi, etc.).
* **`/api/meta/last-date`**: Um endpoint de metadados que retorna a data da última venda registrada no banco. Isso é usado para ajustar dinamicamente o filtro de período, garantindo que o usuário não analise dias futuros sem dados.
* **`/api/query`**: O endpoint principal para o `QueryBuilder`. Ele é flexível e constrói a query SQL com base nos parâmetros `metric` e `dimension` recebidos.

## 6. Resolvendo as "Dores da Maria" (PROBLEMA.md)

O design da solução foi focado em resolver diretamente as perguntas de negócio listadas no `PROBLEMA.md`.

* **"Qual produto vende mais na quinta à noite no iFood?"**
    * **Solução:** O `QueryBuilder` (Métrica: Quantidade, Dimensão: Produto) + Foco de Análise Temporal (Dimensão: Hora do Dia e Dia da Semana) + Filtro de Canal (iFood). O usuário pode cruzar essas informações para obter a resposta.

* **"Meu ticket médio está caindo. É por canal ou por loja?"**
    * **Solução:** O `QueryBuilder`.
        1.  Métrica: `Ticket Médio`, Dimensão: `Por Canal`.
        2.  Métrica: `Ticket Médio`, Dimensão: `Por Loja`.
    * A comparação com o período anterior nos KPIs e os Insights Automáticos ajudam a identificar essa queda automaticamente.

* **"Meu tempo de entrega piorou. Em quais dias/horários?"**
    * **Solução:** O `QueryBuilder`. Métrica: `Tempo de Entrega`, Dimensão: `Por Dia da Semana` ou `Por Hora do Dia`.

* **"Quais clientes compraram 3+ vezes...?"**
    * **Solução:** Embora o frontend não tenha um relatório específico para *esta* pergunta, o schema do banco (`customers` e `sales`) suporta essa análise. O Foco de Análise "Clientes" é o local designado para esta funcionalidade futura.

* **"Quais produtos têm menor margem...?"**
    * **Solução:** Similar ao anterior. O schema `products` não inclui `custo`, então a *margem* não pode ser calculada. No entanto, a análise de "Top Produtos" por receita e volume é o primeiro passo para essa análise.

## 7. Pontos de Melhoria e Próximos Passos

* **Custo e Margem:** Adicionar um campo `cost` (custo) na tabela `products` permitiria o cálculo de margem, habilitando métricas financeiras mais profundas.
* **Análise de Clientes (RFV):** Implementar a seção "Clientes" com análises de Recência, Frequência e Valor (RFV).
* **Cache de Queries:** As queries `raw` mais pesadas (especialmente do `QueryBuilder`) poderiam ser cacheadas na camada de API (ex: com Redis) ou no próprio banco usando Views Materializadas, em vez de depender apenas do cache do SWR no cliente.
* **Testes:** Adicionar testes unitários para o `query-builder-helpers.ts` e testes de integração para os endpoints da API seria crucial para a estabilidade.

# 🚀 Como Rodar o Projeto

Existem duas formas de rodar este projeto: um script automatizado (recomendado) ou um
passo a passo manual.

## Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua
máquina:

```
● Git
● Docker e Docker Compose
● Node.js (v18 ou superior)
● npm (geralmente instalado com o Node.js)
```
## Opção 1: Script Automatizado (Recomendado)

Este método irá configurar o banco de dados, popular os dados, instalar as dependências do frontend e iniciar o servidor de desenvolvimento com um único comando.

1. **Clone o repositório:**
```
    git clone https://github.com/vitor0ferreira/nola-god-level-challenge.git
    cd nola-god-level-challenge/nola-god-level-challenge-main
```
2. Crie o script startup.sh:
    Crie um arquivo chamado startup.sh na raiz do projeto (em nola-god-level-challenge-main/) e cole o seguinte conteúdo nele:
```
    #!/bin/bash
    # Script para configurar e iniciar o ambiente completo do Nola God Level Challenge.

# Para o script se um comando falhar
set -e

echo "--- 1. Parando e removendo containers antigos do projeto (se existirem)..."
docker compose down -v --remove-orphans

echo "--- 2. Construindo o container do gerador de dados..."
docker compose build --no-cache data-generator

echo "--- 3. Iniciando o banco de dados PostgreSQL em background..."
docker compose up -d postgres

echo "--- 4. Aguardando o banco de dados (godlevel-db) ficar pronto..."
# Espera até que o health check do 'postgres' no docker-compose.yml passe
until [ "$(docker inspect -f {{.State.Health.Status}} godlevel-db 2>/dev/null)" == "healthy"
]; do
echo -n "."
sleep 2
done
echo "\nBanco de dados está pronto!"

echo "--- 5. Gerando os dados... (Isso pode levar de 5 a 15 minutos)"
docker compose run --rm data-generator

echo "--- 6. Instalando dependências do projeto (root e workspace frontend)..."
npm install

echo "--- 7. Criando arquivo .env para o frontend em apps/frontend/.env..."
# O docker-compose.yml expõe a porta 5432 para o localhost
echo
"DATABASE_URL=postgresql://challenge:challenge_2024@localhost:5432/challenge_db"
> apps/frontend/.env
echo "Arquivo .env criado."

echo "--- 8. Gerando o Prisma Client para o frontend..."
npx prisma generate --schema=./apps/frontend/prisma/schema.prisma

echo "--- 9. Iniciando o servidor de desenvolvimento do frontend (Next.js)..."
echo "---"
echo "--- ✅ Ambiente pronto! ---"
echo "--- Acesse o dashboard em: http://localhost:3000 ---"
echo "---"

npm run dev
```
3. **Dê permissão de execução ao script:**
```
    chmod +x startup.sh
```
4. **Execute o script:**
```
    ./startup.sh
```

Ao final do processo, o script iniciará o servidor do frontend. Basta acessar **[http://localhost:3000](http://localhost:3000)** no seu navegador.


## Opção 2: Passo a Passo Manual

Se preferir fazer a instalação manualmente, siga estas etapas:

1. **Clone o repositório:**
```
    git clone
    [https://github.com/vitor0ferreira/nola-god-level-challenge.git](https://github.com/vitor0f
    erreira/nola-god-level-challenge.git)
    cd nola-god-level-challenge/nola-god-level-challenge-main
```
2. Inicie o Banco de Dados:
    Abra um terminal e rode o docker-compose para iniciar o Postgres. O healthcheck
    garantirá que ele esteja pronto.
```
    docker compose up -d postgres
```

Aguarde cerca de 30 segundos até o banco de dados estar totalmente operacional.

3. Gere os Dados:
    Em outro terminal, execute o serviço data-generator para popular o banco.
    (Este passo pode levar de 5 a 15 minutos).
```
    docker compose run --rm data-generator
```
4. Instale as Dependências do Frontend:
    Este comando instalará as dependências da raiz e do workspace apps/frontend.
```
    npm install
```
5. Crie o Arquivo de Ambiente (.env):
    O frontend (Prisma) precisa saber como se conectar ao banco de dados que está
    rodando no Docker.
```
    echo
    "DATABASE_URL=postgresql://challenge:challenge_2024@localhost:5432/challenge_db"
    > apps/frontend/.env
```
6. Gere o Prisma Client:
    Este comando lê o schema.prisma e gera o cliente de banco de dados tipado.
```
    npx prisma generate --schema=./apps/frontend/prisma/schema.prisma
```
7. **Inicie o Servidor do Frontend:**
```
    npm run dev
```
8. Acesse o Dashboard:
    Abra seu navegador e acesse [http://localhost:3000.](http://localhost:3000.)

