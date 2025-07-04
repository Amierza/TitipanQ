package helpers

import (
	"context"
	"errors"
)

func ExtractTokenFromContext(ctx context.Context) (string, error) {
	tokenValue := ctx.Value("Authorization")
	if tokenValue == nil {
		return "", errors.New("missing token")
	}
	token, ok := tokenValue.(string)
	if !ok {
		return "", errors.New("invalid token type")
	}
	return token, nil
}
var AuthorizationKey = struct{}{}
