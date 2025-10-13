const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = 'gemini-2.5-flash';

    // Convert messages to Gemini format
    const contents = [];
    const systemInstruction = messages.find(m => m.role === 'system');
    
    for (const msg of messages) {
      if (msg.role === 'system') continue;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    };

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

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        try {
          let jsonStr = line;
          if (line.startsWith('data: ')) {
            jsonStr = line.substring(6);
          }
          
          jsonStr = jsonStr.replace(/^,/, '').trim();
          if (!jsonStr || jsonStr === '[' || jsonStr === ']') continue;
          
          const parsed = JSON.parse(jsonStr);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            const streamData = {
              choices: [{
                delta: {
                  content: text
                }
              }]
            };
            
            res.write(`data: ${JSON.stringify(streamData)}\n\n`);
          }
          
          if (parsed.candidates?.[0]?.finishReason) {
            res.write('data: [DONE]\n\n');
          }
        } catch (e) {
          // Skip invalid JSON
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
    }
  }
};
