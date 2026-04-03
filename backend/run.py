import os
import sys
import uvicorn
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Previsão de Demanda - API")

# Configuração de caminhos baseada no ambiente
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Verificar se estamos em modo de desenvolvimento
IS_DEV_MODE = len(sys.argv) > 1 and sys.argv[1].lower() == 'dev'

if IS_DEV_MODE:
    print("🚀 MODO DESENVOLVIMENTO ATIVADO - Usando dados de teste")
    DATA_DIR = os.path.join(BASE_DIR, 'test')
else:
    print("⚡ MODO PRODUÇÃO - Usando dados do diretório principal")
    DATA_DIR = BASE_DIR

# Configurar caminhos dos CSVs
MODELO_PATH = os.path.join(DATA_DIR, 'modelo_previsao_demanda_agregado.csv')
CLUSTERS_PATH = os.path.join(DATA_DIR, 'centros_clusters.csv')
ANALITICO_PATH = os.path.join(DATA_DIR, 'dados_analiticos_clusters.csv')

# Carregamento dos dados
try:
    df_modelo = pd.read_csv(MODELO_PATH)
    df_clusters = pd.read_csv(CLUSTERS_PATH)
    print(f"✅ Dados e Clusters carregados com sucesso de: {DATA_DIR}")
except Exception as e:
    print(f"❌ Erro crítico ao carregar CSVs: {e}")
    print(f"📁 Diretório atual: {DATA_DIR}")
    print(f"📄 Arquivos disponíveis: {os.listdir(DATA_DIR) if os.path.exists(DATA_DIR) else 'Diretório não existe'}")

# Schema padronizado como 'hour'
class PredictionRequest(BaseModel):
    data_futura: str  # Formato YYYY-MM-DD
    hour: int         # Padronizado com o CSV
    
class ClusterDetailRequest(BaseModel):
    cluster_id: int
    day_of_week: int
    hour: int

@app.get("/")
def health_check():
    return {"status": "Online", "service": "Previsão de Demanda"}

from fastapi import Query
from typing import List, Optional

# Carregamento do dataset completo (apenas as 71k linhas filtradas)
try:
    df_analitico = pd.read_csv(ANALITICO_PATH)
    print(f"✅ Dataset analítico carregado de: {ANALITICO_PATH}")
except Exception as e:
    print(f"❌ Erro ao carregar dataset analítico: {e}")
    print(f"📁 Tentou carregar de: {ANALITICO_PATH}")

@app.post("/cluster-detail")  # Mudamos para POST
async def get_cluster_detail(request: ClusterDetailRequest): # Agora recebe o objeto
    """
    Busca pontos analíticos para o Heatmap via POST
    """
    filtrado = df_analitico[
        (df_analitico['cluster'] == request.cluster_id) & 
        (df_analitico['day_of_week'] == request.day_of_week) & 
        (df_analitico['hour'] == request.hour)
    ]
    
    if filtrado.empty:
        return {"count": 0, "pontos": []}

    pontos = filtrado[['LATITUDE', 'LONGITUDE']].to_dict(orient='records')
    
    return {
        "cluster": request.cluster_id,
        "count": len(pontos),
        "pontos": pontos
    }

@app.post("/prever")
async def predict_demand(request: PredictionRequest):
    try:
        # 1. Validar e converter data para pegar o dia da semana (0-6)
        dt = datetime.strptime(request.data_futura, '%Y-%m-%d')
        dia_semana = dt.weekday()
        
        # 2. Filtrar o modelo usando a nomenclatura do CSV ('day_of_week' e 'hour')
        # Filtramos onde o dia da semana e a hora batem com a requisição
        previsoes = df_modelo[
            (df_modelo['day_of_week'] == dia_semana) & 
            (df_modelo['hour'] == request.hour)
        ]
        
        if previsoes.empty:
            return {
                "message": "Sem dados históricos para este período", 
                "data_consulta": request.data_futura,
                "hour_consulta": request.hour,
                "previsoes": []
            }

        # 3. Construir resposta unindo com coordenadas dos clusters
        resultado = []
        for _, row in previsoes.iterrows():
            # Busca as coordenadas do centro do cluster
            cluster_info = df_clusters[df_clusters['cluster'] == row['cluster']].iloc[0]

            val = float(row['qtd_pedidos'])
    
            # Nova escala baseada na análise de densidade
            if val > 7.5:
                nivel = "CRITICO"
            elif val > 5.0:
                nivel = "ATENCAO"
            else:
                nivel = "NORMAL"
            
            resultado.append({
                "cluster": int(row['cluster']),
                "lat_centro": float(cluster_info['lat']),
                "lon_centro": float(cluster_info['lon']),
                "pedidos_esperados": round(val, 2),
                "nivel_criticidade": nivel
            })

        return {
            "data_consulta": request.data_futura,
            "hour_consulta": request.hour,
            "previsoes": resultado
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

if __name__ == "__main__":
    # Mostrar modo ativo
    if IS_DEV_MODE:
        print("=" * 50)
        print("🚀 SERVIDOR INICIADO EM MODO DESENVOLVIMENTO")
        print("📁 Usando dados de: backend/test/")
        print("🌐 API disponível em: http://localhost:8000")
        print("📚 Documentação: http://localhost:8000/docs")
        print("=" * 50)
    else:
        print("=" * 50)
        print("⚡ SERVIDOR INICIADO EM MODO PRODUÇÃO")
        print("📁 Usando dados de: backend/")
        print("🌐 API disponível em: http://localhost:8000")
        print("📚 Documentação: http://localhost:8000/docs")
        print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)