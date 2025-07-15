package helpers

import (
	"fmt"
	"image/png"
	"os"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
)

func GenerateBarcodeFile(trackingCode string) (string, error) {
	barcodeData, err := code128.Encode(trackingCode)
	if err != nil {
		return "", err
	}

	scaledBarcode, err := barcode.Scale(barcodeData, 300, 100)
	if err != nil {
		return "", err
	}

	_ = os.MkdirAll("assets/barcode", os.ModePerm)
	fileName := fmt.Sprintf("barcode_%s.png", trackingCode)
	savePath := fmt.Sprintf("assets/barcode/%s", fileName)
	file, err := os.Create(savePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	err = png.Encode(file, scaledBarcode)
	if err != nil {
		return "", err
	}

	return fileName, nil
}
