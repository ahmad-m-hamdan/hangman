import { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import Word from "./Word";
import Keyboard from "./Keyboard";
import StickFigure from "./StickFigure";

const LEVELS = [
  { label: "Beginner", color: "#22c55e", shadow: "#15803d" },
  { label: "Intermediate", color: "#3b82f6", shadow: "#1d4ed8" },
  { label: "Advanced", color: "#f97316", shadow: "#c2410c" },
  { label: "Expert", color: "#ef4444", shadow: "#991b1b" },
];

const retroFont = { fontFamily: "'Press Start 2P', cursive" };

const Game = () => {
  const [level, setLevel] = useState(null);
  const [chosenWord, setChosenWord] = useState("");
  const [discoveredLetters, setDiscoveredLetters] = useState([]);
  const [userPickedLetters, setUserPickedLetters] = useState([]);
  const [hint, setHint] = useState("");
  const [numberOfWrongSelections, setNumberOfWrongSelections] = useState(0);
  const isFetching = useRef(false);

  async function fetchNewGuessWord(selectedLevel) {
    if (isFetching.current) return;
    isFetching.current = true;

    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_GITHUB_TOKEN || "placeholder",
      baseURL: "https://models.inference.ai.azure.com",
      dangerouslyAllowBrowser: true,
    });

    const levelDescriptions = {
      Beginner: "a very simple, common everyday word suitable for children (e.g. cat, ball, tree)",
      Intermediate: "a moderately common word that an average adult would know",
      Advanced: "an uncommon or sophisticated word that requires a good vocabulary",
      Expert: "a very rare, obscure, or highly technical word that most people would not know",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Give me ${levelDescriptions[selectedLevel]} and its definition on a separate line. Use a truly random word each time, do not repeat common words. The current timestamp is ${Date.now()} to ensure uniqueness. Don't say anything else except that, your response has to only have two lines. Example:\nAvuncular\nKind, friendly, and generous, especially to younger or less experienced people.`,
        },
      ],
      temperature: 1.5,
    });

    const responseContent = response.choices[0].message.content.split("\n");
    const newGuessWord = responseContent[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
    const newHint = responseContent[1].trim();
    setChosenWord(newGuessWord);
    setDiscoveredLetters(Array(newGuessWord.length).fill(false));
    setHint(newHint);
    isFetching.current = false;
  }

  useEffect(() => {
    if (level) fetchNewGuessWord(level);
  }, [level]);

  const hasPlayerWon =
    discoveredLetters.length > 0 && !discoveredLetters.includes(false);
  const hasPlayerLost = numberOfWrongSelections >= 6;

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
    setChosenWord("");
    setDiscoveredLetters([]);
    setUserPickedLetters([]);
    setNumberOfWrongSelections(0);
    setHint("");
    setLevel(null);
  }

  const header = (
    <div className="flex flex-col items-center mb-6 mt-4">
      <h1 style={{ ...retroFont }} className="text-4xl text-yellow-400 drop-shadow-lg mb-3">
        Hangman
      </h1>
      <h2 style={{ ...retroFont }} className="text-sm text-gray-400">
        by Ahmad Hamdan
      </h2>
    </div>
  );

  if (!level) {
    return (
      <>
        {header}
        <div className="flex flex-col items-center gap-6 mt-8">
          <p style={{ ...retroFont }} className="text-white text-lg mb-4">
            SELECT LEVEL
          </p>
          {LEVELS.map(({ label, color, shadow }) => (
            <button
              key={label}
              onClick={() => setLevel(label)}
              style={{
                ...retroFont,
                backgroundColor: color,
                boxShadow: `0 6px 0 ${shadow}`,
                border: "none",
                color: "#fff",
                padding: "1rem 2.5rem",
                fontSize: "0.85rem",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                imageRendering: "pixelated",
                transition: "transform 0.1s, box-shadow 0.1s",
                width: "280px",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(4px)";
                e.currentTarget.style.boxShadow = `0 2px 0 ${shadow}`;
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 6px 0 ${shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 6px 0 ${shadow}`;
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div
        className="flex justify-center content-center mb-2"
        style={{ minHeight: "4rem" }}
      >
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
      <div
        style={{
          transform: "scale(0.5)",
          transformOrigin: "top center",
          height: "240px",
        }}
      >
        <StickFigure wrongSelectionsCounter={numberOfWrongSelections} />
      </div>
      <div className="winner-status flex justify-center px-8">
        <span className="winner-message font-primary text-2xl font-bold text-red-500 text-center">
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
