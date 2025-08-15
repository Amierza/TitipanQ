package entity

import (
	"time"

	"github.com/google/uuid"
)

type CronLog struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"cron_id"`
	JobName    string    `json:"cron_job_name"`
	Status     string    `json:"cron_status"`
	Message    string    `json:"cron_message"`
	ExecutedAt time.Time `json:"executed_at"`

	TimeStamp
}
