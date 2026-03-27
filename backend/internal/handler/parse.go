package handler

import (
	"FGDSchemaBuilder/internal/service"
	"encoding/json"
	"io"
	"net/http"
	"strings"
)

// ParserHandler agrupa todos los manejadores relacionados con el parseo de archivos FGD
type ParserHandler struct {
	parserService *service.ParserService
}

// NewParserHandler es el constructor para ParserHandler, recibe el servicio como dependencia
func NewParserHandler(svc *service.ParserService) *ParserHandler {
	return &ParserHandler{
		parserService: svc,
	}
}

// Parse maneja la petición POST para procesar el contenido de un archivo FGD
func (h *ParserHandler) Parse(w http.ResponseWriter, r *http.Request) {
	var content []byte
	ct := r.Header.Get("Content-Type")
	if strings.HasPrefix(ct, "multipart/form-data") {
		// Expect a file field named 'file'
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
			return
		}
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file from form-data (expect field 'file')", http.StatusBadRequest)
			return
		}
		defer file.Close()
		content, err = io.ReadAll(file)
		if err != nil {
			http.Error(w, "Error reading uploaded file", http.StatusBadRequest)
			return
		}
	} else {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error al leer el cuerpo de la petición", http.StatusBadRequest)
			return
		}
		content = body
	}
	defer r.Body.Close()

	// 2. Llamar al servicio inyectado
	fgdResult := h.parserService.ParseFGD(string(content))

	// 3. Responder con el JSON resultante
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fgdResult)
}
