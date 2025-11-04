-- CreateEnum
CREATE TYPE "AggregationPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- Criar índices para otimizar queries temporais
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_store_channel ON sales(store_id, channel_id, created_at);

-- View materializada para agregações diárias
CREATE MATERIALIZED VIEW IF NOT EXISTS sales_daily_mv
AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    store_id,
    channel_id,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_ticket,
    SUM(total_amount_items) as total_items_revenue,
    AVG(production_seconds) as avg_production_time,
    AVG(delivery_seconds) as avg_delivery_time
FROM sales
WHERE sale_status_desc = 'COMPLETED'
GROUP BY 1, 2, 3;

-- View materializada para agregações semanais
CREATE MATERIALIZED VIEW IF NOT EXISTS sales_weekly_mv AS
SELECT 
    DATE_TRUNC('week', created_at) AS date,
    store_id,
    channel_id,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_ticket,
    SUM(total_amount_items) as total_items_revenue,
    AVG(production_seconds) as avg_production_time,
    AVG(delivery_seconds) as avg_delivery_time
FROM sales
WHERE sale_status_desc = 'COMPLETED'
GROUP BY 1, 2, 3;

-- View materializada para agregações mensais
CREATE MATERIALIZED VIEW IF NOT EXISTS sales_monthly_mv AS
SELECT 
    DATE_TRUNC('month', created_at) AS date,
    store_id,
    channel_id,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_ticket,
    SUM(total_amount_items) as total_items_revenue,
    AVG(production_seconds) as avg_production_time,
    AVG(delivery_seconds) as avg_delivery_time
FROM sales
WHERE sale_status_desc = 'COMPLETED'
GROUP BY 1, 2, 3;

-- Índices para as views materializadas
-- Índices únicos e normais para daily
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_daily_mv_unique ON sales_daily_mv (date, store_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_sales_daily_mv_date ON sales_daily_mv(date);
CREATE INDEX IF NOT EXISTS idx_sales_daily_mv_store ON sales_daily_mv(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_daily_mv_channel ON sales_daily_mv(channel_id);

-- Índices únicos e normais para weekly
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_weekly_mv_unique ON sales_weekly_mv (date, store_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_sales_weekly_mv_date ON sales_weekly_mv(date);
CREATE INDEX IF NOT EXISTS idx_sales_weekly_mv_store ON sales_weekly_mv(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_weekly_mv_channel ON sales_weekly_mv(channel_id);

-- Índices únicos e normais para monthly
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_monthly_mv_unique ON sales_monthly_mv (date, store_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_mv_date ON sales_monthly_mv(date);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_mv_store ON sales_monthly_mv(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_mv_channel ON sales_monthly_mv(channel_id);

-- Função para atualizar todas as views materializadas
CREATE OR REPLACE FUNCTION refresh_sales_materialized_views(period "AggregationPeriod" = NULL)
RETURNS void AS $$
BEGIN
    -- Atualiza todas as views se nenhum período for especificado
    IF period IS NULL THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY sales_daily_mv;
        REFRESH MATERIALIZED VIEW CONCURRENTLY sales_weekly_mv;
        REFRESH MATERIALIZED VIEW CONCURRENTLY sales_monthly_mv;
    ELSE
        -- Atualiza apenas a view específica
        CASE period
            WHEN 'DAILY' THEN
                REFRESH MATERIALIZED VIEW CONCURRENTLY sales_daily_mv;
            WHEN 'WEEKLY' THEN
                REFRESH MATERIALIZED VIEW CONCURRENTLY sales_weekly_mv;
            WHEN 'MONTHLY' THEN
                REFRESH MATERIALIZED VIEW CONCURRENTLY sales_monthly_mv;
        END CASE;
    END IF;
END;
$$ LANGUAGE plpgsql;
-- OBS: O agendamento automático abaixo usa a extensão pg_cron e só
-- deve ser habilitado se você tiver essa extensão instalada no seu
-- servidor PostgreSQL. Em ambientes simples (como o docker-compose
-- padrão deste repositório) essa extensão provavelmente NÃO está
-- disponível. Nesse caso, execute manualmente:
--   SELECT refresh_sales_materialized_views();
-- ou crie um job externo (systemd timer, cron, ou um script node) que
-- execute a função em intervalos desejados.

-- Exemplo (se pg_cron estiver disponível):
-- SELECT cron.schedule('0 * * * *', $$SELECT refresh_sales_materialized_views();$$);