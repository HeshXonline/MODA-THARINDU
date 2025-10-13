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

// Chat endpoint with Gemini API
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Convert OpenAI-style messages to Gemini format
        const contents = [];
        const systemInstruction = messages.find(m => m.role === 'system');
        
        // Build conversation history for Gemini
        for (const msg of messages) {
            if (msg.role === 'system') continue; // Handle separately
            
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Build Gemini API URL with streaming
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

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
});

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
