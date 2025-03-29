document.addEventListener('DOMContentLoaded', function () {
    // Fetch the elements
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save-button');
    const deleteButton = document.getElementById('delete-button');
    const statusMessage = document.getElementById('status-message');

    // Retrieve the saved API key from local storage
    chrome.storage.local.get(['apiKey'], function (result) {
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    // Add event listener to the save button
    saveButton.addEventListener('click', function () {
        // Get the entered API key
        const apiKey = apiKeyInput.value.trim();

        // Check if the API key is not empty
        if (apiKey !== '' && apiKey.length > 10 && apiKey.length < 1000 && apiKey.includes('sk-')) {
            // Save the API key to local storage
            chrome.storage.local.set({ apiKey }, function () {
                // Update the status message
                statusMessage.textContent = 'API key saved successfully!';
                setTimeout(function () {
                    // Clear the status message after 2 seconds
                    statusMessage.textContent = '';
                }, 2000);
            });
        } else {
            // Display an error message if the API key is empty
            statusMessage.textContent = 'Please enter a valid API key.';
        }
    });

    // Add event listener to the delete button
    deleteButton.addEventListener('click', function () {
        // Remove the API key from local storage
        chrome.storage.local.remove(['apiKey'], function () {
            // Update the status message
            statusMessage.textContent = 'API key deleted successfully!';
            apiKeyInput.value = '';
            setTimeout(function () {
                // Clear the status message after 2 seconds
                statusMessage.textContent = '';
            }, 2000);
        });
    });

    // Add camera toggle functionality
    const cameraToggle = document.getElementById('cameraToggle');
    const cameraStatus = document.getElementById('camera-status');

    // Load saved camera permission state
    chrome.storage.local.get(['cameraEnabled'], function(result) {
        cameraToggle.checked = result.cameraEnabled || false;
        updateCameraStatus(result.cameraEnabled);
    });

    cameraToggle.addEventListener('change', function() {
        const enabled = this.checked;
        
        if (enabled) {
            // Request camera permissions
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
                    chrome.storage.local.set({ cameraEnabled: true });
                    updateCameraStatus(true);
                })
                .catch(function(err) {
                    console.error("Error accessing camera:", err);
                    cameraToggle.checked = false;
                    chrome.storage.local.set({ cameraEnabled: false });
                    updateCameraStatus(false);
                    alert("Could not access camera. Please check your browser permissions.");
                });
        } else {
            chrome.storage.local.set({ cameraEnabled: false });
            updateCameraStatus(false);
        }
    });

    function updateCameraStatus(enabled) {
        cameraStatus.textContent = enabled ? 'Camera is enabled' : 'Camera is disabled';
    }
});

// localize title optionsTitle
document.getElementById('optionsTitle').innerHTML = chrome.i18n.getMessage("optionsTitle");

// localize api title apiTitle
document.getElementById('apiTitle').innerHTML = chrome.i18n.getMessage("apiTitle");

// localize the api key input placeholder
document.getElementById('apiKey').placeholder = chrome.i18n.getMessage("optionsInputPlaceholder");

// localize api-key-note
document.getElementById('api-key-note').innerHTML = chrome.i18n.getMessage("optionsApiKeyNote");

// localize save button text
document.getElementById('save-button-text').innerText = chrome.i18n.getMessage("optionsSaveButtonText");

// localize delete button text
document.getElementById('delete-button-text').innerText = chrome.i18n.getMessage("optionsDeleteButtonText");

