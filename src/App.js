import React, { useState } from "react";
import "./App.css"; // Import CSS file for styles
import { FaPaperPlane } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function App() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // State to store all chat messages
  const [isLoading, setIsLoading] = useState(false); // State to track loading state

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
        question: `from provided context , answer this question: ${question} ?`,
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
        { type: "bot", text: "🤖 " + data.answer, time: currentTime },
        { type: "user", text: question + " 👤 ", time: currentTime },
        ...messages,
      ];
      setMessages(newMessages);
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
            id="textArea"
          />
        </div>
        <div className="right-section">
          <h1 className="title">Conversation With Chatbot</h1>
          <div className="chat-area">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.type === "user" ? "user-message" : "bot-message"
                  }`}
              >
                {message.text !== "undefined"
                  ? message.text
                  : "Please ask questions within the context! "}
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

            <button className="submit-button" onClick={handleSubmit}>
              {isLoading ? (
                <AiOutlineLoading3Quarters className="spin" />
              ) : (
                <FaPaperPlane /> // Send icon
              )}
            </button>
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

export default App;
