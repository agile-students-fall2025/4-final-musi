import {react, useState, useEffect} from "react";
import Score from "./Score";
import axios from "axios";
import "./Score.css";

function Scores({musicType, title, artist}) {
    const [scores, setScores] = useState([0, 0, 0]);
    const [counts, setCounts] = useState([0, 0, 0]);
    const [scoreTitles, setScoreTitles] = useState(["","",""])
    const [descriptions, setDescriptions] = useState(["", "", ""]);
    useEffect(() => {
        if (!artist || !title) return;
        
        const API_URL = `http://localhost:3001/api/scores/${musicType}/${artist}/${title}`;

        axios.get(API_URL)
            .then(response => {
                const { scores, counts, scoreTitles, descriptions } = response.data;
                setScores(scores);
                setCounts(counts);
                setScoreTitles(scoreTitles);
                setDescriptions(descriptions);
            })
            .catch(error => {
                console.error("Error fetching scores data:", error);
            });
            
    }, [artist, title, musicType]);
    return (
        <div className="scores-section">
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