# 🚀 How to Deploy with Working Model Switching

## The Issue
The GitHub Pages version has placeholder API keys (`YOUR_GEMINI_API_KEY_HERE` and `YOUR_GROQ_API_KEY_HERE`), so the models won't work until you add your real keys.

## ✅ Quick Fix for GitHub Pages

### Step 1: Edit `docs/app.js` on GitHub

1. Go to: https://github.com/HeshXonline/MODA-THARINDU/blob/main/docs/app.js
2. Click the **pencil icon** (Edit this file)
3. Find lines 3-4:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
   ```
4. Replace with your actual keys (get them from your API dashboards)
5. Scroll down and click **Commit changes**

### Step 2: Wait 1-2 minutes for GitHub Pages to rebuild

Your site will automatically update!

## ⚠️ Security Warning

**API keys will be visible to anyone** who views the source code of your website!

### Risks:
- Anyone can copy your API keys
- They could use up your API quota
- Potential costs if you're on a paid tier

### Recommendations:
1. **Use free tier keys only** for GitHub Pages
2. **Set up API usage limits** in Google Cloud Console and Groq dashboard
3. **Monitor usage regularly**
4. **For production**: Deploy to Vercel (free & secure) instead

## 🔒 Better Alternative: Vercel (Recommended)

Vercel keeps your API keys secure on the server:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Import Project"
4. Select `MODA-THARINDU` repository
5. Add environment variables:
   - `GEMINI_API_KEY`: Your Gemini key
   - `GROQ_API_KEY`: Your Groq key
6. Deploy!

Your site will be live with secure API keys at `https://your-project.vercel.app`

## 🧪 Testing Locally

Your local version already has the correct keys in `docs/local-config.js`. 

To test the docs folder locally:
1. Open `docs/index.html` in a browser
2. Or run a local server: `python -m http.server 8000` in the docs folder
3. Visit `http://localhost:8000`

---

**Current Status:**
- ✅ Local server (http://localhost:3001) - Working with both models
- ⚠️ GitHub Pages - Needs API keys added
- 🔒 Vercel - Recommended for production

