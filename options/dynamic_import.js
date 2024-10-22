document.addEventListener('DOMContentLoaded', async function () {
  const formContainer = document.getElementById('form-container');

  // Set formContainer to use flexbox for horizontal layout
  formContainer.style.display = 'flex';
  formContainer.style.justifyContent = 'space-between'; // Space between the two forms
  formContainer.style.gap = '50px'; // Add space between forms
  formContainer.style.alignItems = 'flex-start'; // Align items at the top

  // Fetch and insert the options form
  const optionsFormUrl = chrome.runtime.getURL('widgets/options-form/options_form.html');
  const optionsFormResponse = await fetch(optionsFormUrl);
  const optionsFormHTML = await optionsFormResponse.text();
  formContainer.innerHTML += `<div${optionsFormHTML}</div>`;

  // Fetch and insert the contact form
  const contactFormUrl = chrome.runtime.getURL('widgets/contact-form/contact_form.html');
  const contactFormResponse = await fetch(contactFormUrl);
  const contactFormHTML = await contactFormResponse.text();
  formContainer.innerHTML += `<div${contactFormHTML}</div>`;

  // Load JS and CSS files dynamically
  loadFormAssets('widgets/options-form/options_form.js', 'widgets/options-form/options_form.css');
  loadFormAssets('widgets/contact-form/contact_form.js', 'widgets/contact-form/contact_form.css');

  // Initialize the forms once the HTML is loaded and JS is attached
  initializeOptionsForm();
});

// Function to initialize form behavior
function initializeOptionsForm() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('save-button');
  const deleteButton = document.getElementById('delete-button');
  const statusMessage = document.getElementById('status-message');

  // Function to display status messages
  function showStatusMessage(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.style.color = isSuccess ? 'green' : 'red';
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);
  }

  // Retrieve the saved API key
  chrome.storage.local.get(['apiKey'], function (result) {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  // Save the API key
  saveButton.addEventListener('click', function () {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey !== '' && apiKey.length > 10 && apiKey.startsWith('sk-')) {
      chrome.storage.local.set({ apiKey }, function () {
        showStatusMessage('API key saved successfully!');
      });
    } else {
      showStatusMessage('Invalid API key. Please enter a valid API key.', false);
    }
  });

  // Delete the API key
  deleteButton.addEventListener('click', function () {
    chrome.storage.local.remove(['apiKey'], function () {
      apiKeyInput.value = '';
      showStatusMessage('API key deleted successfully!');
    });
  });
}

function loadFormAssets(jsPath, cssPath) {
  // Load JS
  const jsUrl = chrome.runtime.getURL(jsPath);
  const scriptElement = document.createElement('script');
  scriptElement.src = jsUrl;
  document.body.appendChild(scriptElement);

  // Load CSS
  const cssUrl = chrome.runtime.getURL(cssPath);
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = cssUrl;
  document.head.appendChild(linkElement);
}
