// Listen for theme change messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'themeChanged') {
        if (request.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
}); 