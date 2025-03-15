document.addEventListener('DOMContentLoaded', function() {
  // Load the options form
  fetch('../widgets/options-form/options_form.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('form-container').innerHTML = html;
      
      // Load the options form script
      const script = document.createElement('script');
      script.src = '../widgets/options-form/options_form.js';
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading options form:', error));

  // Load the contact form
  fetch('../widgets/contact-form/contact_form.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contact-form-container').innerHTML = html;
      
      // Load the contact form script if it exists
      const script = document.createElement('script');
      script.src = '../widgets/contact-form/contact_form.js';
      script.onerror = function() {
        console.log('Contact form script not found or failed to load');
      };
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading contact form:', error));

  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Initialize camera permission toggle
  const cameraToggle = document.getElementById('camera-permission');
  const dataCollectionToggle = document.getElementById('data-collection');
  
  // Load saved preferences
  chrome.storage.sync.get(['cameraEnabled', 'dataCollection'], (result) => {
    cameraToggle.checked = result.cameraEnabled || false;
    dataCollectionToggle.checked = result.dataCollection !== undefined ? result.dataCollection : true;
  });

  // Save camera permission changes
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

  // Save data collection preference
  dataCollectionToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ dataCollection: e.target.checked });
  });
});
