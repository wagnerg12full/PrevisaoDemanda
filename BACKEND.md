## Camada de Backend (API)

### Endpoints Principais:

GET /clusters: Retorna os perímetros (GeoJSON) dos 6 clusters geográficos.

POST /predict: Recebe data e hora, retorna a previsão.

Exemplo de Requisição:

> POST /predict

```
{
  "date": "2024-03-17",
  "hour": 8
}
```
Resposta JSON 

> 201 CREATED

```
{
  "timestamp": "2024-03-17 08:00:00",
  "predictions": [
    {"cluster": 0, "demand": 46.4, "status": "CRITICO"},
    {"cluster": 1, "demand": 12.1, "status": "NORMAL"},
    {"cluster": 2, "demand": 5.8,  "status": "BAIXO"}
  ]
}
```

POST /cluster-detail 

    Input: { "cluster_id": int, "day_of_week": int, "hour": int }

    Lógica: Filtro direto no dataset analítico (71.385 linhas).

    Output: { "count": int, "pontos": [ { "LATITUDE": float, "LONGITUDE": float }, ... ] }