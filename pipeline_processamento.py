import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import os

def pipeline_previsao_demanda(caminho_csv):
    print("--- Iniciando Processamento de Dados ---")
    
    # 1. Carga e Limpeza
    df = pd.read_csv(caminho_csv)
    # Remove colunas de índice desnecessárias
    if df.columns[0].startswith('Unnamed'):
        df = df.drop(columns=[df.columns[0]])
    
    df = df.dropna() # Limpeza de valores nulos
    
    # 2. Engenharia de Atributos (Preparação para a API)
    df['DATA_SOLICITACAO'] = pd.to_datetime(df['DATA_SOLICITACAO'])
    df['day_of_week'] = df['DATA_SOLICITACAO'].dt.dayofweek # 0=Segunda, 6=Domingo
    df['hour'] = df['DATA_SOLICITACAO'].dt.hour
    df['date_only'] = df['DATA_SOLICITACAO'].dt.date
    
    # 3. Descoberta do K Ideal (Método da Silhueta)
    # Selecionamos apenas Latitude e Longitude para o agrupamento geográfico
    X = df[['LATITUDE', 'LONGITUDE']]
    
    print("Buscando número ideal de clusters (K)...")
    limit = 10
    sil_scores = []
    
    # Testamos de K=2 até 10
    for k in range(2, limit + 1):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X)
        score = silhouette_score(X, labels)
        sil_scores.append((k, score))
        print(f"K={k} | Silhueta: {score:.4f}")
    
    # Seleciona o K com maior score de silhueta
    k_ideal = max(sil_scores, key=lambda x: x[1])[0]
    print(f"--> K Ideal identificado: {k_ideal}")
    
    # 4. Treinamento Final e Criação dos Dados Analíticos
    kmeans_final = KMeans(n_clusters=k_ideal, random_state=42, n_init=10)
    df['cluster'] = kmeans_final.fit_predict(X)
    
    # Exportação 1: Dados Analíticos (71k+ linhas) para o Heatmap do App
    df_analitico = df[['LATITUDE', 'LONGITUDE', 'day_of_week', 'hour', 'cluster']]
    df_analitico.to_csv('backend/dados_analiticos_clusters.csv', index=False)
    
    # 5. Geração dos Dados de Centros de Clusters
    df_centros = pd.DataFrame(kmeans_final.cluster_centers_, columns=['lat', 'lon'])
    df_centros['cluster'] = df_centros.index
    df_centros.to_csv('backend/centros_clusters.csv', index=False)
    
    # 6. Geração do Modelo de Previsão Agregado (Média Histórica)
    # Primeiro: Contamos pedidos por cluster, data real, dia da semana e hora
    contagem_real = df.groupby(['cluster', 'date_only', 'day_of_week', 'hour']).size().reset_index(name='contagem')
    
    # Segundo: Tiramos a média dessa contagem para prever o volume esperado
    modelo_agregado = contagem_real.groupby(['cluster', 'day_of_week', 'hour'])['contagem'].mean().reset_index()
    modelo_agregado.rename(columns={'contagem': 'qtd_pedidos'}, inplace=True)
    
    # Exportação 2: Modelo Agregado para a tela principal do App
    modelo_agregado.to_csv('backend/modelo_previsao_demanda_agregado.csv', index=False)
    
    print(f"--- Processamento Concluído com Sucesso ---")
    print(f"Arquivos gerados na pasta /backend para consumo da API.")

if __name__ == "__main__":
    # Certifique-se que a pasta backend existe
    if not os.path.exists('backend'):
        os.makedirs('backend')
        
    pipeline_previsao_demanda('coordenada_intervalo_tempo.csv')