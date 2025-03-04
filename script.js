const API_KEY = 'AIzaSyDzCA-X2BzVlJo9A7n6lI8PXKCZtCBN1Oc'; // Replace with your actual API key

// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const chatTitle = document.getElementById('chatTitle');
const contextBtn = document.getElementById('contextBtn');
const contextModal = document.getElementById('contextModal');
const contextDetails = document.getElementById('contextDetails');

// Sample Chat Data
const predefinedChats = {
    1: [
        { type: 'ai', message: 'The largest countries by land area are:' },
        { type: 'ai', message: '1. Russia (17,098,242 km²)' },
        { type: 'ai', message: '2. Canada (9,984,670 km²)' },
        { type: 'ai', message: '3. China (9,596,961 km²)' }
    ],
    2: [
        { type: 'ai', message: 'Mars Mission Overview:' },
        { type: 'ai', message: '- NASA\'s Perseverance Rover landed in 2021' },
        { type: 'ai', message: '- Goal: Search for signs of ancient microbial life' },
        { type: 'ai', message: '- Collected rock samples for future return to Earth' }
    ],
    3: [
        { type: 'ai', message: 'Python Basics:' },
        { type: 'ai', message: '- Interpreted, high-level programming language' },
        { type: 'ai', message: '- Supports multiple programming paradigms' },
        { type: 'ai', message: '- Example: print("Hello, World!")' }
    ]
};

// Sidebar Toggle
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Chat History Item Click
chatHistory.addEventListener('click', (e) => {
    const chatItem = e.target.closest('.chat-item');
    if (chatItem) {
        const chatId = chatItem.dataset.chatId;
        loadPredefinedChat(chatId);
    }
});

// Load Predefined Chat
function loadPredefinedChat(chatId) {
    chatMessages.innerHTML = ''; // Clear existing messages
    chatTitle.textContent = chatHistory.querySelector(`[data-chat-id="${chatId}"] span`).textContent;

    predefinedChats[chatId].forEach(msg => {
        addMessage(msg.message, msg.type);
    });
}

// New Chat Button
newChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>New Chat Started</h2>
            <p>Ask me anything!</p>
        </div>
    `;
    chatTitle.textContent = 'Le Chat';
});

// Context Button
contextBtn.addEventListener('click', () => {
    contextDetails.innerHTML = `
        <p>Current Chat Context:</p>
        <ul>
            <li>Topic: ${chatTitle.textContent}</li>
            <li>Total Messages: ${chatMessages.children.length}</li>
            <li>Last Interaction: Just now</li>
        </ul>
    `;
    contextModal.style.display = 'block';
});

// Close Modal
document.querySelector('.close-modal').addEventListener('click', () => {
    contextModal.style.display = 'none';
});

// Add Message Function
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${type}-message`);
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Message Function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';

    // Add loading indicator
    addMessage('Generating response...', 'ai');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

        // Remove loading indicator and add AI response
        chatMessages.removeChild(chatMessages.lastChild);
        addMessage(aiResponse, 'ai');

    } catch (error) {
        console.error('Error:', error);
        chatMessages.removeChild(chatMessages.lastChild);
        addMessage('Sorry, there was an error processing your request.', 'ai');
    }
}

// Enable sending message with Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Responsive Sidebar
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});
// Extended JavaScript with Advanced Features

// Theme Management
const themes = {
    light: {
        primaryColor: '#4285F4',
        secondaryColor: '#34A853',
        backgroundColor: '#F1F3F4',
        textColor: '#202124'
    },
    dark: {
        primaryColor: '#8AB4F8',
        secondaryColor: '#5FE084',
        backgroundColor: '#202124',
        textColor: '#E0E0E0'
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    
    // Additional theme-specific adjustments
    document.body.classList.toggle('dark-mode', themeName === 'dark');
    localStorage.setItem('selectedTheme', themeName);
}

// Chat History Management
class ChatHistoryManager {
    constructor() {
        this.chats = JSON.parse(localStorage.getItem('chatHistory')) || [];
    }

    addChat(chat) {
        this.chats.push({
            id: Date.now(),
            title: chat.title,
            messages: chat.messages,
            timestamp: new Date().toISOString()
        });
        this.save();
    }

    getChatById(id) {
        return this.chats.find(chat => chat.id === id);
    }

    getAllChats() {
        return this.chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    save() {
        localStorage.setItem('chatHistory', JSON.stringify(this.chats));
    }

    clearHistory() {
        this.chats = [];
        this.save();
    }
}

// Advanced Context Tracking
class ContextTracker {
    constructor() {
        this.context = {
            topics: [],
            keyQuestions: [],
            conversationFlow: []
        };
    }

    addMessage(message, type) {
        this.context.conversationFlow.push({
            message,
            type,
            timestamp: new Date().toISOString()
        });

        // Extract potential topics and key questions
        if (type === 'user') {
            this.extractContextDetails(message);
        }
    }

    extractContextDetails(message) {
        // Simple context extraction (can be made more sophisticated)
        const keywords = message.toLowerCase().split(' ');
        const potentialTopics = keywords.filter(word => word.length > 3);
        
        if (potentialTopics.length > 0) {
            this.context.topics = [...new Set([...this.context.topics, ...potentialTopics])];
        }
    }

    getContext() {
        return {
            ...this.context,
            totalMessages: this.context.conversationFlow.length
        };
    }

    reset() {
        this.context = {
            topics: [],
            keyQuestions: [],
            conversationFlow: []
        };
    }
}

// Main Application Class
class GeminiChatApp {
    constructor() {
        // Initialize core components
        this.chatHistoryManager = new ChatHistoryManager();
        this.contextTracker = new ContextTracker();
        
        // DOM Elements
        this.initElements();
        
        // Event Listeners
        this.setupEventListeners();
        
        // Initialize theme
        this.initializeTheme();
    }

    initElements() {
        this.sidebarEl = document.getElementById('sidebar');
        this.chatMessagesEl = document.getElementById('chat-messages');
        this.messageInputEl = document.getElementById('message-input');
        this.chatTitleEl = document.getElementById('chatTitle');
        this.contextModalEl = document.getElementById('contextModal');
    }

    setupEventListeners() {
        // Theme switcher
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const currentTheme = localStorage.getItem('selectedTheme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });

        // Send message
        this.messageInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Context modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.contextModalEl.style.display = 'none';
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        applyTheme(savedTheme);
    }

    async sendMessage() {
        const message = this.messageInputEl.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.contextTracker.addMessage(message, 'user');
        this.messageInputEl.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const aiResponse = await this.generateAIResponse(message);
            
            // Remove typing indicator and add AI response
            this.hideTypingIndicator();
            this.addMessage(aiResponse, 'ai');
            this.contextTracker.addMessage(aiResponse, 'ai');

        } catch (error) {
            this.handleError(error);
        }
    }

    async generateAIResponse(message) {
        // Simulated AI response generation
        // Replace with actual Gemini API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const responses = [
                    "That's an interesting point. Could you tell me more?",
                    "I'm processing your query carefully.",
                    "Let me provide some insights on that.",
                    "Here's what I understand about your question."
                ];
                resolve(responses[Math.floor(Math.random() * responses.length)]);
            }, 1500);
        });
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        messageDiv.textContent = content;
        this.chatMessagesEl.appendChild(messageDiv);
        this.chatMessagesEl.scrollTop = this.chatMessagesEl.scrollHeight;
    }

    showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.chatMessagesEl.appendChild(typingIndicator);
    }

    hideTypingIndicator() {
        const typingIndicator = this.chatMessagesEl.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    handleError(error) {
        console.error('Chat Error:', error);
        this.hideTypingIndicator();
        this.addMessage('Oops! Something went wrong. Please try again.', 'ai');
        
        // Optional: More detailed error tracking
        this.logErrorToConsole(error);
    }

    logErrorToConsole(error) {
        console.group('Chat Error Details');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.groupEnd();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new GeminiChatApp();
});

