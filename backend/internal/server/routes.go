package server

import (
	"FGDSchemaBuilder/internal/handler"
	"FGDSchemaBuilder/internal/service"
	"net/http"
)

const (
	PathParse    = "/parse"
	PathGenerate = "/generate"
)

func RegisterRoutes(mux *http.ServeMux) {
	// 1. Inicializar los servicios (las herramientas)
	parserSvc := service.NewParserService()
	generateSvc := service.NewGenerateService()

	// 2. Inicializar los manejadores e inyectar sus servicios
	parserHdl := handler.NewParserHandler(parserSvc)
	generateHdl := handler.NewGenerateHandler(generateSvc)

	// 3. Registrar las rutas de API
	mux.HandleFunc("POST "+PathParse, parserHdl.Parse)
	mux.HandleFunc("POST "+PathGenerate, generateHdl.Generate)

	// 4. Servir archivos estáticos del frontend
	fs := http.FileServer(http.Dir("../build"))
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := http.Dir("../build").Open(r.URL.Path); err == nil {
			fs.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, "../build/index.html")
	}))
}
