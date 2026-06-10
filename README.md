# Random Text Generator

A minimal single-page application that generates a random 10 KB text file upon request.

## Tech Stack
- **Backend:** Node.js with Express
- **Frontend:** Static HTML/CSS/JS (vanilla)
- **Container:** Single container serving both frontend and API

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open [http://localhost:8000](http://localhost:8000)

## API Endpoints

- `GET /health` - Returns `{"status":"ok"}` for liveness probe.
- `GET /api/generate` - Returns a random 10 KB text file as `text/plain`.

## Deployment

Build the Docker image:
```bash
docker build -t random-text-generator .
docker run -p 8000:8000 random-text-generator
```

## Contract Compliance
- Listens on `0.0.0.0:8000`
- `/health` returns 200 with JSON body
- Static frontend served on same port
- Frontend uses relative paths
