require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash'; // Latest Gemini model

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Llama 3.3 70B - most capable

// Chat endpoint with multiple AI providers
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, image, model = 'gemini' } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Log which model is being used
        console.log(`\n🤖 Model selected: ${model.toUpperCase()}`);
        console.log(`📝 Message: ${messages[messages.length - 1]?.content?.substring(0, 50)}...`);

        // Route to appropriate AI provider
        if (model === 'groq') {
            console.log('✅ Routing to GROQ API');
            return handleGroqRequest(req, res, messages);
        } else {
            console.log('✅ Routing to GEMINI API');
            return handleGeminiRequest(req, res, messages, image);
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle Groq API requests
async function handleGroqRequest(req, res, messages) {
    try {
        console.log('🚀 GROQ Handler: Starting request...');
        
        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        console.log(`🚀 GROQ Handler: Calling model ${GROQ_MODEL}`);

        // Groq uses OpenAI-compatible format
        const response = await axios({
            method: 'post',
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: GROQ_MODEL,
                messages: messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 4000
            },
            responseType: 'stream'
        });

        // Stream the response
        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    
                    if (data === '[DONE]') {
                        res.write('data: [DONE]\n\n');
                        continue;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        res.write(`data: ${JSON.stringify(parsed)}\n\n`);
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        });

        response.data.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
        });

        response.data.on('error', (error) => {
            console.error('Groq stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error occurred' });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error('Groq Error:', error.response?.data || error.message);
        
        if (!res.headersSent) {
            res.status(error.response?.status || 500).json({ 
                error: error.response?.data?.error?.message || 'Failed to get response from Groq',
                details: error.response?.data
            });
        } else {
            res.end();
        }
    }
}

// Handle Google Gemini API requests
async function handleGeminiRequest(req, res, messages, image) {
    try {
        console.log('🌟 GEMINI Handler: Starting request...');
        
        // Convert OpenAI-style messages to Gemini format
        const contents = [];
        const systemInstruction = messages.find(m => m.role === 'system');
        
        // Build conversation history for Gemini
        for (const msg of messages) {
            if (msg.role === 'system') continue; // Handle separately
            
            const parts = [{ text: msg.content }];
            
            // Add image to the last user message if present
            if (msg.role === 'user' && image && messages.indexOf(msg) === messages.length - 1) {
                parts.push({
                    inlineData: {
                        mimeType: image.mimeType,
                        data: image.data
                    }
                });
            }
            
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: parts
            });
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Use vision model if image is present
        const modelToUse = image ? 'gemini-2.0-flash-exp' : GEMINI_MODEL;
        
        // Build Gemini API URL with streaming
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
            }
        };

        // Add system instruction if present
        if (systemInstruction) {
            requestBody.systemInstruction = {
                parts: [{ text: systemInstruction.content }]
            };
        }

        const response = await axios({
            method: 'post',
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            data: requestBody,
            responseType: 'stream'
        });

        let fullResponse = '';

        // Handle streaming response from Gemini
        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
                try {
                    // Remove "data: " prefix if present
                    let jsonStr = line;
                    if (line.startsWith('data: ')) {
                        jsonStr = line.substring(6);
                    }
                    
                    // Skip empty lines or brackets
                    jsonStr = jsonStr.replace(/^,/, '').trim();
                    if (!jsonStr || jsonStr === '[' || jsonStr === ']') continue;
                    
                    const parsed = JSON.parse(jsonStr);
                    
                    // Extract text from Gemini response
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (text) {
                        fullResponse += text;
                        
                        // Send in OpenAI-compatible streaming format
                        const streamData = {
                            choices: [{
                                delta: {
                                    content: text
                                }
                            }]
                        };
                        
                        res.write(`data: ${JSON.stringify(streamData)}\n\n`);
                    }
                    
                    // Check if generation is complete
                    if (parsed.candidates?.[0]?.finishReason) {
                        res.write('data: [DONE]\n\n');
                    }
                } catch (e) {
                    // Skip invalid JSON - don't log every parse error
                    if (!line.includes('data:') && line.length > 0) {
                        console.error('Parse error:', e.message, 'Line:', line.substring(0, 50));
                    }
                }
            }
        });

        response.data.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
        });

        response.data.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error occurred' });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        
        if (!res.headersSent) {
            const errorData = error.response?.data?.error;
            let errorMessage = 'Failed to get response from Gemini';
            
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            res.status(error.response?.status || 500).json({ 
                error: errorMessage,
                details: error.response?.data
            });
        } else {
            res.end();
        }
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        apiConfigured: !!GEMINI_API_KEY,
        model: GEMINI_MODEL
    });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Moda Tharindu AI Chatbot Server running on http://localhost:${PORT}`);
    console.log(`🤖 Using Google Gemini AI (${GEMINI_MODEL})`);
    console.log(`📡 API Key configured: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
