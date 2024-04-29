import React, { useState, useRef, useEffect } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import "./App.css"; // Import CSS file for styles
import { FaPaperPlane, FaMicrophone, FaTrash } from "react-icons/fa";

function App2() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // State to store all chat messages
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const [isRecording, setIsRecording] = useState(false); // State to track recording state
  const [timer, setTimer] = useState(0); // State to store recording timer
  const [audioBlob, setAudioBlob] = useState(null); // State to store recorded audio blob
  const chatAreaRef = useRef(null); // Ref for the chat area
  const timerRef = useRef(null); // Ref for the timer interval
  const audioRecorderRef = useRef(null); // Ref for the AudioRecorder component



  // Your existing query function
  // Your existing handleSubmit function
  const query = async (data) => {
    setIsLoading(true); // Set loading state to true
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
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
  // Function to handle starting and stopping recording
  const handleMicClick = () => {
    if (!isRecording) {
      setIsRecording(true);
      audioRecorderRef.current.startRecording();
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      audioRecorderRef.current.stopRecording();
      clearInterval(timerRef.current);
      setTimer(0);
    }
  };

  // Function to handle deleting the recording
  const handleDeleteRecording = () => {
    setAudioBlob(null);
    setIsRecording(false);
    clearInterval(timerRef.current);
    setTimer(0);
  };

  // Function to handle downloading the recorded audio
  const handleDownloadRecording = () => {
    if (audioBlob) {
      console.log("got")
      const url = URL.createObjectURL(audioBlob);
      const downloadUrlDiv = document.getElementById("download-url");
      if (downloadUrlDiv) {
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.textContent = "Download recorded audio"; // Text content of the link
        downloadLink.download = "recorded_audio.webm";
        downloadUrlDiv.appendChild(downloadLink);
        console.log("gotw")
      }
    }
  };
  
  

  // Function to handle recording complete event
  const handleRecordingComplete = (blob) => {
    setAudioBlob(blob);
    handleDownloadRecording();
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
      <div id="download-url">download</div>

      <div className="container">
        <div className="left-section">
          <h1 className="title">Context</h1>
          <textarea
            className="input inputleft"
            placeholder="Enter the context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
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
              </div>
            ))}
            {messages.length === 0 && (
              <h2 className="empty">
                Write your question below to start the conversation
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
            {!isRecording && !question && (
              <button className="mic-button" >
               
                <AudioRecorder
                  ref={audioRecorderRef}
                  onRecordingComplete={handleRecordingComplete}
                />
              </button>
            )}
            {isRecording && (
              <div className="recording-info">
                <div className="recording-controls">
                  <span className="delete-button" onClick={handleDeleteRecording}>
                    <FaTrash />
                  </span>
                  <div className="red-dot"></div>
                  <p className="timer-text">{formatTimer(timer)}</p>
                  <button className="download-button" onClick={handleDownloadRecording}>
                    Download
                  </button>
                </div>
              </div>
            )}
            {(question || isRecording) && (
              <button className={`submit-button ${isLoading ? "loading" : ""}`} onClick={handleSubmit}>
                {isLoading ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            )}
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

// Your existing formatTimer function
// Format timer to display in mm:ss format
const formatTimer = (timer) => {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};
export default App2;
