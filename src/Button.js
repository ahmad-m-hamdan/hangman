const Button = ({ childIndex, letter, onButtonClick, userPickedLetters }) => {
  const btnClass =
    "button last:mr-0 mr-4 rounded-lg font-primary font-bold w-10 h-10 shadow-[rgba(6,24,44,0.4)_0px_0px_0px_2px_,_rgba(6,24,44,0.65)_0px_4px_6px_-1px_,_rgba(255,255,255,0.08)_0px_1px_0px_inset] cursor-pointer" +
    (userPickedLetters.includes(letter) ? " bg-rose-200" : "");
  return (
    <button key={childIndex} className={btnClass} onClick={onButtonClick}>
      {letter}
    </button>
  );
};

export default Button;
