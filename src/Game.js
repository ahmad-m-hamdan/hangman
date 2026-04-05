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
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = useRef(false);

  async function fetchNewGuessWord(selectedLevel) {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_GITHUB_TOKEN || "placeholder",
      baseURL: "https://models.inference.ai.azure.com",
      dangerouslyAllowBrowser: true,
    });

    const levelDescriptions = {
      Beginner:
        "a very simple, common everyday word suitable for children (e.g. cat, ball, tree)",
      Intermediate: "a moderately common word that an average adult would know",
      Advanced:
        "an uncommon or sophisticated word that requires a good vocabulary",
      Expert:
        "a very rare, obscure, or highly technical word that most people would not know",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Give me ${levelDescriptions[selectedLevel]} and its definition on a separate line. CRITICAL: You must pick a genuinely random word — do NOT default to the same common words you typically suggest. The English language has hundreds of thousands of words; explore the full breadth of it. Actively avoid words you have given before. The current timestamp is ${Date.now()} — use this as a random seed to vary your selection every single time. Your entire response must use English characters only — do not include any characters from other scripts or languages. Don't say anything else except that, your response has to only have two lines. Example:\nAvuncular\nKind, friendly, and generous, especially to younger or less experienced people.`,
        },
      ],
      temperature: 1.5,
    });

    const responseContent = response.choices[0].message.content.split("\n");
    const newGuessWord = responseContent[0]
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase();
    const newHint = responseContent[1].trim();
    setChosenWord(newGuessWord);
    setDiscoveredLetters(Array(newGuessWord.length).fill(false));
    setHint(newHint);
    isFetching.current = false;
    setIsLoading(false);
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
    setIsLoading(false);
    setLevel(null);
  }

  const header = (
    <div className="flex flex-col items-center mb-6 mt-4">
      <h1
        style={{ ...retroFont }}
        className="text-4xl text-yellow-400 drop-shadow-lg mb-3"
      >
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

  if (isLoading) {
    return (
      <>
        {header}
        <style>{`
          @keyframes retro-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .retro-blink { animation: retro-blink 1s step-start infinite; }
          @keyframes dot-cycle {
            0%   { content: '.'; }
            33%  { content: '..'; }
            66%  { content: '...'; }
            100% { content: '.'; }
          }
          .loading-dots::after {
            content: '';
            animation: dot-cycle 1.2s steps(1) infinite;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center mt-16 gap-10">
          <span
            style={{ ...retroFont }}
            className="text-yellow-400 text-base tracking-widest retro-blink"
          >
            LOADING
            <span className="loading-dots" />
          </span>
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#facc15",
                  imageRendering: "pixelated",
                  animation: `retro-blink 1s step-start ${i * 0.25}s infinite`,
                }}
              />
            ))}
          </div>
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
      <div
        className="winner-status flex justify-center px-8 mb-6"
        style={{ minHeight: "3rem" }}
      >
        <span className="winner-message font-primary text-2xl font-bold text-red-500 text-center">
          {hasPlayerWon === false
            ? hasPlayerLost
              ? "You lost!"
              : hint
            : "You won!"}
        </span>
      </div>
      <Keyboard
        userPickedLetters={userPickedLetters}
        onPlay={checkIfLetterExists}
      />
      <div
        style={{
          transform: "scale(0.5)",
          transformOrigin: "top center",
          height: "180px",
        }}
      >
        <StickFigure wrongSelectionsCounter={numberOfWrongSelections} />
      </div>
      <div className="flex justify-center content-center">
        <button
          onClick={resetGame}
          style={{
            ...retroFont,
            backgroundColor: "#6366f1",
            boxShadow: "0 6px 0 #3730a3",
            border: "none",
            color: "#fff",
            padding: "0.75rem 1.75rem",
            fontSize: "0.7rem",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            imageRendering: "pixelated",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(4px)";
            e.currentTarget.style.boxShadow = "0 2px 0 #3730a3";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #3730a3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #3730a3";
          }}
        >
          Try another!
        </button>
      </div>
    </>
  );
};

export default Game;
