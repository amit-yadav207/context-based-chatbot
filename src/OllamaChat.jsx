import React, { useState } from 'react';
import axios from 'axios';
import './OllamaChat.css'; // Import CSS file for styling

function OllamaChat() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (userInput.trim() === '') return;
    try {
      setIsLoading(true); // Set loading state to true
      const response = await axios.post('http://localhost:11434/api/chat', { message: userInput });
      setChatHistory([...chatHistory, { user: userInput, ollama: response.data }]);
      setUserInput('');
      setIsLoading(false); // Set loading state to false after receiving response
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false); // Set loading state to false in case of error
    }
  };

  return (
    <div className="ollama-chat-container">
      <h1>Ollama Chat UI</h1>
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div className="chat-history">
        <h2>Chat History</h2>
        {isLoading && <p>Loading...</p>} {/* Show loading message if isLoading is true */}
        {chatHistory.map((chat, index) => (
          <div key={index} className="chat-message">
            <p><strong>User:</strong> {chat.user}</p>
            <p><strong>Ollama:</strong> {chat.ollama}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OllamaChat;
