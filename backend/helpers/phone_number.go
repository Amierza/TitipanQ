package helpers

import (
	"fmt"
	"regexp"
	"strings"
)

func StandardizePhoneNumber(phone string, isMobile bool) (string, error) {
	re := regexp.MustCompile(`\D`)
	onlyDigits := re.ReplaceAllString(phone, "")

	if isMobile {
		if strings.HasPrefix(onlyDigits, "0") {
			onlyDigits = "62" + onlyDigits[1:]
		} else if !strings.HasPrefix(onlyDigits, "62") {
			onlyDigits = "62" + onlyDigits
		}

		if len(onlyDigits) < 10 || len(onlyDigits) > 15 {
			return "", fmt.Errorf("invalid mobile phone number length")
		}
	} else {
		if strings.HasPrefix(onlyDigits, "0") {
			onlyDigits = "62" + onlyDigits[1:]
		} else if strings.HasPrefix(onlyDigits, "62") {
		} else if strings.HasPrefix(onlyDigits, "8") {
			onlyDigits = "62" + onlyDigits
		} else {
			onlyDigits = "62" + onlyDigits
		}

		if len(onlyDigits) < 9 || len(onlyDigits) > 15 {
			return "", fmt.Errorf("invalid landline number length")
		}
	}

	return onlyDigits, nil
}
