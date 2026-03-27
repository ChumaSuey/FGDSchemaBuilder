// Package models contains the data structures that represent the domain
// and the schema of FGD files within the application.
package models

// FGD represents the complete schema of an FGD file.
type FGD struct {
	Metadata Metadata `json:"metadata"`
	Entities []Entity `json:"entities"`
}

// Metadata contains global information about the FGD file.
type Metadata struct {
	MapSize  *MapSize `json:"mapsize"`
	Includes []string `json:"includes"`
}

// MapSize defines the map boundaries.
type MapSize struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

// Entity represents a class definition (@PointClass, @SolidClass, etc.).
type Entity struct {
	ID          string     `json:"id"`
	ClassType   string     `json:"classType"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	BaseClasses []string   `json:"baseClasses"`
	Helpers     Helpers    `json:"helpers"`
	Properties  []Property `json:"properties"`
}

// Helpers is a flexible map to capture size(), color(), model(), etc.
type Helpers map[string]string

// Property represents an individual attribute of an entity.
type Property struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Type         string   `json:"type"`
	DisplayName  string   `json:"displayName"`
	DefaultValue string   `json:"defaultValue"`
	Description  string   `json:"description"`
	Options      []Option `json:"options,omitempty"`
}

// Option represents an element within a 'choices' or 'spawnflags' block.
type Option struct {
	Value   int    `json:"value"`
	Label   string `json:"label"`
	Default bool   `json:"default,omitempty"`
}
