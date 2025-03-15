// Apply theme on page load
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['darkMode'], function (result) {
    // Default to true if not set
    const isDarkMode = result.darkMode !== undefined ? result.darkMode : true;
    
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  });
}); 