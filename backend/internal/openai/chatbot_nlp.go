package openai

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

type IChatbotNLPService interface {
	GetIntent(message string) (*ChatbotIntentResult, error)
}

type ChatbotIntentResult struct {
	Intent    string `json:"intent"`
	PackageID string `json:"package_id"`
}

type chatbotNLPService struct {
	client *openai.Client
}

func NewChatbotNLPService(apiKey string) IChatbotNLPService {
	return &chatbotNLPService{
		client: openai.NewClient(apiKey),
	}
}

func (s *chatbotNLPService) GetIntent(message string) (*ChatbotIntentResult, error) {
	resp, err := s.client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT4oMini,
		Messages: []openai.ChatCompletionMessage{
			{
				Role: "system",
				Content: `You are a helpful assistant for a package delivery company.

				Given a user's message, extract:
				- intent: one of [check_package, greeting, unknown]
				- package_id: a UUID (e.g., 550e8400-e29b-41d4-a716-446655440000) if mentioned.

				Return a strict JSON like:
				{"intent": "check_package", "package_id": "e567f33a-3678-4f6e-8939-217347e805d5"}

				If no UUID is present, set package_id to an empty string.`,
			},
			{
				Role:    "user",
				Content: message,
			},
		},
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		},
	})

	if err != nil {
		return nil, err
	}

	fmt.Println("[NLP DEBUG] Raw Response:", resp.Choices[0].Message.Content)

	var result ChatbotIntentResult
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
