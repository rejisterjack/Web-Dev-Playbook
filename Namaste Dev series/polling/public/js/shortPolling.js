// Short Polling Implementation
let shortPollingTimer = null;
let shortPollCounter = 0;
let shortUpdateCounter = 0;
let lastShortPollTimestamp = 0;
const SHORT_POLL_INTERVAL = 3000; // 3 seconds

const shortPollingMessagesElement = document.getElementById('shortPollingMessages');
const shortPollCountElement = document.getElementById('shortPollCount');
const shortPollUpdatesElement = document.getElementById('shortPollUpdates');
const startShortPollingButton = document.getElementById('startShortPolling');
const stopShortPollingButton = document.getElementById('stopShortPolling');

// Function to fetch data using short polling
async function fetchShortPoll() {
  try {
    shortPollCounter++;
    shortPollCountElement.textContent = shortPollCounter;
    
    const response = await fetch('/api/short-poll');
    const data = await response.json();
    
    // Process only new messages
    const newMessages = data.messages.filter(msg => msg.timestamp > lastShortPollTimestamp);
    
    if (newMessages.length > 0) {
      shortUpdateCounter += newMessages.length;
      shortPollUpdatesElement.textContent = shortUpdateCounter;
      
      // Display new messages
      newMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
          <div>${message.text}</div>
          <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
        `;
        shortPollingMessagesElement.appendChild(messageElement);
      });
      
      // Auto-scroll to latest message
      shortPollingMessagesElement.scrollTop = shortPollingMessagesElement.scrollHeight;
    }
    
    lastShortPollTimestamp = data.timestamp;
    
  } catch (error) {
    console.error('Short polling error:', error);
  }
}

// Start short polling
startShortPollingButton.addEventListener('click', () => {
  if (!shortPollingTimer) {
    // Fetch immediately and then set up interval
    fetchShortPoll();
    shortPollingTimer = setInterval(fetchShortPoll, SHORT_POLL_INTERVAL);
    
    startShortPollingButton.disabled = true;
    stopShortPollingButton.disabled = false;
  }
});

// Stop short polling
stopShortPollingButton.addEventListener('click', () => {
  if (shortPollingTimer) {
    clearInterval(shortPollingTimer);
    shortPollingTimer = null;
    
    startShortPollingButton.disabled = false;
    stopShortPollingButton.disabled = true;
  }
});
