document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_KEY = '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';
    const MODEL = 'google/gemma-3-12b-it:free';

    // Elements
    const greetingSection = document.getElementById('greeting-section');
    const greetingElement = document.getElementById('greeting');
    const inputContainer = document.querySelector('.input-container');
    const inputElement = document.getElementById('user-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatHistory = document.getElementById('chat-history');
    const mainContent = document.querySelector('.main-content');

    // Dynamic Greeting
    function updateGreeting() {
        const hour = new Date().getHours();
        let greetingText = 'Hello';

        if (hour >= 5 && hour < 12) {
            greetingText = 'Good morning';
        } else if (hour >= 12 && hour < 18) {
            greetingText = 'Good afternoon';
        } else {
            greetingText = 'Good evening';
        }

        const emoji = hour < 18 ? '☀️' : '✨';
        greetingElement.innerHTML = `<span style="font-size: 0.8em">${emoji}</span> ${greetingText}, Group 13`;
    }

    updateGreeting();

    // Interaction State
    let isChatActive = false;

    function activateChatMode() {
        if (!isChatActive) {
            isChatActive = true;
            greetingSection.classList.add('hidden');
            chatHistory.classList.remove('hidden');
            mainContent.classList.add('has-chat');
        }
    }

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Use Marked.js to parse markdown
        // If it's a user message, we might still want plain text or simple markdown
        if (isUser) {
            contentDiv.textContent = text;
        } else {
            contentDiv.innerHTML = marked.parse(text);
            // Apply syntax highlighting to new code blocks
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        msgDiv.appendChild(contentDiv);
        chatHistory.appendChild(msgDiv);

        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function handleQuery(query) {
        if (!query.trim()) return;

        activateChatMode();
        addMessage(query, true);
        inputElement.value = '';

        // Show loading indicator (simple placeholder)
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai loading';
        loadingDiv.innerHTML = '<div class="message-content">...</div>';
        chatHistory.appendChild(loadingDiv);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    // Optional headers for OpenRouter
                    "HTTP-Referer": window.location.href,
                    "X-Title": "Minimal AI Assistant"
                },
                body: JSON.stringify({
                    "model": MODEL,
                    "messages": [
                        { "role": "user", "content": query }
                    ]
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'API Error');
            }

            const data = await response.json();
            const aiText = data.choices[0].message.content;

            // Remove loading and add response
            chatHistory.removeChild(loadingDiv);
            addMessage(aiText, false);

        } catch (error) {
            console.error(error);
            chatHistory.removeChild(loadingDiv);
            addMessage("Sorry, I encountered an error connecting to the AI.", false);
        }
    }



    // Input Focus Effects
    const inputWrapper = document.querySelector('.input-wrapper');
    inputElement.addEventListener('focus', () => inputWrapper.classList.add('focused'));
    inputElement.addEventListener('blur', () => inputWrapper.classList.remove('focused'));

    // Handle Input
    function submitInput() {
        handleQuery(inputElement.value);
    }

    inputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitInput();
        }
    });

    sendBtn.addEventListener('click', submitInput);
});
