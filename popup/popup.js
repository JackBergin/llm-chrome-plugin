document.addEventListener('DOMContentLoaded', function () {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const cancelChatBtn = document.getElementById('cancel-chat-btn');
    const settingsBtn = document.getElementById('settings-btn');

    // Camera elements
    const cameraView = document.getElementById('camera-view');
    const toggleCameraBtn = document.getElementById('toggle-camera');
    let stream = null;
    let cameraEnabled = false;

    // If the user has not entered an API key, open the options page
    chrome.storage.local.get('apiKey', ({ apiKey }) => {
        console.log('apiKey', apiKey);
        if (!apiKey || apiKey.length < 10) {
            chrome.runtime.openOptionsPage();
        }
    });

    // Fetch chat history from local storage and display it
    chrome.storage.local.get(['chatHistory'], function (result) {
        const chatHistory = result.chatHistory || [];

        if (chatHistory.length > 0) {
            // display the chat history
            displayMessages(chatHistory);

            // scroll to bottom of chat-messages div    
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            // show a image of the icon and a text with "how can I help you?"
            displayAssistanInfo();
        }

        checkClearChatBtn();
    });

    // focus on the input field
    userInput.focus();

    // disable the send button by default
    sendBtn.disabled = true;

    // disable the send button if the input field is empty
    userInput.addEventListener('keyup', function () {
        const userMessage = userInput.value.trim();
        sendBtn.disabled = userMessage === '';
    });

    // If the user presses enter, click the send button
    userInput.addEventListener('keyup', function (event) {
        if (event.code === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendBtn.click();
        }
    });

    // Auto-resize the input field based on the content
    userInput.addEventListener('input', function () {
        this.style.height = 'auto'; // Reset the height
        // Set the height of the input field based on the content
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        // Enable scrolling if the content is too long
        this.style.overflowY = this.scrollHeight > 100 ? 'scroll' : 'auto';
    });

    // Initialize camera state from storage
    chrome.storage.local.get(['cameraEnabled'], function(result) {
        cameraEnabled = result.cameraEnabled || false;
        if (cameraEnabled) {
            startCamera();
        } else {
            toggleCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
            toggleCameraBtn.classList.add('off');
        }
    });
    
    // Toggle camera
    toggleCameraBtn.addEventListener('click', function() {
        if (cameraEnabled) {
            stopCamera();
        } else {
            startCamera();
        }
    });
    
    // Start camera
    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(mediaStream) {
                stream = mediaStream;
                cameraView.srcObject = mediaStream;
                cameraEnabled = true;
                toggleCameraBtn.innerHTML = '<i class="fas fa-video"></i>';
                toggleCameraBtn.classList.remove('off');
                chrome.storage.local.set({ cameraEnabled: true });
            })
            .catch(function(error) {
                console.error('Could not access camera:', error);
                cameraEnabled = false;
                toggleCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
                toggleCameraBtn.classList.add('off');
                chrome.storage.local.set({ cameraEnabled: false });
            });
    }
    
    // Stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            cameraView.srcObject = null;
        }
        cameraEnabled = false;
        toggleCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
        toggleCameraBtn.classList.add('off');
        chrome.storage.local.set({ cameraEnabled: false });
    }

    // Model dropdown
    const modelDropdownBtn = document.getElementById('model-dropdown-btn');
    const modelDropdownContent = document.getElementById('model-dropdown-content');
    modelDropdownBtn.addEventListener('click', function() {
        if (modelDropdownContent.style.display === 'block') {
            modelDropdownContent.style.display = 'none';
        } else {
            modelDropdownContent.style.display = 'block';
        }
    });
    
    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('#model-dropdown-btn') && 
            !event.target.matches('#model-dropdown-btn-icon') && 
            !event.target.matches('#model-dropdown-btn-text')) {
            modelDropdownContent.style.display = 'none';
        }
    });
    
    // Set active model
    document.querySelectorAll('.model-dropdown-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modelId = this.id;
            document.getElementById('model-dropdown-btn-text').innerText = this.innerText;
            setActiveModel(modelId);
            chrome.storage.local.set({ apiModel: modelId });
            modelDropdownContent.style.display = 'none';
        });
    });
    
    // Set the active model in the dropdown
    function setActiveModel(modelId) {
        document.querySelectorAll('.model-dropdown-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        document.getElementById(modelId).classList.add('active');
    }

    // fucntion to check if the clear chat button should be enabled or disabled
    function checkClearChatBtn() {
        chrome.storage.local.get(['chatHistory'], function (result) {
            const chatHistory = result.chatHistory || [];
            if (chatHistory.length > 0) {
                clearChatBtn.disabled = false;
            } else {
                clearChatBtn.disabled = true;
            }
        });
    }

    // Clear the chat history when the clear chat button is clicked
    clearChatBtn.addEventListener('click', function () {
        // Display a confirmation popup
        const isConfirmed = window.confirm('Are you sure you want to clear the chat history?');

        // If the user confirms, clear the chat history
        if (isConfirmed) {
            chrome.storage.local.set({ chatHistory: [] }, function () {
                console.log('Chat history cleared');
                chatMessages.innerHTML = '';
                sendBtn.disabled = true;
                checkClearChatBtn();
                displayAssistanInfo();
            });
        }
    });

    // Cancel current chat
    cancelChatBtn.addEventListener('click', function() {
        // Add logic to cancel the current ongoing chat
        displayMessage('system', 'Current chat has been cancelled.');
    });

    // Open settings
    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    // Handle sending messages
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            displayMessage('user', message);
            userInput.value = '';
            // Add logic to send message to AI and handle response
        }
    }

    // Display message in chat
    function displayMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        if (role === 'assistant' || role === 'user') {
            // Add action buttons for user and assistant messages
            const actionBtns = document.createElement('div');
            actionBtns.className = 'action-btns';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(content);
            });
            
            actionBtns.appendChild(copyBtn);
            messageDiv.appendChild(actionBtns);
        }
        
        // Use marked.js to render markdown for assistant messages
        if (role === 'assistant') {
            messageDiv.innerHTML += marked.parse(content);
        } else {
            messageDiv.innerHTML += content;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessageContent(text) {
        return text.replace(/```(\w+)([\s\S]*?)```/g, function (match, lang, code) {
            // Create a code element
            var codeElement = document.createElement('code');
            // remove the first line break from the code
            code = code.replace(/^\n/, '');

            // Add the code to the code element
            codeElement.innerText = code;

            // Create a container for the code element
            var codeContainer = document.createElement('div');
            codeContainer.appendChild(codeElement);

            // Set the class of the container based on the language (optional)
            codeContainer.className = 'code-block';

            // Return the HTML content with the replaced code
            return codeContainer.outerHTML;
        });
    }

    // Function to display an array of messages
    function displayMessages(messages) {
        for (const message of messages) {
            if (message.role !== 'system') {
                displayMessage(message.role, message.content);
            }
        }
    }

    // Check if the popup was triggered by meal detection
    chrome.storage.local.get(['pendingSystemMessage', 'popupTriggeredByMealDetection'], function(result) {
        if (result.popupTriggeredByMealDetection && result.pendingSystemMessage) {
            // Clear the flags
            chrome.storage.local.remove(['pendingSystemMessage', 'popupTriggeredByMealDetection']);
            
            // Send the system message to the AI
            const systemMessage = result.pendingSystemMessage;
            
            // Add a small delay to ensure the UI is ready
            setTimeout(() => {
                // Send the system message to the background script
                chrome.runtime.sendMessage({ 
                    systemMessage: systemMessage 
                });
                
                // Show a loading message in the chat
                displayMessage('system', 'Detecting your meal... preparing wellness check.');
            }, 500);
        }
    });

    // Set the active model when the popup is opened
    chrome.storage.local.get(['apiModel'], function(result) {
        if (result.apiModel) {
            // Update the text on the main button
            document.getElementById("model-dropdown-btn-text").innerText = 
                document.getElementById(result.apiModel).innerText;
            // Set active model in the dropdown
            setActiveModel(result.apiModel);
        }
    });

    function displayAssistanInfo() {
        // Create a div element for the message
        const messageElement = document.createElement('div');
        messageElement.id = 'assistant-info-wrapper';

        // Create an img element for the icon
        const icon = document.createElement('img');
        icon.src = '/assets/icons/icon-128.png';
        icon.alt = 'Assistant icon';
        icon.className = 'assistant-info-icon';
        messageElement.appendChild(icon);

        // Create a p element for the text
        const text = document.createElement('p');
        text.innerText = 'How can I help you?';
        text.className = 'assistant-info-text';
        messageElement.appendChild(text);

        // Append the message element to the chatMessages container
        chatMessages.appendChild(messageElement);
    }

    function hideAssistanInfo() {
        const assistantInfo = document.getElementById('assistant-info-wrapper');
        if (assistantInfo) {
            assistantInfo.remove();
        }
    }
});