// Configuration
const API_URL = window.location.origin + '/api/chat';

// State
let conversationHistory = [];
let isProcessing = false;

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');

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
    userInput.focus();
});

// Event Listeners
function setupEventListeners() {
    // Send button click
    sendBtn.addEventListener('click', handleSendMessage);

    // Enter key to send (Shift+Enter for new line)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
        
        // Enable/disable send button
        sendBtn.disabled = !userInput.value.trim() || isProcessing;
    });

    // Clear chat button
    clearBtn.addEventListener('click', clearChat);

    // Example prompts
    document.querySelectorAll('.example-prompt').forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            userInput.dispatchEvent(new Event('input'));
            userInput.focus();
        });
    });
}

// Handle sending message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessing) return;

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;
    isProcessing = true;

    // Remove welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    // Add user message to UI
    addMessageToUI('user', message);

    // Add user message to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
        // Send request to API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: conversationHistory,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove typing indicator
        typingIndicator.remove();

        // Create assistant message element
        const assistantMessage = createMessageElement('assistant', '');
        chatContainer.appendChild(assistantMessage);

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    
                    if (data === '[DONE]') {
                        break;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        
                        if (content) {
                            assistantResponse += content;
                            updateMessageContent(assistantMessage, assistantResponse);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        // Add assistant response to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: assistantResponse
        });

        // Add copy button
        addCopyButton(assistantMessage);

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        
        let errorMessage = '❌ Sorry, there was an error processing your request.';
        
        // Try to get more specific error from server
        if (error.message) {
            errorMessage += ` ${error.message}`;
        }
        
        addMessageToUI('assistant', errorMessage + '\n\n**Tip:** Check the browser console for more details.');
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
            // Highlight code blocks
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
    
    // Highlight code blocks
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

    // Re-attach event listeners to example prompts
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
