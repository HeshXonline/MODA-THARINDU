# 🌐 Deploy Moda Tharindu AI Chatbot for FREE

Your chatbot is ready to deploy to a free server! Here are 3 **100% FREE** options:

---

## 🎯 OPTION 1: Render.com (EASIEST - RECOMMENDED)

### ⏱️ Time: 3 minutes

### Steps:

1. **Go to Render:** 👉 https://dashboard.render.com/register

2. **Sign in with GitHub** (one click)

3. **Click "New +"** → Select **"Web Service"**

4. **Connect your repo:**
   - Find: `HeshXonline/AI-chatbot`
   - Click **"Connect"**

5. **Configure (copy these exactly):**
   ```
   Name: hn-ai-chatbot
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

6. **Add Environment Variable:**
   - Click **"Add Environment Variable"**
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58`

7. **Click "Create Web Service"**

### ✅ Your Live URL:
`https://hn-ai-chatbot.onrender.com`

**Done!** Your chatbot will be live in 2-3 minutes! 🎉

---

## 🚀 OPTION 2: Railway.app (FASTEST)

### ⏱️ Time: 2 minutes

### Steps:

1. **Go to Railway:** 👉 https://railway.app/new

2. **Click "Deploy from GitHub repo"**

3. **Select:** `HeshXonline/AI-chatbot`

4. **Add Environment Variable:**
   - Go to Variables tab
   - Add: `GEMINI_API_KEY` = `AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58`

5. **Generate Domain:**
   - Go to Settings
   - Click "Generate Domain"

### ✅ Your Live URL:
`https://hn-ai-chatbot-production.up.railway.app`

**Done!** Live instantly! ⚡

---

## ⚡ OPTION 3: Vercel (BEST PERFORMANCE)

### ⏱️ Time: 1 minute

### One-Click Deploy:

**Click this button:** 👇

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HeshXonline/AI-chatbot&env=GEMINI_API_KEY)

Or manually:

1. **Go to:** 👉 https://vercel.com/new

2. **Import:** `https://github.com/HeshXonline/AI-chatbot`

3. **Add Environment Variable:**
   - `GEMINI_API_KEY` = `AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58`

4. **Click Deploy**

### ✅ Your Live URL:
`https://ai-chatbot.vercel.app`

**Done!** Lightning fast! ⚡

---

## 📊 Comparison

| Platform | Speed | Ease | Performance | Auto-Deploy |
|----------|-------|------|-------------|-------------|
| **Render** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| **Railway** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |

---

## 🎁 All FREE Features Include:

- ✅ **Free Forever** - No credit card required
- ✅ **Auto-Deploy** - Push to GitHub = Auto update
- ✅ **HTTPS/SSL** - Secure by default
- ✅ **Global CDN** - Fast worldwide
- ✅ **Custom Domain** - Add your own domain (optional)
- ✅ **Logs & Monitoring** - Track errors and usage

---

## 🆘 Need Help?

**If deployment fails, check:**
1. ✅ Environment variable `GEMINI_API_KEY` is added
2. ✅ Build command is `npm install`
3. ✅ Start command is `npm start`
4. ✅ Port is set correctly (Render/Railway auto-detect)

---

## 🔥 Pro Tips:

1. **Use Render** if you want simplicity
2. **Use Railway** if you want speed
3. **Use Vercel** if you want best performance

**I recommend Render for beginners!** 👍

---

## 🎉 After Deployment:

1. Visit your live URL
2. Test the chatbot
3. Share with friends!
4. Every GitHub push auto-updates! 🔄

---

**Ready to go live? Pick one option above and follow the steps!** 🚀
