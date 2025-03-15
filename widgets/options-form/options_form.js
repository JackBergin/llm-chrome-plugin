document.addEventListener('DOMContentLoaded', function () {
    // Get form elements
    const apiKeyInput = document.getElementById('apiKey');
    const togglePasswordButton = document.getElementById('toggle-password');
    const saveButton = document.getElementById('save-button');
    const deleteButton = document.getElementById('delete-button');
    const statusMessage = document.getElementById('status-message');
    const defaultModelSelect = document.getElementById('default-model');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const autoClearToggle = document.getElementById('auto-clear-toggle');

    // Toggle password visibility
    togglePasswordButton.addEventListener('click', function() {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        togglePasswordButton.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye"></i>' : 
            '<i class="fas fa-eye-slash"></i>';
    });

    // Function to display status messages
    function showStatusMessage(message, isSuccess = true) {
        statusMessage.textContent = message;
        statusMessage.style.color = isSuccess ? '#4caf50' : '#f44336';
        // Make sure the message is visible
        statusMessage.style.display = 'block';
        
        // Clear the message after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.style.display = 'none';
        }, 3000);
    }

    // Load saved settings
    function loadSavedSettings() {
        // Load API key
        chrome.storage.local.get(['apiKey'], function (result) {
            if (result.apiKey) {
                apiKeyInput.value = result.apiKey;
            }
        });

        // Load default model
        chrome.storage.local.get(['apiModel'], function (result) {
            if (result.apiModel) {
                defaultModelSelect.value = result.apiModel;
            }
        });

        // Load dark mode setting
        chrome.storage.local.get(['darkMode'], function (result) {
            // Default to true if not set
            const isDarkMode = result.darkMode !== undefined ? result.darkMode : true;
            darkModeToggle.checked = isDarkMode;
            
            // Apply theme to document
            applyTheme(isDarkMode);
        });

        // Load auto-clear setting
        chrome.storage.local.get(['autoClear'], function (result) {
            autoClearToggle.checked = result.autoClear || false;
        });
    }

    // Apply theme based on dark mode setting
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // Save API key
    saveButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatusMessage('Please enter an API key', false);
            return;
        }
        
        chrome.storage.local.set({ apiKey: apiKey }, function () {
            showStatusMessage('API key saved successfully!');
        });
    });

    // Delete API key
    deleteButton.addEventListener('click', function () {
        chrome.storage.local.remove('apiKey', function () {
            apiKeyInput.value = '';
            showStatusMessage('API key deleted successfully!');
        });
    });

    // Save default model
    defaultModelSelect.addEventListener('change', function () {
        chrome.storage.local.set({ apiModel: this.value }, function () {
            showStatusMessage('Default model saved successfully!');
        });
    });

    // Toggle dark mode
    darkModeToggle.addEventListener('change', function () {
        const isDarkMode = this.checked;
        
        // Save to storage
        chrome.storage.local.set({ darkMode: isDarkMode }, function () {
            showStatusMessage('Theme preference saved successfully!');
        });
        
        // Apply theme
        applyTheme(isDarkMode);
        
        // Broadcast theme change to all extension pages
        chrome.runtime.sendMessage({ 
            action: 'themeChanged', 
            darkMode: isDarkMode 
        });
    });

    // Toggle auto-clear
    autoClearToggle.addEventListener('change', function () {
        chrome.storage.local.set({ autoClear: this.checked }, function () {
            showStatusMessage('Auto-clear preference saved successfully!');
        });
    });

    // Initialize form with saved settings
    loadSavedSettings();

    // Initialize camera permission toggle
    const cameraToggle = document.getElementById('camera-permission');
    if (cameraToggle) {
        // Load saved preference
        chrome.storage.local.get(['cameraEnabled'], (result) => {
            cameraToggle.checked = result.cameraEnabled || false;
        });

        // Save changes
        cameraToggle.addEventListener('change', (e) => {
            chrome.storage.local.set({ cameraEnabled: e.target.checked });
            
            // Request camera permission if enabled
            if (e.target.checked) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                    })
                    .catch(err => {
                        console.error('Camera permission denied:', err);
                        e.target.checked = false;
                        chrome.storage.local.set({ cameraEnabled: false });
                    });
            }
        });
    }

    // Localize the options page content using the Chrome i18n API
    try {
        // Localize the title of the page
        document.getElementById('optionsTitle').innerHTML = chrome.i18n.getMessage("optionsTitle");

        // Localize the API key label
        document.getElementById('apiTitle').innerHTML = chrome.i18n.getMessage("apiTitle");

        // Localize the API key input field's placeholder text
        apiKeyInput.placeholder = chrome.i18n.getMessage("optionsInputPlaceholder");

        // Localize the note under the API key input field
        document.getElementById('api-key-note').innerHTML = chrome.i18n.getMessage("optionsApiKeyNote");

        // Localize the save button text
        document.getElementById('save-button-text').innerText = chrome.i18n.getMessage("optionsSaveButtonText");

        // Localize the delete button text
        document.getElementById('delete-button-text').innerText = chrome.i18n.getMessage("optionsDeleteButtonText");
    } catch (error) {
        console.error('Localization error:', error);
        showStatusMessage('Error loading localization messages.', false);
    }
});

class OptionsForm {
    constructor() {
        this.initializeCameraPermission();
    }

    initializeCameraPermission() {
        const cameraToggle = document.getElementById('camera-permission');
        
        // Load saved preference
        chrome.storage.sync.get(['cameraEnabled'], (result) => {
            cameraToggle.checked = result.cameraEnabled || false;
        });

        // Save changes
        cameraToggle.addEventListener('change', (e) => {
            chrome.storage.sync.set({ cameraEnabled: e.target.checked });
            
            // Request camera permission if enabled
            if (e.target.checked) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                    })
                    .catch(err => {
                        console.error('Camera permission denied:', err);
                        e.target.checked = false;
                        chrome.storage.sync.set({ cameraEnabled: false });
                    });
            }
        });
    }
}
