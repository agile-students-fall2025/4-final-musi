import "./Scores.css";
import { theme } from "../theme";

// Helper function to get score color based on rating
const getScoreColor = (rating) => {
  const numRating = parseFloat(rating);
  if (numRating >= 8) {
    return theme.colors.green;
  } else if (numRating > 5) {
    return theme.colors.yellow;
  } else {
    return theme.colors.red;
  }
};

function Score({ score, count, title, description }) {
  return (
    <div className="score-item">
      <div className="score-circle-container">
        <div className="score-circle">
          <span 
            className="score-number" 
            style={{ color: getScoreColor(score) }}
          >
            {score ? score : '...'}
          </span>
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

// import "./Scores.css";

// function Score({ score, count, title, description }) {
//   return (
//     <div className="score-item">
//       <div className="score-circle-container">
//         <div className="score-circle">
//           <span className="score-number">{score ? score : '...'}</span>
//         </div>
//         <div className="score-count">
//           {count || '...'}
//         </div>
//       </div>
//       <div className="score-text-content">
//         <span className="score-item-title">{title}</span>
//         <span className="score-item-desc" dangerouslySetInnerHTML={{ __html: description }} />
//       </div>
//     </div>
//   );
// }

// export default Score;