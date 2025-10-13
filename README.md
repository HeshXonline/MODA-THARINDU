# Moda Tharindu AI Chatbot

A modern, feature-rich chatbot application powered by Google Gemini AI. Built with a sleek dark theme interface similar to ChatGPT, Claude, and Gemini.

![Moda Tharindu AI Chatbot](https://img.shields.io/badge/AI-Moda_Tharindu_AI-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**🔗 GitHub Repository:** https://github.com/HeshXonline/AI-chatbot

## ✨ Features

- 🤖 **Powered by Google Gemini AI** - Latest Gemini 2.5 Flash model with streaming responses
- 💬 **Real-time Streaming** - Messages appear as they're generated, just like ChatGPT
- 🎨 **Modern Dark UI** - Beautiful, responsive interface with smooth animations
- 📝 **Markdown Support** - Full markdown rendering with syntax highlighting for code
- 💾 **Conversation History** - Maintains context throughout your conversation
- 📋 **Copy Messages** - Easy one-click copying of AI responses
- 🎯 **Example Prompts** - Quick-start suggestions to get you going
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API Key (already configured in `.env`)

### Installation

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Start the server:**
   ```powershell
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

That's it! Your chatbot is now running! 🎉

## 🌐 Deploy to Production

Want to make your chatbot live on the internet? See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides to deploy on:

- **Render** (Recommended - Free tier available)
- **Railway** (Easy deployment)
- **Vercel** (Fast & free)
- **Heroku** (Classic option)

Quick deploy to Render:
1. Go to https://render.com
2. Connect your GitHub repo: `HeshXonline/AI-chatbot`
3. Add `GEMINI_API_KEY` environment variable
4. Deploy! 🚀

## 📁 Project Structure

```
AI chatbot/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling and animations
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server with DeepSeek API integration
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (API key)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

The `.env` file contains your configuration:

```env
GEMINI_API_KEY=AIzaSyC5UqIS8MlrM3cmPV7aGABPXxZArewBd58
PORT=3001
```

### Customization

You can customize the chatbot by modifying:

- **Model Settings** (`server.js`):
  ```javascript
  GEMINI_MODEL = 'gemini-2.5-flash'  // or 'gemini-2.0-pro' for more advanced
  generationConfig: {
    temperature: 0.7,  // Creativity (0.0 - 2.0)
    maxOutputTokens: 4000   // Response length
  }
  ```

- **UI Theme** (`public/styles.css`):
  ```css
  :root {
    --primary-color: #6366f1;  /* Change to your brand color */
    --bg-primary: #0f0f0f;     /* Background color */
    /* ... more variables */
  }
  ```

## 🎯 Usage

1. **Start a Conversation:**
   - Type your message in the input box
   - Press Enter or click the send button
   - Watch as the AI responds in real-time

2. **Use Example Prompts:**
   - Click any example prompt to auto-fill the input
   - Great for getting started or exploring capabilities

3. **Copy Responses:**
   - Click the copy button on any AI message
   - Paste the response wherever you need it

4. **Clear Conversation:**
   - Click the "Clear Chat" button in the header
   - Confirms before clearing to prevent accidents

## 🛠️ Technical Details

### Backend
- **Express.js** - Web server framework
- **Axios** - HTTP client for API requests
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Marked.js** - Markdown parsing
- **Highlight.js** - Syntax highlighting for code blocks
- **CSS3** - Modern styling with animations

### API Integration
- Uses Google Gemini's Generative Language API
- Implements streaming for real-time responses
- Maintains conversation context automatically
- Error handling and retry logic

## 📝 API Endpoints

### `POST /api/chat`
Send a message and get a streaming response.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

**Response:**
Server-sent events stream with message chunks.

### `GET /api/health`
Check server status and API configuration.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T...",
  "apiConfigured": true
}
```

## 🎨 Features in Detail

### Markdown Rendering
The chatbot supports full markdown including:
- **Bold**, *italic*, and ~~strikethrough~~
- Headers (H1, H2, H3)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Blockquotes
- Links
- And more!

### Code Highlighting
Supports 190+ programming languages including:
- Python, JavaScript, TypeScript
- Java, C++, C#, Go, Rust
- HTML, CSS, SQL
- And many more!

### Responsive Design
- Desktop: Full-width layout with optimal reading width
- Tablet: Adapted spacing and controls
- Mobile: Single-column layout with touch-optimized UI

## 🔒 Security Notes

- API key is stored in `.env` file (not committed to git)
- Never share your API key publicly
- The `.gitignore` file prevents accidental commits
- Consider adding rate limiting for production use

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

### API errors
- Verify your API key is correct in `.env`
- Check your internet connection
- Ensure you have API credits/quota available

### UI issues
- Clear browser cache
- Try a different browser
- Check browser console for errors (F12)

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📧 Support

If you encounter any issues or have questions, please check:
1. This README file
2. DeepSeek API documentation
3. Browser console for error messages

---

**Enjoy your AI chatbot!** 🚀

Made with ❤️ - Moda Tharindu AI powered by Google Gemini
