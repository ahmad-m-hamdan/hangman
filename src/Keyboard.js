import Button from "./Button";

const Keyboard = ({ userPickedLetters, onPlay }) => {
  function handleButtonClick(selectedLetter) {
    onPlay(selectedLetter);
  }

  const keyboardKeys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  const buttonItems = keyboardKeys.map((subKeysArray, parentIndex) => (
    <div
      className="flex justify-center last:mb-0 mb-5"
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

  return <div className="keyboard mb-8">{buttonItems}</div>;
};

export default Keyboard;
