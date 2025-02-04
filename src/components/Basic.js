import "./chatBot.css";
import React, { useEffect, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { BiBot, BiUser } from "react-icons/bi";
import { v4 as uuidv4 } from 'uuid';
function Basic() {
  const [chat, setChat] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [typingDots, setTypingDots] = useState("");
  const [name,setName] = useState("Ysn"); 
  
  useEffect(() => {
    setName(uuidv4())

  }, [])

  useEffect(() => {
    const objDiv = document.getElementById("messageArea");
    if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;
  }, [chat]);

  useEffect(() => {
    let typingInterval;
    if (botTyping) {
      typingInterval = setInterval(() => {
        setTypingDots((prev) => (prev === "...." ? "" : prev + "."));
      }, 500);
    } else {
      setTypingDots(".");
    }
    return () => clearInterval(typingInterval);
  }, [botTyping]);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    //const name = "aa";
    if (inputMessage.trim()) {
      const userMessage = { sender: "user", sender_id: name, msg: inputMessage };
      setChat((prevChat) => [...prevChat, userMessage]);
      setBotTyping(true);
      setInputMessage("");
      rasaAPI(name, inputMessage);
    } else {
      alert("Please enter a valid message");
    }
  };

  const rasaAPI = async (name, msg) => {
    console.log(({ sender: name, message: msg }))
    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender: name, message: msg }),
      });
      const data = await response.json();
      if (data) {
        const botMessages = data.map((message) => ({
          sender: "bot",
          recipient_id: message.recipient_id,
          msg: message.text,
        }));
        setBotTyping(false);
        setChat((prevChat) => [...prevChat, ...botMessages]);
      }
    } catch (error) {
      console.error("Error communicating with Rasa API:", error);
    }
  };
  const suggestions = ["Bonjour","Quels filières sont disponibles ? ", "Quels semesters sont dans le filière Génie Informatique ?","Quels modules sont dans le filière Génie Informatique ?","Quels modules sont dans le Semester 1 ?","Pouvez-vous lister les éléments de Programmation Orientée Objet?"]
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>ChatBot</h1>
      </div>

      <div className="chat-body" id="messageArea">
        {chat.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.sender === "bot" ? (
              <div className="message-content bot-message">
                <BiBot className="icon" />
                {message.msg.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
                
              </div>
            ) : (
              <div className="message-content user-message">
                <span style={{ whiteSpace: "pre-line" }}>{message.msg}</span>
                <BiUser className="icon" />
              </div>
            )}
          </div>
        ))}

        {/* Bot Typing Indicator */}
        {botTyping && (
          <div className="message bot">
            <div className="message-content bot-message">
              <BiBot className="icon" />
              <span>typing{typingDots}</span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-footer" onSubmit={handleSubmit}>
  {/* Suggestion area */}
  <div className="suggest">
    <ul>
    {suggestions.map((suggestion, index) => (
      <li key={index} onClick={() => setInputMessage(suggestion)}>
        {suggestion}
      </li>
    ))}
    </ul>
  </div>

  {/* Input and button on the same line */}
  <div className="input-container">
    <input
      type="text"
      placeholder="Type your message..."
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      className="input-message"
    />
    <button type="submit" className="send-button">
      <IoMdSend />
    </button>
  </div>
</form>

    </div>
  );
}

export default Basic;
