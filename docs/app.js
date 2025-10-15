// Configuration - Using direct AI APIs from browser
// IMPORTANT: Replace these with your own API keys!
// For production, these should be moved to environment variables or a config file
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const PRO_PASSWORD = 'ModaProAccess2025'; // Pro password
const FREE_MESSAGE_LIMIT = 3; // Number of free messages

// State
let conversationHistory = [];
let isProcessing = false;
let messageCount = 0; // Track number of messages sent
let isProUser = false; // Pro status
let currentModel = 'gemini'; // Default model

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const agentBtn = document.getElementById('agentBtn');
const agentDropdown = document.getElementById('agentDropdown');
const agentName = document.getElementById('agentName');

// Configure marked options
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadProStatus();
    loadModelPreference();
    userInput.focus();
});

// Event Listeners
function setupEventListeners() {
    sendBtn.addEventListener('click', handleSendMessage);

    // Agent selector
    if (agentBtn) {
        agentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            agentDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (agentDropdown) agentDropdown.classList.remove('active');
    });

    // Agent option selection
    document.querySelectorAll('.agent-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const model = option.getAttribute('data-model');
            selectModel(model);
            agentDropdown.classList.remove('active');
        });
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
        sendBtn.disabled = !userInput.value.trim() || isProcessing;
    });

    clearBtn.addEventListener('click', clearChat);

    document.querySelectorAll('.example-prompt').forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            userInput.dispatchEvent(new Event('input'));
            userInput.focus();
        });
    });

    // Pro modal event listeners
    const proModal = document.getElementById('proModal');
    const proPasswordInput = document.getElementById('proPasswordInput');
    const proSubmitBtn = document.getElementById('proSubmitBtn');
    const proCancelBtn = document.getElementById('proCancelBtn');
    
    if (proSubmitBtn) {
        proSubmitBtn.addEventListener('click', handleProSubmit);
    }
    
    if (proCancelBtn) {
        proCancelBtn.addEventListener('click', hideProModal);
    }
    
    if (proPasswordInput) {
        proPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleProSubmit();
            }
        });
    }
    
    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && proModal && proModal.style.display === 'flex') {
            hideProModal();
        }
    });
}

// Model selection functions
function selectModel(model) {
    currentModel = model;
    saveModelPreference(model);
    updateAgentDisplay(model);
}

function updateAgentDisplay(model) {
    const options = document.querySelectorAll('.agent-option');
    options.forEach(option => {
        if (option.getAttribute('data-model') === model) {
            option.classList.add('active');
            if (agentName) {
                agentName.textContent = option.querySelector('.agent-option-name').textContent;
            }
        } else {
            option.classList.remove('active');
        }
    });
}

function saveModelPreference(model) {
    localStorage.setItem('selectedModel', model);
}

function loadModelPreference() {
    const savedModel = localStorage.getItem('selectedModel') || 'gemini';
    currentModel = savedModel;
    updateAgentDisplay(savedModel);
}

// Handle sending message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessing) return;

    // Check if user exceeded free message limit and is not Pro
    if (messageCount >= FREE_MESSAGE_LIMIT && !isProUser) {
        showProModal();
        return;
    }

    // Increment message count BEFORE sending
    messageCount++;
    saveMessageCount();

    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;
    isProcessing = true;

    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    addMessageToUI('user', message);

    conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });

    const typingIndicator = addTypingIndicator();

    try {
        let fullResponse = '';
        let assistantMessage;

        // Route to appropriate AI model
        if (currentModel === 'groq') {
            // Call Groq API
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: conversationHistory.map(msg => ({
                        role: msg.role === 'model' ? 'assistant' : msg.role,
                        content: msg.parts[0].text
                    })),
                    stream: true,
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`);
            }

            typingIndicator.remove();
            assistantMessage = createMessageElement('assistant', '');
            chatContainer.appendChild(assistantMessage);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            
                            if (content) {
                                fullResponse += content;
                                updateMessageContent(assistantMessage, fullResponse);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } else {
            // Call Gemini API
            const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: conversationHistory,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4000,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            typingIndicator.remove();
            assistantMessage = createMessageElement('assistant', '');
            chatContainer.appendChild(assistantMessage);
        
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

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
                            fullResponse += text;
                            updateMessageContent(assistantMessage, fullResponse);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        // Add assistant response to conversation history
        conversationHistory.push({
            role: 'model',
            parts: [{ text: fullResponse }]
        });

        // Show remaining messages if not Pro
        if (!isProUser && messageCount < FREE_MESSAGE_LIMIT) {
            const remaining = FREE_MESSAGE_LIMIT - messageCount;
            showRemainingMessages(remaining);
        }

        addCopyButton(assistantMessage);

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessageToUI('assistant', '❌ Sorry, there was an error. Please try again or check your internet connection.');
    } finally {
        isProcessing = false;
        sendBtn.disabled = !userInput.value.trim();
        userInput.focus();
    }
}

// Add message to UI
function addMessageToUI(role, content) {
    const messageElement = createMessageElement(role, content);
    chatContainer.appendChild(messageElement);
    
    if (role === 'assistant') {
        addCopyButton(messageElement);
    }
    
    scrollToBottom();
}

// Create message element
function createMessageElement(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    if (content) {
        if (role === 'user') {
            textDiv.textContent = content;
        } else {
            textDiv.innerHTML = marked.parse(content);
            textDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

// Update message content (for streaming)
function updateMessageContent(messageElement, content) {
    const textDiv = messageElement.querySelector('.message-text');
    textDiv.innerHTML = marked.parse(content);
    
    textDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    scrollToBottom();
}

// Add typing indicator
function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    contentDiv.appendChild(typingDiv);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    scrollToBottom();
    return messageDiv;
}

// Add copy button to message
function addCopyButton(messageElement) {
    const contentDiv = messageElement.querySelector('.message-content');
    const textDiv = messageElement.querySelector('.message-text');
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-icon';
    copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
        <span>Copy</span>
    `;

    copyBtn.addEventListener('click', async () => {
        const text = textDiv.textContent;
        try {
            await navigator.clipboard.writeText(text);
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>
            `;
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                    </svg>
                    <span>Copy</span>
                `;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    actionsDiv.appendChild(copyBtn);
    contentDiv.appendChild(actionsDiv);
}

// Clear chat
function clearChat() {
    if (!confirm('Are you sure you want to clear the conversation?')) {
        return;
    }

    conversationHistory = [];
    chatContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="#6366f1"/>
                    <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="16" cy="16" r="3" fill="white"/>
                </svg>
            </div>
        <h2>Welcome to Moda Tharindu AI</h2>
            <p>Ask me anything! I'm powered by Google Gemini AI.</p>
            <div class="example-prompts">
                <button class="example-prompt">Explain quantum computing</button>
                <button class="example-prompt">Write a Python function to sort a list</button>
                <button class="example-prompt">What are the benefits of meditation?</button>
                <button class="example-prompt">Create a business plan outline</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.example-prompt').forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            userInput.dispatchEvent(new Event('input'));
            userInput.focus();
        });
    });

    userInput.focus();
}

// Scroll to bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Pro Features - Message Limit & Password

function loadProStatus() {
    const storedProStatus = localStorage.getItem('moda_pro_status');
    const storedMessageCount = localStorage.getItem('moda_message_count');
    
    if (storedProStatus === 'active') {
        isProUser = true;
    }
    
    if (storedMessageCount) {
        messageCount = parseInt(storedMessageCount) || 0;
    }
}

function saveMessageCount() {
    localStorage.setItem('moda_message_count', messageCount.toString());
}

function showProModal() {
    const proModal = document.getElementById('proModal');
    const proPasswordInput = document.getElementById('proPasswordInput');
    const proError = document.getElementById('proError');
    
    if (proModal) {
        proModal.style.display = 'flex';
        if (proPasswordInput) {
            proPasswordInput.value = '';
        }
        if (proError) {
            proError.style.display = 'none';
        }
        setTimeout(() => {
            if (proPasswordInput) proPasswordInput.focus();
        }, 100);
    }
}

function hideProModal() {
    const proModal = document.getElementById('proModal');
    const proPasswordInput = document.getElementById('proPasswordInput');
    const proError = document.getElementById('proError');
    
    if (proModal) {
        proModal.style.display = 'none';
    }
    if (proPasswordInput) {
        proPasswordInput.value = '';
    }
    if (proError) {
        proError.style.display = 'none';
    }
}

function handleProSubmit() {
    const proPasswordInput = document.getElementById('proPasswordInput');
    const proError = document.getElementById('proError');
    
    const password = proPasswordInput ? proPasswordInput.value.trim() : '';
    
    if (!password) {
        if (proError) {
            proError.textContent = 'Please enter a password';
            proError.style.display = 'block';
        }
        return;
    }
    
    if (password === PRO_PASSWORD) {
        isProUser = true;
        localStorage.setItem('moda_pro_status', 'active');
        hideProModal();
        showSuccessMessage('🌟 Pro activated! Unlimited messages unlocked!');
        userInput.focus();
    } else {
        if (proError) {
            proError.textContent = 'Incorrect password. Please try again.';
            proError.style.display = 'block';
        }
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1001;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

function showRemainingMessages(remaining) {
    const remainingDiv = document.createElement('div');
    remainingDiv.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999;
        animation: fadeInOut 3s ease-out;
    `;
    remainingDiv.textContent = `💬 ${remaining} free message${remaining !== 1 ? 's' : ''} remaining`;
    document.body.appendChild(remainingDiv);
    
    setTimeout(() => {
        remainingDiv.remove();
    }, 3000);
}

// ==================== SMART ACTION DETECTION SYSTEM ====================

// Action patterns for different categories
const actionPatterns = {
    shopping: {
        keywords: ['buy', 'purchase', 'shop', 'shopping', 'price', 'cost', 'amazon', 'ebay', 'store', 'product'],
        items: ['shoes', 'shirt', 'laptop', 'phone', 'book', 'clothes', 'furniture', 'electronics', 'gadget']
    },
    youtube: {
        keywords: ['watch', 'video', 'youtube', 'tutorial', 'how to', 'song', 'music video', 'movie', 'show me'],
        platforms: ['youtube']
    },
    spotify: {
        keywords: ['listen', 'music', 'song', 'playlist', 'album', 'artist', 'spotify', 'play music'],
        platforms: ['spotify']
    },
    weather: {
        keywords: ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'climate', 'hot', 'cold'],
        locations: true
    },
    news: {
        keywords: ['news', 'latest news', 'breaking news', 'headlines', 'current events', 'today news'],
        topics: true
    },
    maps: {
        keywords: ['map', 'location', 'directions', 'navigate', 'where is', 'how to get to', 'route'],
        locations: true
    },
    search: {
        keywords: ['search', 'google', 'find', 'look up', 'information about'],
        general: true
    }
};

// Detect actions from user message and AI response
function detectActions(userMessage, aiResponse) {
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
    const actions = [];

    // Shopping detection - Only add one primary shopping button
    if (actionPatterns.shopping.keywords.some(kw => combinedText.includes(kw))) {
        const item = extractShoppingItem(combinedText);
        if (item) {
            actions.push({
                type: 'shopping',
                label: `Shop for ${item}`,
                url: `https://www.amazon.com/s?k=${encodeURIComponent(item)}`,
                icon: '🛍️'
            });
        }
    }

    // YouTube detection
    if (actionPatterns.youtube.keywords.some(kw => combinedText.includes(kw))) {
        const query = extractVideoQuery(userMessage, combinedText);
        if (query) {
            actions.push({
                type: 'youtube',
                label: `Watch on YouTube`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
                icon: '▶️'
            });
        }
    }

    // Spotify detection
    if (actionPatterns.spotify.keywords.some(kw => combinedText.includes(kw))) {
        const query = extractMusicQuery(userMessage, combinedText);
        if (query) {
            actions.push({
                type: 'spotify',
                label: `Listen on Spotify`,
                url: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
                icon: '🎵'
            });
        }
    }

    // Weather detection
    if (actionPatterns.weather.keywords.some(kw => combinedText.includes(kw))) {
        const location = extractLocation(userMessage);
        actions.push({
            type: 'weather',
            label: `Check Weather${location ? ': ' + location : ''}`,
            url: location ? 
                `https://www.google.com/search?q=weather+${encodeURIComponent(location)}` :
                `https://www.google.com/search?q=weather`,
            icon: '🌤️'
        });
    }

    // News detection
    if (actionPatterns.news.keywords.some(kw => combinedText.includes(kw))) {
        const topic = extractNewsTopic(userMessage);
        actions.push({
            type: 'news',
            label: `Read News${topic ? ': ' + topic : ''}`,
            url: topic ? 
                `https://news.google.com/search?q=${encodeURIComponent(topic)}` :
                `https://news.google.com`,
            icon: '📰'
        });
    }

    // Maps detection
    if (actionPatterns.maps.keywords.some(kw => combinedText.includes(kw))) {
        const location = extractLocation(userMessage);
        if (location) {
            actions.push({
                type: 'maps',
                label: `View on Maps`,
                url: `https://www.google.com/maps/search/${encodeURIComponent(location)}`,
                icon: '🗺️'
            });
        }
    }

    // Only show search button if no other actions found
    if (actions.length === 0 && actionPatterns.search.keywords.some(kw => combinedText.includes(kw))) {
        const query = extractSearchQuery(userMessage);
        if (query) {
            actions.push({
                type: 'search',
                label: `Search Google`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                icon: '🔍'
            });
        }
    }

    // Limit to maximum 2 action buttons for cleaner UI
    return actions.slice(0, 2);
}

// Extract shopping item from text
function extractShoppingItem(text) {
    // Try to find specific item mentions
    for (const item of actionPatterns.shopping.items) {
        if (text.includes(item)) {
            return item;
        }
    }
    
    // Extract from common patterns
    const patterns = [
        /(?:buy|purchase|shop for|looking for|need|want)\s+(?:a|an|some)?\s*([a-z\s]{2,30})/i,
        /([a-z\s]{2,30})\s+(?:on amazon|on ebay|online)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Extract video query
function extractVideoQuery(originalMessage, text) {
    const patterns = [
        /(?:watch|show|find|search for)\s+(?:video|videos|tutorial)?\s*(?:about|on|for)?\s+(.+?)(?:\?|$)/i,
        /(?:how to)\s+(.+?)(?:\?|$)/i,
        /(.+?)\s+(?:video|tutorial|on youtube)/i
    ];
    
    for (const pattern of patterns) {
        const match = originalMessage.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Extract music query
function extractMusicQuery(originalMessage, text) {
    const patterns = [
        /(?:listen to|play|find)\s+(?:song|music|album)?\s*(?:by|from)?\s+(.+?)(?:\?|$)/i,
        /(?:song|music|album)\s+(.+?)(?:\?|$)/i,
        /(.+?)\s+(?:on spotify|music)/i
    ];
    
    for (const pattern of patterns) {
        const match = originalMessage.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Extract location from text
function extractLocation(text) {
    const patterns = [
        /(?:in|at|for|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:weather|map|location)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Extract news topic
function extractNewsTopic(text) {
    const patterns = [
        /news\s+(?:about|on|regarding)\s+(.+?)(?:\?|$)/i,
        /(.+?)\s+news/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && !match[1].match(/latest|breaking|today|current/i)) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Extract general search query
function extractSearchQuery(text) {
    const patterns = [
        /(?:search for|google|find|look up)\s+(.+?)(?:\?|$)/i,
        /(?:what is|who is|where is|when is|how is)\s+(.+?)(?:\?|$)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return text.trim();
}

// Add action buttons to message
function addActionButtons(messageElement, actions) {
    if (!actions || actions.length === 0) return;

    // Find the content div inside the message
    const contentDiv = messageElement.querySelector('.message-content');
    if (!contentDiv) return;

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'action-buttons';
    
    // Add a subtle intro text
    const introSpan = document.createElement('span');
    introSpan.style.cssText = 'font-size: 12px; color: #9ca3af; margin-right: 8px;';
    introSpan.textContent = '→';
    actionsContainer.appendChild(introSpan);
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'action-btn';
        button.innerHTML = `${action.icon} ${action.label}`;
        button.onclick = () => {
            window.open(action.url, '_blank');
            showActionFeedback('✓ Opened');
        };
        actionsContainer.appendChild(button);
    });
    
    contentDiv.appendChild(actionsContainer);
}

// Show action feedback
function showActionFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'action-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}
