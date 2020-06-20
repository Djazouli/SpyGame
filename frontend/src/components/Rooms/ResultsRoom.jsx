import React from "react";

const ResultsRoom = ({has_won, spy, other_word, spy_word}) => (
    <div>
        <h3>{has_won ? "You won!" : "You lost!"}</h3>
        The spy was {spy}, and had the word {spy_word}.
        The other word was {other_word}
    </div>
);

export default ResultsRoom;
