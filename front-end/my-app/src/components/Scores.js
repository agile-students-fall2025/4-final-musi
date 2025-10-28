import {react, useState} from "react";
import Score from "./Score";
import "./Score.css";

function Scores({title, artist, isRated}) {
    const [scores, setScores] = useState([0, 0, 0]);
    const [counts, setCounts] = useState([0, 0, 0]);
    const [descriptions, setDescriptions] = useState(["", "", ""]);
    const [rank, setRank] = (0)
    useEffect(() => {
        setScores([7.6, 7.6, 7.8]);
        setCounts([101, 2, 12]);
        setScoreTitles(["Rec Score", "Friend Score", "User Score"]);
        setDescriptions([
            "How much we think <strong>you</strong> will like it",
            "What your <strong>friends</strong> think", 
            "Average score from <strong>all</strong> users"
        ]);
        if (isRated===true) {
            setRank(1);
            setScoreTitles(["Your Musi Rating", "Friend Score", "User Score"]);
            setDescriptions([`#<strong>${rank}</strong>on your list of music`,
            "What your <strong>friends</strong> think", 
            "Average score from <strong>all</strong> users"])
        }
    }, []);
    return (
        <div className="scores">
            <h3 className="scores-title">Scores</h3>
            <div className="scores-scroller">
                {scores.map((score, index) => (
                    <Score
                        key={index}
                        score={score}
                        count={counts[index]}
                        title={scoreTitles[index]}
                        description={descriptions[index]}
                    />
                ))}
            </div>
        </div>
    )
}

export default Scores;