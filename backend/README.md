# Backend - FGD Schema Builder

API REST en Go para parsear y generar archivos FGD (Forge Game Data).

## Endpoints

### POST /parse

Convierte contenido FGD a JSON.

```bash
curl -X POST http://localhost:8000/parse \
  -H "Content-Type: text/plain" \
  -d '@archivos.fgd'
```

### POST /generate

Convierte JSON a contenido FGD.

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d @schema.json \
  -o output.fgd
```

## Ejecutar

```bash
cd backend
go run cmd/server/main.go
```

El servidor escucha en el puerto `8000`.

## Estructura

```
backend/
├── cmd/server/main.go       # Punto de entrada
├── internal/
│   ├── handler/             # HTTP handlers
│   ├── models/              # Estructuras de datos
│   ├── server/              # Rutas
│   └── service/             # Lógica de negocio
```
