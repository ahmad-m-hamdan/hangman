import Letter from "./Letter";

const Word = ({ chosenWord, lettersStatus }) => {
  let chosenWordCharacters = [];

  for (var i = 0; i < chosenWord.length; i++) {
    let showLetter = false;
    if (lettersStatus[i]) {
      showLetter = true;
    }
    chosenWordCharacters.push(
      <Letter key={i} letter={chosenWord.charAt(i)} showLetter={showLetter} />
    );
  }

  return <>{chosenWordCharacters}</>;
};

export default Word;
