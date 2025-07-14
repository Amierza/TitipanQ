package openai

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

type IChatbotNLPService interface {
	GetIntent(message string) (*ChatbotIntentResult, error)
	GenerateNaturalResponse(intent string, data map[string]string) (string, error)
}

type ChatbotIntentResult struct {
	Intent       string `json:"intent"`
	TrackingCode string `json:"package_tracking_code"`
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
				- intent: one of [total_all_package, check_package, list_package_today, list_package_all, thanks, greeting, unknown]
				- package_id: a UUID or custom tracking code (e.g., PAC_123456) if mentioned.

				Examples:
				"total keseluruhan paket saya berapa?" => intent: total_all_package
				"paket saya hari ini apa?" => intent: list_package_today
				"semua paket saya apa aja" => intent: list_package_all
				"cek paket PACK123456" => intent: check_package

				Return JSON like:
				{"intent": "check_package", "package_tracking_code": "PACK123456"}
				{"intent": "list_package_today", "package_tracking_code": ""}`,
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

func (s *chatbotNLPService) GenerateNaturalResponse(intent string, data map[string]string) (string, error) {
	userMsg := fmt.Sprintf(`Tolong buatkan respons WhatsApp yang natural untuk intent "%s" dengan data berikut: %v. Balas dengan gaya santai, profesional, dan tidak terlalu panjang.`, intent, data)

	resp, err := s.client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT4oMini,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "Kamu adalah chatbot asisten pengiriman paket. Buat balasan WhatsApp yang ramah dan informatif.",
			},
			{
				Role:    "user",
				Content: userMsg,
			},
		},
	})
	if err != nil {
		return "", err
	}

	return resp.Choices[0].Message.Content, nil
}
