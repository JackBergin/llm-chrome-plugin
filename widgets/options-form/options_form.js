document.addEventListener('DOMContentLoaded', function () {
    // Fetch the elements from the DOM using their respective IDs
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save-button');
    const deleteButton = document.getElementById('delete-button');
    const statusMessage = document.getElementById('status-message');

    // Function to display status messages and clear them after a specified timeout
    function showStatusMessage(message, isSuccess = true) {
        statusMessage.textContent = message;
        statusMessage.style.color = isSuccess ? 'green' : 'red';
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000); // Clear the status message after 3 seconds
    }

    // Retrieve the saved API key from Chrome's local storage
    chrome.storage.local.get(['apiKey'], function (result) {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving API key from storage:', chrome.runtime.lastError);
            showStatusMessage('Failed to retrieve saved API key.', false);
            return;
        }
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey; // Populate the input field with the saved key
        }
    });

    // Event listener for the Save button click
    saveButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value.trim(); // Get and trim the entered API key
    
        // Validate the API key with length and structure checks
        if (apiKey !== '' && apiKey.length > 10 && apiKey.startsWith('sk-')) {
            // Save the API key to Chrome's local storage
            chrome.storage.local.set({ apiKey }, function () {
                if (chrome.runtime.lastError) {
                    console.error('Error saving API key:', chrome.runtime.lastError);
                    showStatusMessage('Failed to save API key.', false);
                    return;
                }
                showStatusMessage('API key saved successfully!');
            });
        } else {
            // Display an error message for invalid API key input
            showStatusMessage('Invalid API key. Please enter a valid API key.', false);
        }
    });
    

    // Event listener for the Delete button click
    deleteButton.addEventListener('click', function () {
        // Remove the API key from local storage
        chrome.storage.local.remove(['apiKey'], function () {
            if (chrome.runtime.lastError) {
                console.error('Error removing API key:', chrome.runtime.lastError);
                showStatusMessage('Failed to delete API key.', false);
                return;
            }
            apiKeyInput.value = ''; // Clear the input field
            showStatusMessage('API key deleted successfully!');
        });
    });

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
