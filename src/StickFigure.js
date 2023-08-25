const StickFigure = ({ wrongSelectionsCounter }) => {
  return (
    <>
      <div className="flex justify-center mb-2">
        <div className="stick-figure-wrapper w-80 h-80 border-4 border-black relative">
          <div
            className={`${
              wrongSelectionsCounter <= 0 ? "hidden" : "block"
            } w-12 h-14 absolute rounded-full border-4 border-black bg-black top-[25px] left-[133px]`}
          ></div>
          <div
            className={`${
              wrongSelectionsCounter <= 1 ? "hidden" : "block"
            } w-0 h-24 absolute rounded-lg border-4 border-black bg-black top-[80px] left-[152px]`}
          ></div>
          <div
            className={`${
              wrongSelectionsCounter <= 2 ? "hidden" : "block"
            } w-24 h-0 absolute rounded-lg border-4 border-black bg-black top-[86px] left-[58px] rotate-12 origin-top`}
          ></div>
          <div
            className={`${
              wrongSelectionsCounter <= 3 ? "hidden" : "block"
            } w-24 h-0 absolute rounded-lg border-4 border-black bg-black top-[86px] left-[159px] -rotate-12 origin-top`}
          ></div>
          <div
            className={`${
              wrongSelectionsCounter <= 4 ? "hidden" : "block"
            } w-0 h-32 absolute rounded-lg border-4 border-black bg-black top-[174px] left-[148px] rotate-12 origin-top`}
          ></div>
          <div
            className={`${
              wrongSelectionsCounter <= 5 ? "hidden" : "block"
            } w-0 h-32 absolute rounded-lg border-4 border-black bg-black top-[174px] left-[156px] -rotate-12 origin-top`}
          ></div>
        </div>
      </div>
    </>
  );
};

export default StickFigure;
