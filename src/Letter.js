const Letter = ({ letter, showLetter, revealRed, revealHint }) => {
  return (
    <>
      <div className="text-center w-7 h-7 md:w-12 md:h-12 last:mr-0 mr-2 md:mr-4 pb-1 md:pb-2.5 font-primary text-xl md:text-4xl border-b-2 md:border-b-4 border-b-black">
        {showLetter ? (
          revealHint ? (
            <span className="text-yellow-400">{letter}</span>
          ) : (
            letter
          )
        ) : revealRed ? (
          <span className="text-red-500">{letter}</span>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Letter;
