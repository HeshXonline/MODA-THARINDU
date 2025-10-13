# Moda Tharindu AI Chatbot - Deployment Guide

## 🚀 Your Code is on GitHub!

Repository: https://github.com/HeshXonline/AI-chatbot

## 📦 Deployment Options

### Option 1: Deploy to Render (Recommended - Free)

1. Go to https://render.com and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `HeshXonline/AI-chatbot`
4. Configure:
   - **Name**: hn-ai-chatbot
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58`
6. Click "Create Web Service"

Your app will be live at: `https://hn-ai-chatbot.onrender.com`

### Option 2: Deploy to Railway

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `HeshXonline/AI-chatbot`
4. Add Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58`
5. Railway will auto-deploy

### Option 3: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New" → "Project"
3. Import `HeshXonline/AI-chatbot`
4. Add Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58`
5. Click "Deploy"

### Option 4: Deploy to Heroku

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Run these commands:
   ```bash
   heroku login
   heroku create hn-ai-chatbot
   heroku config:set GEMINI_API_KEY=AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58
   git push heroku main
   ```

## 🔑 Important Security Note

⚠️ **NEVER commit your `.env` file to GitHub!** 

The `.gitignore` file is already configured to exclude it. Always add your API key through the hosting platform's environment variables section.

## 📝 After Deployment

1. Visit your deployed URL
2. Test the chatbot
3. Share with others!

## 🛠️ Need Help?

If deployment fails, check:
- ✅ All environment variables are set correctly
- ✅ The start command is `npm start` or `node server.js`
- ✅ Node.js version is compatible (14+)

---

**Your chatbot is ready to go live!** 🎉
