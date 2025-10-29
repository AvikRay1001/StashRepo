# Deployment Guide for Selenium Web Scraping

This guide explains how to deploy the FastAPI backend with Selenium web scraping to different platforms.

## Overview

The application has been updated to work in production environments with:
- Production-ready Chrome/Chromium configuration
- Automatic fallback to BeautifulSoup if Selenium fails
- Support for containerized deployments (Docker)

## Deployment Options

### Option 1: Docker Deployment (Recommended)

The easiest way to deploy with Selenium is using Docker, which handles all Chrome dependencies automatically.

#### Building and Running Locally

```bash
cd stash/backend
docker build -t stash-backend .
docker run -p 8000:8000 --env-file .env stash-backend
```

#### Deploying to Cloud Platforms

**Docker Hub / Container Registry:**
1. Build and tag the image:
   ```bash
   docker build -t your-username/stash-backend:latest .
   docker push your-username/stash-backend:latest
   ```

2. Deploy to your platform (AWS ECS, Google Cloud Run, Azure Container Instances, etc.)

**Platforms that support Docker:**
- **AWS**: ECS, Fargate, Elastic Beanstalk
- **Google Cloud**: Cloud Run, Compute Engine
- **Azure**: Container Instances, App Service
- **DigitalOcean**: App Platform, Droplets
- **Heroku**: Container Registry
- **Railway**: Direct Dockerfile support
- **Render**: Dockerfile support

### Option 2: VPS/Server Deployment (Linux)

If deploying to a Linux server directly (Ubuntu/Debian):

1. **Install Chrome/Chromium:**
   ```bash
   # For Ubuntu/Debian
   wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
   echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
   sudo apt-get update
   sudo apt-get install -y google-chrome-stable

   # Or install Chromium (lighter alternative)
   sudo apt-get install -y chromium-browser chromium-chromedriver
   ```

2. **Install Python dependencies:**
   ```bash
   cd stash/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Run with a process manager (PM2, supervisor, systemd):**
   ```bash
   # Example with PM2
   pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name stash-backend

   # Or with systemd (create /etc/systemd/system/stash-backend.service)
   ```

### Option 3: Platform-Specific Deployment

#### Heroku

1. **Create a `Procfile`:**
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Add buildpacks:**
   ```bash
   heroku buildpacks:add --index 1 heroku/python
   heroku buildpacks:add --index 2 https://github.com/heroku/heroku-buildpack-chromedriver
   heroku buildpacks:add --index 3 https://github.com/heroku/heroku-buildpack-google-chrome
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

#### Railway.app

1. Railway automatically detects Dockerfiles
2. Add your environment variables in the Railway dashboard
3. Deploy!

#### Render.com

1. Create a new Web Service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Note: You may need to use Docker for Chrome dependencies, or contact support

#### Fly.io

1. **Create a `fly.toml`** (or use Dockerfile):
   ```toml
   app = "your-app-name"
   primary_region = "your-region"

   [build]
     dockerfile = "Dockerfile"

   [env]
     PORT = "8000"
   ```

2. **Deploy:**
   ```bash
   flyctl deploy
   ```

## Important Notes

### Fallback Behavior

The application automatically falls back to BeautifulSoup (requests-based scraping) if Selenium fails. This means:
- **If Selenium works**: Full JavaScript rendering and dynamic content
- **If Selenium fails**: Static HTML scraping (still works for most websites)

### Environment Variables

Make sure to set these environment variables in your deployment:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GEMINI_API_KEY`

### Resource Requirements

Selenium with Chrome requires:
- **Memory**: At least 512MB recommended
- **CPU**: 1 vCPU minimum for reasonable performance
- **Disk**: ~1GB for Chrome and dependencies

### Troubleshooting

**Issue**: Chrome/Chromium not found
- **Solution**: Ensure Chrome is installed (see deployment options above)
- The code will automatically fall back to BeautifulSoup

**Issue**: Out of memory errors
- **Solution**: The code includes `--disable-dev-shm-usage` flag
- Consider using a larger instance or limiting concurrent requests

**Issue**: Timeout errors
- **Solution**: The timeout is set to 30 seconds. You can adjust in `main.py` if needed.

## Testing Deployment

After deployment, test the scraping endpoint:

```bash
curl -X POST https://your-deployed-url/v1/capture \
  -H "Content-Type: application/json" \
  -H "X-User-Email: test@example.com" \
  -d '{"type": "url", "content": "https://example.com"}'
```

Check logs to see if Selenium is working or if it falls back to BeautifulSoup.

## Alternative: Use Selenium Grid

For production at scale, consider using Selenium Grid:
- Deploy a Selenium Grid separately
- Connect your FastAPI app to the grid
- Distributes load across multiple browsers

## Security Considerations

- The application runs Chrome in headless mode with security flags
- Consider rate limiting for scraping endpoints
- Monitor for abuse
- Respect robots.txt (consider adding this feature)

