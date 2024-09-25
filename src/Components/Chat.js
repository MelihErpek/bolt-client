import React, { useEffect, useState, useRef } from "react";
import Typewriter from "./Typewriter.js";

import Photo from "./bolt.png";
import Anon from "./anon.png";
import axios from "axios";
export default function Chat() {
  // This codes uses React hooks to manage chatbot state, including message handling, user input, timeout status, loading animation, and session tracking.

  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const [tThread, setTThread] = useState(null);
  const divRef = useRef(null);
  const [lastClicked, setLastClicked] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [messages, setMessages] = useState([
    {
      text: "What is your favorite breed of cat, and why?",
      timestamp: new Date().toISOString(),
      sender: "gpt",
    },
  ]);

  // useEffect hook sets up an interval to animate the dots (e.g., a loading indicator) by cycling between "." and "..." every 500 milliseconds.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots === "...") {
          return ".";
        } else {
          return prevDots + ".";
        }
      });
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Sends a POST request to close the session after 3 minutes of inactivity, resetting the timer when 'lastClicked' or 'tThread' changes.
  useEffect(() => {
    if (lastClicked > 0) {
      const timer = setTimeout(async () => {
        await axios.post("https://bolt-server-topaz.vercel.app/sessionClosed", {
          tThread,
        });
      }, 180000);
      return () => clearTimeout(timer);
    }
  }, [lastClicked, tThread]);

  // Handles message submission, sets loading and timestamps, updates messages state, and triggers message API call.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastClicked(Date.now());
    if (sessionStart === null) {
      setSessionStart(Date.now());
    }
    const messageInput = e.target.elements.message;
    const message = {
      text: messageInput.value.trim(),
      timestamp: new Date().toISOString(),
      sender: "user",
    };
    setMessages((prevState) => [...prevState, message]);
    messageInput.value = "";
    messageAPI(message.text);
  };

  // The Loading Component
  const Loading = () => {
    if (loading === true) {
      return (
        <div className="flex-1 overflow-y-auto ">
          <div className="flex flex-col items-end">
            <p
              className={`bg-gray-200 py-2 px-4 rounded-lg inline-block rounded-bl-none`}
            >
              {dots}
            </p>
          </div>
        </div>
      );
    }
  };

// Sends the message to the appropriate API endpoint (first or subsequent messages), updates the messages state, and handles the thread ID and loading state.
  const messageAPI = async (message) => {
    setLoading(true);

    if (tThread === null) {
      const response = await axios.post("https://bolt-server-topaz.vercel.app/firstMessage", {
        message,
      });

      setMessages((prevState) => [
        ...prevState,
        {
          text: response.data.message,
          timestamp: new Date().toISOString(),
          sender: "gpt",
        },
      ]);
      setTThread(response.data.thread_id);
      setLoading(false);
      setTimeoutExpired(false);
    } else {
      const response = await axios.post("https://bolt-server-topaz.vercel.app/otherMessages", {
        tThread,
        message,
      });

      setMessages((prevState) => [
        ...prevState,
        {
          text: response.data.message,
          timestamp: new Date().toISOString(),
          sender: "gpt",
        },
      ]);
      setLoading(false);
      setTimeoutExpired(false);
    }
  };
  return (
    <div className="w-screen text-xs flex flex-col h-screen ">
      <div
        className="flex justify-center mt-1 mx-1 text-white py-4 px-6  outline outline-4 outline-white "
        style={{ backgroundColor: "#231E52" }}
      >
        <div className="text-lg font-bold ">Bolt Insight</div>
      </div>
      <main
        className="flex-1 overflow-y-auto p-6 scroll-auto  "
        ref={divRef}
        style={{
          height: "68vh",
          overflowY: "scroll",
          "@media (max-width: 768px)": {
            height: "0vh",
          },
        }}
      >
        <div>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                message.sender === "user" ? "items-start" : "items-end"
              } mb-4`}
            >
              {message.sender === "gpt" ? (
                <p
                  className={`bg-gray-300 py-2 px-4 rounded-lg inline-block ${
                    message.sender === "user"
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                >
                  <div className="flex ">
                    <img className="w-5 h-5 mr-2" src={Photo} alt="" />
                    <Typewriter message={message} />
                  </div>
                </p>
              ) : (
                <p
                  className={`bg-gray-200 py-2 px-4 rounded-lg inline-block ${
                    message.sender === "user"
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                >
                  <div className="flex">
                    <p>{message.text}</p>

                    <img className="w-5 h-5 mr-2" src={Anon} alt="" />
                  </div>
                  <p className="flex text-xxs text-gray-500  ml-1 justify-end mr-0 sm:mr-3 ">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </p>
              )}
            </div>
          ))}
        </div>

        <Loading />
      </main>
      <div className=" mx-auto text-center  text-xxs mb-1 bg-gray-200 py-2 px-4 rounded-lg">
        ChatGPT can make mistakes. Consider checking important information.
      </div>
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 flex-none">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            name="message"
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4"
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="bg-bolt text-white px-4 py-2 rounded-full">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
