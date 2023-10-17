import { useState } from "react";
import OpenAI from "openai";
import Word from "./Word";
import Keyboard from "./Keyboard";
import StickFigure from "./StickFigure";

const openAIApiKey = process.env.REACT_APP_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openAIApiKey,
  dangerouslyAllowBrowser: true,
});

const Game = () => {
  const [chosenWord, setChosenWord] = useState("");
  const [discoveredLetters, setDiscoveredLetters] = useState(
    Array(chosenWord.length).fill(false)
  );
  const [userPickedLetters, setUserPickedLetters] = useState([]);
  const [hint, setHint] = useState("");
  const [numberOfWrongSelections, setNumberOfWrongSelections] = useState(0);

  async function fetchNewGuessWord() {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Give me a random word and its definition on a separate line. Don't say anything else except that, your response has to only have two lines. Example:Avuncular\nKind, friendly, and generous, especially to younger or less experienced people.",
        },
      ],
    });

    console.log(response.choices[0].message.content);

    const responseContent = response.choices[0].message.content.split("\n");

    const newGuessWord = responseContent[0].toUpperCase();
    const newHint = responseContent[1];
    setChosenWord(newGuessWord);
    setDiscoveredLetters(Array(newGuessWord.length).fill(false));
    setHint(newHint);
  }

  if (chosenWord === "") {
    fetchNewGuessWord();
  }

  const hasPlayerWon = discoveredLetters.includes(false) ? false : true;

  const hasPlayerLost = numberOfWrongSelections >= 6 ? true : false;

  function checkIfLetterExists(letter) {
    if (hasPlayerWon) return;
    if (hasPlayerLost) return;

    const currentDiscoveredLetters = [...discoveredLetters];
    const currentPickedLetters = [...userPickedLetters];

    if (!currentPickedLetters.includes(letter)) {
      currentPickedLetters.push(letter);
      setUserPickedLetters(currentPickedLetters);
      if (chosenWord.indexOf(letter) === -1) {
        setNumberOfWrongSelections(numberOfWrongSelections + 1);
      }
    }
    for (var i = 0; i < chosenWord.length; i++) {
      if (chosenWord[i] === letter) {
        currentDiscoveredLetters[i] = true;
        setDiscoveredLetters(currentDiscoveredLetters);
      }
    }
  }

  function resetGame() {
    const currentDiscoveredLetters = Array(chosenWord.length).fill(false);
    setDiscoveredLetters(currentDiscoveredLetters);
    fetchNewGuessWord();
    setUserPickedLetters([]);
    setNumberOfWrongSelections(0);
  }

  return (
    <>
      <div className="flex justify-center content-center mb-2">
        <Word chosenWord={chosenWord} lettersStatus={discoveredLetters} />
      </div>
      <div className="flex justify-center content-center mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 cursor-pointer text-blue-600 animate-spin"
          onClick={resetGame}
          title="Reset"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </div>
      <Keyboard
        userPickedLetters={userPickedLetters}
        onPlay={checkIfLetterExists}
      />
      <StickFigure wrongSelectionsCounter={numberOfWrongSelections} />
      <div className="winner-status flex justify-center">
        <span className="winner-message font-primary text-4xl font-bold text-red-500">
          {hasPlayerWon === false
            ? hasPlayerLost
              ? "You lost!"
              : hint
            : "You won!"}
        </span>
      </div>
    </>
  );
};

export default Game;
