import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css"; // Import your CSS file for styling

import axios from "axios";

import {
  IoIosArrowDropup,
  IoIosArrowDropdown,
  IoIosSend,
} from "react-icons/io";
import { IoMicSharp, IoStopSharp, IoArrowDown } from "react-icons/io5";

const API_URL =
  // "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
  "https://api-inference.huggingface.co/models/openai/whisper-base";

const HEADERS = {
  Authorization: "Bearer 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",
};

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);

  
  const [transcription, setTranscription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const messageContainerRef = useRef(null);
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const handleMessageSend = () => {
    if(transcription.trim()!==""){
      setMessages([
        ...messages,
        { type: "text", data: transcription, sender: "bot" },
      ]);
   
      setTranscription("");
    }
    if (audioData) {
      console.log("audio msg");
      // setMessages([
      //   ...messages,
      //   { type: "audio", data: audioData, sender: "user" },
      // ]);
      setAudioData(null); // Reset audio data after sending
      return;
    }
    if (inputValue.trim() !== "") {
      setMessages([
        ...messages,
        { type: "text", data: inputValue, sender: "user" },
      ]);
      setInputValue("");
      // Here you can add logic to handle bot response
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleMessageSend();
    }
  };

  const toggleChatbot = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  

  const handleFileUpload = async (audioBlob) => {
    setLoading(true); // Set loading to true when data is being sent

    const audioFile = audioBlob;
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // withCredentials: true  // Include this line to send cookies and credentials
        }
      );
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setLoading(false); // Set loading to false when data is received (whether successful or error)
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(recordedBlob);
        setAudioData(url);
        chunks.current = [];
        handleFileUpload(recordedBlob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    setLoading(true);
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    setIsRecording(false);
    setLoading(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot">
      {!isExpanded && (
        <button className="toggle-button" onClick={toggleChatbot}>
          <span className="robot-icon">🤖</span>
          <span>Chat</span>
        </button>
      )}
      {isExpanded && (
        <>
          <div className="collapse-icon" onClick={toggleChatbot}>
            <span>
              <IoIosArrowDropdown />
            </span>
          </div>
          <div className="chatbot-expanded">
            <div
              className="message-container scrollBar"
              ref={messageContainerRef}
            >
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    {message.type === "text" && <span>{message.data}</span>}
                    {message.type === "audio" && (
                      <audio controls src={message.data} />
                    )}
                    {message.type === "video" && (
                      <video controls src={message.data} />
                    )}
                    {message.type === "image" && (
                      <img src={message.data} alt="image" />
                    )}
                  </div>
                ))
              ) : (
                <p>Type here or tap the mic to start chatting!</p>
              )}
            </div>

            <div className="input-container">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              {loading && (
                <button>
                  <span className="loader"></span>
                </button>
              )}
              {audioData
                ? !loading && (
                    <button onClick={handleMessageSend}>
                      <IoIosSend />
                    </button>
                  )
                : inputValue.trim() === "" &&
                  !isRecording &&
                  !loading && (
                    <button onClick={toggleRecording}>
                      <IoMicSharp />
                    </button>
                  )}
              {inputValue.trim() !== "" && !isRecording && !loading && (
                <button onClick={handleMessageSend}>
                  <IoIosSend />
                </button>
              )}
              {!inputValue.trim() && isRecording && (
                <button onClick={toggleRecording}>
                  <IoStopSharp />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Chatbot;
