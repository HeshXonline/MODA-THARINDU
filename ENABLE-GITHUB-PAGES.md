# 📖 Step-by-Step: Enable GitHub Pages

## 🎯 Follow These Exact Steps:

---

### **STEP 1: Go to GitHub Pages Settings**

1. **Open this link in your browser:**
   ```
   https://github.com/HeshXonline/AI-chatbot/settings/pages
   ```
   
   OR manually:
   - Go to your repo: https://github.com/HeshXonline/AI-chatbot
   - Click **"Settings"** tab (top menu)
   - Scroll down and click **"Pages"** in left sidebar

---

### **STEP 2: Configure GitHub Pages**

You'll see a page titled **"GitHub Pages"**

#### **A) Source Section:**
Look for **"Build and deployment"** heading

1. Under **"Source"**, you'll see a dropdown menu
2. Click on it
3. Select: **"Deploy from a branch"**

#### **B) Branch Section:**
Right below Source, you'll see **"Branch"**

1. Click the first dropdown (currently says "None")
2. Select: **"main"**
3. Click the second dropdown (currently says "/ (root)")
4. Select: **"/docs"**

It should now show:
```
Branch: main    /docs
```

---

### **STEP 3: Save**

1. Click the **"Save"** button (blue button next to the branch dropdowns)
2. The page will refresh

---

### **STEP 4: Wait for Deployment**

After saving:

1. **Wait 1-2 minutes**
2. **Refresh the page** (press F5 or Ctrl+R)
3. You'll see a **green box** at the top that says:
   ```
   ✅ Your site is live at https://heshxonline.github.io/AI-chatbot/
   ```

---

## 🎉 **Your Live URL:**

Once you see the green success message, visit:

### **https://heshxonline.github.io/AI-chatbot/**

---

## 📸 **What You Should See:**

### **Before Saving:**
```
Build and deployment
Source: [Deploy from a branch ▼]
Branch: [main ▼] [/docs ▼] [Save]
```

### **After Saving & Waiting:**
```
✅ Your site is live at https://heshxonline.github.io/AI-chatbot/

Build and deployment
Source: Deploy from a branch
Branch: main /docs
```

---

## ⚠️ **Troubleshooting:**

### **If you don't see the green message after 2 minutes:**

1. **Refresh the page** (F5)
2. Check "Actions" tab: https://github.com/HeshXonline/AI-chatbot/actions
3. You should see a green checkmark ✅ next to "pages build and deployment"
4. If it's yellow (in progress), wait a bit more
5. If it's red (failed), let me know

---

## 🔍 **Quick Check:**

After deployment, your chatbot should:
- ✅ Load at https://heshxonline.github.io/AI-chatbot/
- ✅ Show the chat interface
- ✅ Let you send messages
- ✅ Get AI responses from Gemini

---

## 🆘 **Need Help?**

If you see any errors, take a screenshot and share it. Common issues:
- Wrong branch selected
- Wrong folder selected (must be `/docs`)
- Site not deployed yet (just wait 2 more minutes)

---

**That's it! Just follow the 3 steps above and your chatbot will be live!** 🚀
