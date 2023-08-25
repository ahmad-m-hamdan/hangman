const Letter = ({ letter, showLetter }) => {
  return (
    <>
      <div className="text-center w-12 h-12 last:mr-0 mr-4 pb-2.5 font-primary text-4xl border-b-4 border-b-black">
        {showLetter ? letter : ""}
      </div>
    </>
  );
};

export default Letter;
