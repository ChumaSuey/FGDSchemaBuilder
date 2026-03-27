package service

import (
	"fmt"
	"slices"
	"strings"

	"FGDSchemaBuilder/internal/models"
)

type GenerateService struct{}

// NewGenerateService crea una nueva instancia del servicio
func NewGenerateService() *GenerateService {
	return &GenerateService{}
}

func (s *GenerateService) GenerateFGD(schema *models.FGD) string {
	output := []string{}
	if schema.Metadata.MapSize != nil {
		output = append(
			output,
			fmt.Sprintf(
				"@mapsize(%d, %d)",
				schema.Metadata.MapSize.Min,
				schema.Metadata.MapSize.Max,
			),
		)
	}
	if len(schema.Metadata.Includes) > 0 {
		for _, include := range schema.Metadata.Includes {
			output = append(output, fmt.Sprintf(`@include "%s"`, include))
		}
	}
	if len(schema.Entities) > 0 {
		for _, entity := range schema.Entities {
			output = append(output, s.generateEntity(&entity))
		}
	}

	return strings.Join(output, "\n\n")
}

func (s *GenerateService) generateEntity(entity *models.Entity) string {
	headerParts := []string{fmt.Sprintf("@%s", entity.ClassType)}
	
	for key, value := range entity.Helpers {
		if key == "model" && (strings.Contains(value, "{") || strings.Contains(value, "\n")) {
			trimmed  := strings.TrimSpace(value)
			if trimmed == "" {
				headerParts = append(headerParts, "model(\n)")
				continue
			}
			lines := strings.Split(trimmed, "\n")
			for i, line := range lines {
				lines[i] = "\t" + strings.TrimSpace(line)
			}
			indentedValue := strings.Join(lines, "\n")
			headerParts = append(headerParts, fmt.Sprintf("model(\n%s\n)", indentedValue))
		} else {
			headerParts = append(headerParts, fmt.Sprintf("%s(%s)", key, value))
		}
	}
	if len(entity.BaseClasses) > 0 {
		baseClasses := strings.Join(entity.BaseClasses, ", ")
		headerParts = append(headerParts, fmt.Sprintf("base(%s)", baseClasses))
	}
	header := strings.Join(headerParts, " ") + fmt.Sprintf(" = %s", entity.Name)
	
	if entity.Description != "" {
		header += fmt.Sprintf(" : \"%s\"", entity.Description)
	}

	if len(entity.Properties) == 0 {
		return header
	}
	properties := []string{}
	for _, prop := range entity.Properties {
		properties = append(properties, s.generateProperty(&prop))
	}
	body := strings.Join(properties, "\n")

	return fmt.Sprintf("%s [\n%s\n]", header, body)
}

func (s *GenerateService) generateProperty(prop *models.Property) string {

	isBlockType := strings.ToLower(prop.Type) == "flags" || strings.ToLower(prop.Type) == "choices"

	line := fmt.Sprintf("\t%s(%s)", prop.Name, prop.Type)
	if prop.DisplayName != prop.Name {
		line += fmt.Sprintf(" : \"%s\"", prop.DisplayName)
	}
	if strings.TrimSpace(prop.DefaultValue) != "" {
		if isBlockType {
			line += fmt.Sprintf(" : %s", prop.DefaultValue)
		}else {
			nonQuotedTypes := []string{"integer", "float", "color255", "vector"}
			if slices.ContainsFunc(nonQuotedTypes, func(s string) bool {
				return strings.EqualFold(s, prop.Type)
			}) {
				line += fmt.Sprintf(" : %s", prop.DefaultValue)
			}else {
				line += fmt.Sprintf(" : \"%s\"", prop.DefaultValue)
			}
		}
	}

	if prop.Description != "" && !isBlockType {
		line += fmt.Sprintf(" : \"%s\"", prop.Description)
	}
	if isBlockType {
		line += " =\n\t[\n"
		if strings.ToLower(prop.Type) == "flags" {
			line += s.generateFlagsOptions(prop.Options)
		}else {
			line += s.generateChoicesOptions(prop.Options)
		}
		line += "\n\t]"
	}
	return line
}


func (s *GenerateService) generateFlagsOptions(options []models.Option) string {
	if len(options) == 0 {
		return ""
	}
	optionsLines := []string{}
	for _, option := range options {
		var result int
		if option.Default {
			result = 1
		} else {
			result = 0
		}
		optionsLines = append(optionsLines, fmt.Sprintf("\t\t%d : \"%s\" : %d", option.Value, option.Label, result))
	}
	return strings.Join(optionsLines, "\n")
}

func (s *GenerateService) generateChoicesOptions(options []models.Option) string {
	if len(options) == 0 {
		return ""
	}
	optionsLines := []string{}
	for _, option := range options {
		optionsLines = append(optionsLines, fmt.Sprintf("\t\t%d : \"%s\"", option.Value, option.Label))
	}
	return strings.Join(optionsLines, "\n")
}
