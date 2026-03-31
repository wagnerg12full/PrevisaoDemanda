## Tipo de Modelo: Regressão Baseada em Média Histórica Agregada (Baseline Robusto).

## Segmentação: K-Means (k=6) gerado a partir de 71.385 registros de Latitude/Longitude.

## Lógica de Cálculo:

1. O modelo identifica o "Dia da Semana" da data futura selecionada (0=Segunda, 6=Domingo).

2. Recupera a média histórica de pedidos para aquele Cluster, DayOfWeek e Hour.

3. Ajuste Dinâmico (Sazonalidade): O modelo aplica um multiplicador de tendência mensal baseado no histórico do último trimestre.

4. Input do Modelo: [Lat, Lon, Timestamp].

5. Output do Modelo: [ClusterID, PredictedVolume, SeverityLevel].

6. Tratamento de Surtos (Burst Analysis):

    O modelo reconhece que médias acima de 7.5 pedidos/hora representam o limite superior (P95) da capacidade histórica.

    Thresholds de Alerta:

        Verde (Normal): <5.0

        Laranja (Atenção): 5.0 a 7.5

        Vermelho (Crítico): >7.5

7. Análise de Densidade Local: Utilização de pesos unitários para cada ocorrência histórica na geração do gradiente do Heatmap (Micro view).