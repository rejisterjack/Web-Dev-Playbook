// Long Polling Implementation
let isLongPollingActive = false;
let longPollCounter = 0;
let longUpdateCounter = 0;
let lastLongPollTimestamp = 0;

const longPollingMessagesElement = document.getElementById('longPollingMessages');
const longPollCountElement = document.getElementById('longPollCount');
const longPollUpdatesElement = document.getElementById('longPollUpdates');
const startLongPollingButton = document.getElementById('startLongPolling');
const stopLongPollingButton = document.getElementById('stopLongPolling');
const addMessageButton = document.getElementById('addMessage');

// Function to fetch data using long polling
async function fetchLongPoll() {
  if (!isLongPollingActive) return;
  
  try {
    longPollCounter++;
    longPollCountElement.textContent = longPollCounter;
    
    const response = await fetch(`/api/long-poll?timestamp=${lastLongPollTimestamp}`);
    const data = await response.json();
    
    // Process messages if any
    if (data.messages && data.messages.length > 0) {
      longUpdateCounter += data.messages.length;
      longPollUpdatesElement.textContent = longUpdateCounter;
      
      // Display new messages
      data.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
          <div>${message.text}</div>
          <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
        `;
        longPollingMessagesElement.appendChild(messageElement);
      });
      
      // Auto-scroll to latest message
      longPollingMessagesElement.scrollTop = longPollingMessagesElement.scrollHeight;
    }
    
    lastLongPollTimestamp = data.timestamp;
    
    // Immediately request again (this is the key to long polling)
    if (isLongPollingActive) {
      fetchLongPoll();
    }
  } catch (error) {
    console.error('Long polling error:', error);
    
    // If there's an error, wait a bit and try again
    if (isLongPollingActive) {
      setTimeout(fetchLongPoll, 3000);
    }
  }
}

// Start long polling
startLongPollingButton.addEventListener('click', () => {
  if (!isLongPollingActive) {
    isLongPollingActive = true;
    fetchLongPoll();
    
    startLongPollingButton.disabled = true;
    stopLongPollingButton.disabled = false;
  }
});

// Stop long polling
stopLongPollingButton.addEventListener('click', () => {
  isLongPollingActive = false;
  
  startLongPollingButton.disabled = false;
  stopLongPollingButton.disabled = true;
});

// Add a test message manually
addMessageButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `User generated message at ${new Date().toLocaleTimeString()}`
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add message');
    }
  } catch (error) {
    console.error('Error adding message:', error);
  }
});
