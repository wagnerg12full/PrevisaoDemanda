## Tech Stack:

### Backend: Python 3.10+ com FastAPI. Escolhido pela alta performance em requisições assíncronas e integração nativa com bibliotecas de dados (Pandas/Scikit-learn).

### Frontend Mobile: React Native (Expo ou CLI). Permite uma interface fluida no mapa e portabilidade (Android/iOS).

### Banco de Dados: PostgreSQL com extensão PostGIS para armazenamento e consulta eficiente de coordenadas geográficas.

### Fluxo de Dados:

    * Usuário escolhe Data e Hora no App.

    * App envia requisição via REST para o Backend.

    * Backend processa o Day of Week e Hour, busca no arquivo agregado (ou banco) os dados de previsão.

    * Backend retorna um JSON com as coordenadas dos clusters e o volume esperado.

### Camada de Dados (Data Lake):

    modelo_previsao_demanda_agregado.csv: Dados sumarizados para performance na tela principal.

    dados_analiticos_clusters.csv: População total (71k+) para geração de Heatmaps sob demanda.

### Infraestrutura Backend:

    FastAPI: Implementação de endpoints assíncronos.

    CORS: Configuração para permitir conexões de dispositivos móveis na rede local.

### Navegação Frontend:

    React Navigation (Stack + Tabs): Implementação de uma pilha de navegação dentro da aba "Predict" para transição suave entre Mapa Geral e Detalhes.

### Comunicação: Protocolo HTTP/JSON via métodos POST para garantir integridade e extensibilidade de filtros.