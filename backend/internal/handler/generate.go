package handler

import (
	"FGDSchemaBuilder/internal/models"
	"FGDSchemaBuilder/internal/service"
	"encoding/json"
	"io"
	"net/http"
)

type GenerateHandler struct {
	generateService *service.GenerateService
}

// NewParserHandler es el constructor para ParserHandler, recibe el servicio como dependencia
func NewGenerateHandler(svc *service.GenerateService) *GenerateHandler {
	return &GenerateHandler{
		generateService: svc,
	}
}

func (h *GenerateHandler) Generate(w http.ResponseWriter, r *http.Request) {

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error al leer el cuerpo de la petición", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var schema models.FGD
	if err := json.Unmarshal(body, &schema); err != nil {
		http.Error(w, "Error al parsear el JSON", http.StatusBadRequest)
		return
	}

	fgdContent := h.generateService.GenerateFGD(&schema)

	w.Header().Set("Content-Disposition", "attachment; filename=output.fgd")
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(fgdContent))
}
