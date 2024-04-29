import React, { useState, useRef, useEffect } from "react";
import "./App.css"; // Import CSS file for styles
import { FaPaperPlane, FaMicrophone, FaTrash, FaStop, FaTrashAlt } from "react-icons/fa";
import Recorder from "./Recorder";
function App() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // State to store all chat messages
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const [isRecording, setIsRecording] = useState(false); // State to track recording state
  const [timer, setTimer] = useState(0); // State to store recording timer
  const chatAreaRef = useRef(null); // Ref for the chat area
  const timerRef = useRef(null); // Ref for the timer interval





  const query = async (data) => {
    setIsLoading(true); // Set loading state to true
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
        // "https://api-inference.huggingface.co/models/timpal0l/mdeberta-v3-base-squad2",
        {
          headers: {
            Authorization: "Bearer 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",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleSubmit = async () => {
    if (question.toLowerCase() === "exit") {
      console.log("Exiting...");
      return;
    }

    // Stop recording
    setIsRecording(false);
    // Clear timer
    clearInterval(timerRef.current);
    setTimer(0);

    const payload = {
      inputs: {
        question: `from provided context, answer this question and also write some explanation in brief: ${question} ?`,
        context: context,
      },
    };

    setQuestion("");
    try {
      const data = await query(payload);
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const newMessages = [
        ...messages,

        { type: "user", text: question + " 👤 ", time: currentTime },
        { type: "bot", text: "🤖 " + data.answer, time: currentTime },

      ];
      setMessages(newMessages);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMicClick = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      // Show recording indicator
      // You can implement this part based on your UI structure
      // For example, set a state to show a red dot indicating recording
    } else {
      // Stop recording
      setIsRecording(false);
      // Clear timer
      clearInterval(timerRef.current);
      setTimer(0);
      // Implement logic to send the recorded message
      // You can call a function to handle sending the recorded message here
    }
  };






  const handleDeleteRecording = () => {
    // Stop recording
    setIsRecording(false);
    // Clear timer
    clearInterval(timerRef.current);
    setTimer(0);
    // Additional logic to delete the recording
    // This can include clearing any recorded audio data or resetting any state related to recording
  };







  useEffect(() => {
    // Scroll to the bottom of the chat area when messages change
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="out-container">
      <h2 className="heading">Context-Based ChatBot: Your Virtual Assistant</h2>
      <div className="container">

        <div className="left-section">
          <h1 className="title">Context</h1>
          <textarea
            className="input inputleft"
            placeholder="Enter the context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            id="textArea2"
            autoFocus
          />
        </div>
        <div className="right-section">
          <h1 className="title">Conversation With Chatbot</h1>
          <div className="chat-area" ref={chatAreaRef}>
            {messages.map((message, index) => (

              <div
                key={index}
                className={`chat-message ${message.type === "user" ? "user-message" : "bot-message"
                  }`}
              >

                {message.text}


                {/* <span  className="timeStamp">{message.time}</span>*/}
              </div>

            ))}
            {messages.length === 0 && (
              <h2 className="empty">
                write your question below to start Conversation
              </h2>
            )}
          </div>
          <div className="input-area">
            <input
              type="text"
              className="input"
              placeholder="Enter your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              id="inputArea"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />

            {/* Mic button */}
            {!isLoading && !isRecording && !question && (
              <button className="mic-button" onClick={handleMicClick}>
                <FaMicrophone />
              </button>
            )}

            {/* Recording message and timer */}
            {isRecording && (
              <div className="recording-info">
                <div className="recording-controls">
                  {/* Dustbin symbol to delete recording */}
                  <span className="delete-button" onClick={handleDeleteRecording}>
                    <FaTrash />
                  </span>

                  {/* Display red dot */}
                  <div className="red-dot"></div>
                  <p className="timer-text">{formatTimer(timer)}</p>
                  <p className="recording-text"></p>

                </div>

              </div>
            )}


            {/* Send button */}
            {(question || isRecording || isLoading) && <button className={`submit-button ${isLoading ? "loading" : ""} ${isRecording ? "recSend" : ""}`} onClick={handleSubmit}>
              {isLoading ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <FaPaperPlane /> // Send icon
              )}
            </button>}
          </div>
        </div>
      </div>
      <p
        className="footer"
        onClick={() =>
          window.open(
            "https://github.com/amit-yadav207/context-based-chat-app",
            "_blank"
          )
        }
      >
        Made with ❤️ by Amit Yadav
      </p>
    </div>
  );
}

// Format timer to display in mm:ss format
const formatTimer = (timer) => {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

export default App;
