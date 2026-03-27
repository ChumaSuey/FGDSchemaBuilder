package tests

import (
	"FGDSchemaBuilder/internal/server"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// TestParseEndpoint tests the POST /parse endpoint
func TestParseEndpoint(t *testing.T) {
	// Create a new serve mux and register routes
	mux := http.NewServeMux()
	server.RegisterRoutes(mux)

	// Test cases
	tests := []struct {
		name           string
		body           string
		expectedStatus int
		checkResponse  bool
	}{
		{
			name:           "Valid FGD content",
			body:           `@BaseClass = Base { vector:origin }`,
			expectedStatus: http.StatusOK,
			checkResponse:  true,
		},
		{
			name:           "Empty body",
			body:           "",
			expectedStatus: http.StatusOK,
			checkResponse:  true,
		},
		{
			name:           "Complex FGD with entities",
			body:           `@BaseClass = Base { vector:origin string:target } @PointClass = Base { string:target }`,
			expectedStatus: http.StatusOK,
			checkResponse:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/parse", strings.NewReader(tt.body))
			w := httptest.NewRecorder()

			mux.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.checkResponse {
				// Verify we got valid JSON response
				contentType := w.Header().Get("Content-Type")
				if !strings.Contains(contentType, "application/json") {
					t.Errorf("Expected Content-Type application/json, got %s", contentType)
				}

				// Verify the body is valid JSON (non-empty)
				body, _ := io.ReadAll(w.Body)
				if len(body) == 0 {
					t.Error("Expected non-empty response body")
				}

				// Try to parse as JSON to verify it's valid
				var result interface{}
				if err := json.Unmarshal(body, &result); err != nil {
					t.Errorf("Response is not valid JSON: %v", err)
				}
			}
		})
	}
}

// TestGenerateEndpoint tests the POST /generate endpoint
func TestGenerateEndpoint(t *testing.T) {
	// Create a new serve mux and register routes
	mux := http.NewServeMux()
	server.RegisterRoutes(mux)

	// Test cases
	tests := []struct {
		name           string
		body           string
		expectedStatus int
		checkResponse  bool
		contentType    string
	}{
		{
			name:           "Valid JSON schema with metadata",
			body:           `{"metadata":{"includes":["base.fgd"],"mapsize":{"min":0,"max":16384}},"entities":[]}`,
			expectedStatus: http.StatusOK,
			checkResponse:  true,
			contentType:    "text/plain",
		},
		{
			name:           "Empty JSON schema",
			body:           `{"metadata":{},"entities":[]}`,
			expectedStatus: http.StatusOK,
			checkResponse:  false, // Empty schema produces empty output
		},
		{
			name:           "Invalid JSON",
			body:           `{invalid json}`,
			expectedStatus: http.StatusBadRequest,
			checkResponse:  false,
		},
		{
			name:           "Valid schema with entity",
			body:           `{"metadata":{},"entities":[{"id":"1","classType":"PointClass","name":"test_entity","description":"Test entity","baseClasses":["Base"],"helpers":{},"properties":[{"id":"1","name":"target","type":"target_destination","displayName":"Target","defaultValue":"","description":"Target entity"}]}]}`,
			expectedStatus: http.StatusOK,
			checkResponse:  true,
			contentType:    "text/plain",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/generate", strings.NewReader(tt.body))
			w := httptest.NewRecorder()

			mux.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.checkResponse {
				contentType := w.Header().Get("Content-Type")
				if !strings.Contains(contentType, tt.contentType) {
					t.Errorf("Expected Content-Type %s, got %s", tt.contentType, contentType)
				}

				// Verify the body is not empty
				body, _ := io.ReadAll(w.Body)
				if len(body) == 0 {
					t.Error("Expected non-empty response body")
				}
			}
		})
	}
}

// TestEndpointMethods verifies that only POST method is allowed
func TestEndpointMethods(t *testing.T) {
	mux := http.NewServeMux()
	server.RegisterRoutes(mux)

	endpoints := []string{"/parse", "/generate"}
	methods := []string{http.MethodGet, http.MethodPut, http.MethodDelete}

	for _, endpoint := range endpoints {
		for _, method := range methods {
			t.Run(method+" "+endpoint, func(t *testing.T) {
				req := httptest.NewRequest(method, endpoint, nil)
				w := httptest.NewRecorder()

				mux.ServeHTTP(w, req)

				// Should return method not allowed or not found
				// GET/PUT/DELETE on these endpoints should not work
				if w.Code == http.StatusOK {
					t.Errorf("Expected non-OK status for %s %s", method, endpoint)
				}
			})
		}
	}
}

// TestParseWithMalformedBody tests parse endpoint with empty or nil body
func TestParseWithMalformedBody(t *testing.T) {
	mux := http.NewServeMux()
	server.RegisterRoutes(mux)

	tests := []struct {
		name    string
		body    string
		wantErr bool
	}{
		{"empty string", "", false},
		{"whitespace only", "   ", false},
		{"single line", "test", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/parse", strings.NewReader(tt.body))
			w := httptest.NewRecorder()

			mux.ServeHTTP(w, req)

			if !tt.wantErr && w.Code != http.StatusOK {
				t.Errorf("Expected OK status, got %d", w.Code)
			}
		})
	}
}

// TestIntegrationFullFlow tests a complete flow: parse and then generate
func TestIntegrationFullFlow(t *testing.T) {
	mux := http.NewServeMux()
	server.RegisterRoutes(mux)

	// Step 1: Parse FGD content
	fgdContent := `
@BaseClass = Base {
	string:target(target,1)
	vector:origin
}

@PointClass = Base {
	string:name(target_name)
}
`

	req1 := httptest.NewRequest(http.MethodPost, "/parse", strings.NewReader(fgdContent))
	w1 := httptest.NewRecorder()
	mux.ServeHTTP(w1, req1)

	if w1.Code != http.StatusOK {
		t.Fatalf("Parse endpoint failed with status %d", w1.Code)
	}

	// Parse the response to get the JSON
	body1, _ := io.ReadAll(w1.Body)
	var parsedResult interface{}
	if err := json.Unmarshal(body1, &parsedResult); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Step 2: Generate FGD from the parsed result
	req2 := httptest.NewRequest(http.MethodPost, "/generate", strings.NewReader(string(body1)))
	w2 := httptest.NewRecorder()
	mux.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("Generate endpoint failed with status %d", w2.Code)
	}

	// Verify the response is not empty
	body2, _ := io.ReadAll(w2.Body)
	if len(body2) == 0 {
		t.Error("Generate endpoint returned empty body")
	}

	t.Logf("Successfully completed full flow: parse -> generate")
}
