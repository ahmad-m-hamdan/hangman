import { useEffect } from "react";
import Button from "./Button";

const Keyboard = ({ userPickedLetters, onPlay }) => {
  function handleButtonClick(selectedLetter) {
    onPlay(selectedLetter);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        handleButtonClick(letter);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const keyboardKeys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  const buttonItems = keyboardKeys.map((subKeysArray, parentIndex) => (
    <div
      className="flex justify-center gap-1 sm:gap-4 last:mb-0 mb-3"
      key={"keyboard-row-" + parentIndex}
    >
      {subKeysArray.map((keyboardKey, childIndex) => (
        <Button
          key={"keyboard-button-" + parentIndex + "-" + childIndex}
          letter={keyboardKey}
          onButtonClick={() => handleButtonClick(keyboardKey)}
          userPickedLetters={userPickedLetters}
        />
      ))}
    </div>
  ));

  return <div className="keyboard mb-8 px-4">{buttonItems}</div>;
};

export default Keyboard;
