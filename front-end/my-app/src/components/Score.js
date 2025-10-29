import "./Scores.css";

function Score({ score, count, title, description }) {
  return (
    <div className="score-item">
      <div className="score-circle-container">
        <div className="score-circle">
          <span className="score-number">{score ? score.toFixed(1) : '...'}</span>
        </div>
        <div className="score-count">
          {count || '...'}
        </div>
      </div>
      <div className="score-text-content">
        <span className="score-item-title">{title}</span>
        <span className="score-item-desc" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  );
}

export default Score;