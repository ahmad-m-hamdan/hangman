import { useState, useEffect, useRef } from "react";
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

    try {
      const response = await fetch("/api/get-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedLevel, timestamp: Date.now() }),
      });

      if (!response.ok) throw new Error("API error");

      const { word, hint } = await response.json();
      setChosenWord(word);
      setDiscoveredLetters(Array(word.length).fill(false));
      setHint(hint);
    } catch (err) {
      console.error("Failed to fetch word:", err);
      setLevel(null);
    } finally {
      isFetching.current = false;
      setIsLoading(false);
    }
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
        `}</style>
        <div className="flex flex-col items-center justify-center mt-16 gap-10">
          <span
            style={{ ...retroFont }}
            className="text-yellow-400 text-base tracking-widest"
          >
            LOADING
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  animation: `retro-blink 0.9s step-start ${i * 0.3}s infinite`,
                }}
              >
                .
              </span>
            ))}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div
        className="flex justify-center content-center mb-2 px-4"
        style={{ minHeight: "4rem" }}
      >
        <Word
          chosenWord={chosenWord}
          lettersStatus={discoveredLetters}
          hasPlayerLost={hasPlayerLost}
        />
      </div>
      <div
        className="winner-status flex justify-center px-8 mb-6"
        style={{ minHeight: "3rem" }}
      >
        <span className="winner-message font-primary text-base font-bold text-red-500 text-center">
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
      <div className="flex justify-center content-center mb-10">
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
