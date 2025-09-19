# Go builder stage  
FROM --platform=linux/amd64 mirror.gcr.io/library/golang:1.21.5-alpine AS go-builder

WORKDIR /app

# Copy go.mod and go.sum first for dependency caching
COPY go.mod go.sum ./
RUN go mod download

# Copy Go source code
COPY . .

# Build Go backend
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Final minimal image
FROM --platform=linux/amd64 mirror.gcr.io/library/alpine:3.20

WORKDIR /app

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy binary from Go builder
COPY --from=go-builder /app/app .

EXPOSE 3000
CMD ["./app"]