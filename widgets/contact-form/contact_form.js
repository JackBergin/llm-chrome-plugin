document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const subjectSelect = document.getElementById('subject');
  const messageTextarea = document.getElementById('message');
  const submitButton = document.getElementById('submit-contact');
  const statusMessage = document.getElementById('contact-status');

  // Function to display status messages
  function showStatusMessage(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.style.color = isSuccess ? '#4caf50' : '#f44336';
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 5000);
  }

  // Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Handle form submission
  submitButton.addEventListener('click', function() {
    const email = emailInput.value.trim();
    const subject = subjectSelect.value;
    const message = messageTextarea.value.trim();

    // Validate inputs
    if (!email) {
      showStatusMessage('Please enter your email address.', false);
      return;
    }

    if (!isValidEmail(email)) {
      showStatusMessage('Please enter a valid email address.', false);
      return;
    }

    if (!message) {
      showStatusMessage('Please enter your message.', false);
      return;
    }

    // Prepare data for submission
    const formData = {
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    };

    // Here you would typically send the data to your backend
    // For now, we'll just simulate a successful submission
    console.log('Form data to submit:', formData);
    
    // Show success message
    showStatusMessage('Your message has been sent successfully!');
    
    // Clear form
    emailInput.value = '';
    subjectSelect.value = 'question';
    messageTextarea.value = '';
  });
});
