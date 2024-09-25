import React, { useState, useEffect } from "react";
const Typewriter = ({ message }) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let str = message.text;

    while (true) {
      let startIndex = str.indexOf("【");
      let endIndex = str.indexOf("】");

      if (startIndex === -1 || endIndex === -1) {
        break;
      }

      let silinecekKisim = str.substring(startIndex, endIndex + 1);
      str = str.replace(silinecekKisim, "");
    }
    if (index < str.length) {
      const timer = setTimeout(() => {
        setCurrentText((prevText) => prevText + str[index]);
        setIndex((prevIndex) => prevIndex + 1);
      }, 10);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [index, message.text]);

  return (
    <>
      <div style={{ overflow: "hidden" }}>
        <div>
          {currentText.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <p className="flex text-xxs text-gray-500 mt-1  justify-end">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </>
  );
};

export default Typewriter;
