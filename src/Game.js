import { useState, useEffect, useRef, useCallback } from "react";
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

const AUDIO_PATHS = {
  menu: "/audio/menu-theme.mp3",
  game: "/audio/game-theme.mp3",
};

const Game = () => {
  const [level, setLevel] = useState(null);
  const [chosenWord, setChosenWord] = useState("");
  const [discoveredLetters, setDiscoveredLetters] = useState([]);
  const [userPickedLetters, setUserPickedLetters] = useState([]);
  const [hint, setHint] = useState("");
  const [numberOfWrongSelections, setNumberOfWrongSelections] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuAudioLoaded, setIsMenuAudioLoaded] = useState(false);
  const [isGameAudioLoaded, setIsGameAudioLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hintRevealedIndices, setHintRevealedIndices] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const isFetching = useRef(false);
  const menuAudioRef = useRef(null);
  const gameAudioRef = useRef(null);

  const attemptPlay = useCallback(async (audio) => {
    if (!audio) return;
    try {
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }, []);

  const getActiveAudio = useCallback(() => {
    return level ? gameAudioRef.current : menuAudioRef.current;
  }, [level]);

  const tryPlayActiveAudio = useCallback(async () => {
    const isActiveAudioLoaded = level ? isGameAudioLoaded : isMenuAudioLoaded;
    if (!isActiveAudioLoaded) return;

    const activeAudio = getActiveAudio();
    if (!activeAudio) return;

    await attemptPlay(activeAudio);
  }, [
    attemptPlay,
    getActiveAudio,
    isGameAudioLoaded,
    isMenuAudioLoaded,
    level,
  ]);

  useEffect(() => {
    const menuAudio = new Audio(AUDIO_PATHS.menu);
    const gameAudio = new Audio(AUDIO_PATHS.game);

    menuAudio.preload = "auto";
    gameAudio.preload = "auto";
    menuAudio.loop = true;
    gameAudio.loop = true;

    const onMenuReady = () => setIsMenuAudioLoaded(true);
    const onGameReady = () => setIsGameAudioLoaded(true);

    if (menuAudio.readyState >= 4) {
      setIsMenuAudioLoaded(true);
    } else {
      menuAudio.addEventListener("canplaythrough", onMenuReady, { once: true });
    }

    if (gameAudio.readyState >= 4) {
      setIsGameAudioLoaded(true);
    } else {
      gameAudio.addEventListener("canplaythrough", onGameReady, { once: true });
    }

    menuAudio.load();
    gameAudio.load();

    menuAudioRef.current = menuAudio;
    gameAudioRef.current = gameAudio;

    return () => {
      menuAudio.pause();
      gameAudio.pause();
      menuAudio.removeEventListener("canplaythrough", onMenuReady);
      gameAudio.removeEventListener("canplaythrough", onGameReady);
      menuAudioRef.current = null;
      gameAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (menuAudioRef.current) {
      menuAudioRef.current.muted = isMuted;
    }
    if (gameAudioRef.current) {
      gameAudioRef.current.muted = isMuted;
    }

    if (!isMuted) {
      tryPlayActiveAudio();
    }
  }, [isMuted, tryPlayActiveAudio]);

  useEffect(() => {
    const menuAudio = menuAudioRef.current;
    const gameAudio = gameAudioRef.current;

    if (!menuAudio || !gameAudio) return;

    if (!level) {
      gameAudio.pause();
      gameAudio.currentTime = 0;
      tryPlayActiveAudio();
      return;
    }

    menuAudio.pause();
    menuAudio.currentTime = 0;
    tryPlayActiveAudio();
  }, [level, isMenuAudioLoaded, isGameAudioLoaded, tryPlayActiveAudio]);

  async function fetchNewGuessWord(selectedLevel) {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    try {
      const response = await fetch("/api/get-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedLevel }),
      });

      if (!response.ok) throw new Error("API error");

      const { word, hint } = await response.json();
      setChosenWord(word);
      setDiscoveredLetters(Array(word.length).fill(false));
      setHintRevealedIndices(Array(word.length).fill(false));
      setHintsUsed(0);
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

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!isMuted) tryPlayActiveAudio();
    };

    window.addEventListener("focus", onVisibilityChange);
    window.addEventListener("pageshow", onVisibilityChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onVisibilityChange);
      window.removeEventListener("pageshow", onVisibilityChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isMuted, tryPlayActiveAudio]);

  const hasPlayerWon =
    discoveredLetters.length > 0 && !discoveredLetters.includes(false);
  const hasPlayerLost = numberOfWrongSelections >= 6;

  const hintsEnabled = level === "Beginner" || level === "Intermediate";
  const uniqueLettersInWord = [...new Set(chosenWord.split(""))].filter(
    Boolean,
  );
  const maxHints = Math.max(1, Math.floor(uniqueLettersInWord.length / 3));
  const undiscoveredUniqueLetters = uniqueLettersInWord.filter(
    (l) => !userPickedLetters.includes(l),
  );
  const canUseHint =
    hintsEnabled &&
    !hasPlayerWon &&
    !hasPlayerLost &&
    hintsUsed < maxHints &&
    undiscoveredUniqueLetters.length >= 2;

  function useHint() {
    if (!canUseHint) return;
    const letterToReveal =
      undiscoveredUniqueLetters[
        Math.floor(Math.random() * undiscoveredUniqueLetters.length)
      ];
    const newDiscoveredLetters = [...discoveredLetters];
    const newHintRevealedIndices = [...hintRevealedIndices];
    for (let i = 0; i < chosenWord.length; i++) {
      if (chosenWord[i] === letterToReveal) {
        newDiscoveredLetters[i] = true;
        newHintRevealedIndices[i] = true;
      }
    }
    setDiscoveredLetters(newDiscoveredLetters);
    setHintRevealedIndices(newHintRevealedIndices);
    setUserPickedLetters([...userPickedLetters, letterToReveal]);
    setHintsUsed(hintsUsed + 1);
  }

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
    setHintRevealedIndices([]);
    setHintsUsed(0);
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
      <div className="mt-4 flex items-center gap-3">
        <a
          href="https://github.com/ahmad-m-hamdan/hangman"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View in GitHub"
          title="View in GitHub"
          style={{ ...retroFont }}
          className="inline-flex h-11 w-11 items-center justify-center bg-black text-white shadow-[0_6px_0_#6b7280] transition-transform"
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(4px)";
            e.currentTarget.style.boxShadow = "0 2px 0 #6b7280";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #6b7280";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #6b7280";
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          aria-label={isMuted ? "Unmute music" : "Mute music"}
          title={isMuted ? "Unmute music" : "Mute music"}
          style={{ ...retroFont }}
          className="inline-flex h-11 w-11 items-center justify-center bg-black text-white shadow-[0_6px_0_#6b7280] transition-transform"
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(4px)";
            e.currentTarget.style.boxShadow = "0 2px 0 #6b7280";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #6b7280";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #6b7280";
          }}
        >
          <span aria-hidden="true" className="inline-flex items-center">
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={level ? resetGame : undefined}
          disabled={!level}
          aria-label="Try another word"
          title="Try another word"
          style={{ ...retroFont }}
          className="inline-flex h-11 w-11 items-center justify-center bg-black text-white shadow-[0_6px_0_#6b7280] transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          onMouseDown={(e) => {
            if (!level) return;
            e.currentTarget.style.transform = "translateY(4px)";
            e.currentTarget.style.boxShadow = "0 2px 0 #6b7280";
          }}
          onMouseUp={(e) => {
            if (!level) return;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #6b7280";
          }}
          onMouseLeave={(e) => {
            if (!level) return;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 0 #6b7280";
          }}
        >
          <span aria-hidden="true" className="inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
            </svg>
          </span>
        </button>
      </div>
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
              onClick={() => {
                setIsLoading(true);
                setLevel(label);
              }}
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

  if (isLoading || (level && !isGameAudioLoaded)) {
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
      <div className="flex justify-center content-center mb-4 px-4">
        <Word
          chosenWord={chosenWord}
          lettersStatus={discoveredLetters}
          hasPlayerLost={hasPlayerLost}
          hintRevealedIndices={hintRevealedIndices}
        />
      </div>
      <div className="winner-status flex justify-center mb-6">
        <span className="winner-message font-primary text-xs md:text-sm font-bold text-red-500 text-center">
          {hasPlayerWon === false
            ? hasPlayerLost
              ? "You lost!"
              : hint
            : "You won!"}
        </span>
      </div>
      {hintsEnabled && (
        <div className="flex justify-center mb-8">
          <button
            onClick={useHint}
            disabled={!canUseHint}
            style={{
              ...retroFont,
              backgroundColor: canUseHint ? "#a855f7" : "#4b5563",
              boxShadow: canUseHint ? "0 6px 0 #7e22ce" : "0 6px 0 #374151",
              border: "none",
              color: canUseHint ? "#fff" : "#9ca3af",
              padding: "0.6rem 1.25rem",
              fontSize: "0.55rem",
              cursor: canUseHint ? "pointer" : "not-allowed",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseDown={(e) => {
              if (!canUseHint) return;
              e.currentTarget.style.transform = "translateY(4px)";
              e.currentTarget.style.boxShadow = "0 2px 0 #7e22ce";
            }}
            onMouseUp={(e) => {
              if (!canUseHint) return;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 0 #7e22ce";
            }}
            onMouseLeave={(e) => {
              if (!canUseHint) return;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 0 #7e22ce";
            }}
          >
            HINT ({maxHints - hintsUsed} left)
          </button>
        </div>
      )}
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
    </>
  );
};

export default Game;
