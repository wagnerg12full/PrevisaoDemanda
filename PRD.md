## PRD (Documento de Requisitos de Produto)

### Nome do Projeto: Previsão de Demanda (Demand Forecasting App)

Visão do Produto: Sistema de inteligência geográfica para antecipação de picos de demanda e alocação precisa de frotas/estoque.

### Objetivos:

    * Prever o volume de pedidos por cluster geográfico em datas e horários específicos.

    * Otimizar a alocação de equipes e estoque, reduzindo custos de ociosidade ou ruptura.

### Público-alvo: Coordenadores logísticos e supervisores de operação.

### Funcionalidades Principais:

    * Mapa Interativo com 6 áreas (clusters) poligonais.

    * Seletor de Data e Hora (com simulação de datas futuras).

    * Indicador de Criticidade (Heatmap) com volume esperado de pedidos.

    * Detalhamento por Cluster: Ao tocar num cluster, exibir o gráfico de tendência para as próximas 4 horas.

    * Navegação Drill-Down: Capacidade de sair da visão de "Cluster" (Macro) para a visão de "Rua/Bairro" (Micro).

    * Heatmap Analítico: Visualização de densidade de pontos históricos em tempo real por coordenada exata.

    * Escala de Criticidade Reescalonada: Alertas baseados em desvios estatísticos (Surtos) e não apenas médias simples.

### Critérios de Aceite: 

    * O mapa deve carregar o heatmap em menos de 2 segundos após o clique no cluster.

    * O slider de horas deve permitir "viagem no tempo" fluida sem travar a UI.