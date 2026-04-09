import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket once
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.on("receive_message", handleMessage);

    return () => {
      socketRef.current.off("receive_message", handleMessage);
      socketRef.current.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (username.trim() && room.trim()) {
      socketRef.current.emit("join_room", { room, username });
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (!joined || message.trim() === "") return;

    const msgData = {
      room,
      author: username,
      message,
      time: new Date().toLocaleTimeString(),
    };

    socketRef.current.emit("send_message", msgData);
    // Add the message locally for immediate display
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="app">
      <h2>Group Messaging Platform</h2>

      {!joined ? (
        <div className="join-container">
          <input
            type="text"
            placeholder="Enter Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-container">
          <h3>Room: {room}</h3>

          <div className="chat-box" ref={chatBoxRef}>
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <span className="author">{msg.author}</span>: {msg.message}
                <span className="time">{msg.time}</span>
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;