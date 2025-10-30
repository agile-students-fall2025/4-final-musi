import "./FriendScore.css";
import React, {useEffect, useState} from 'react';

function FriendScore({ artist, title }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchedData = [
      { id: 1, name: 'David', handle: '@dvd', score: 7.1, rating: 3, imgUrl: '' },
      { id: 2, name: 'Julz Liang', handle: '@julzliang', score: 7.2, rating: 3, imgUrl: '' },
      { id: 3, name: 'Andy Cabindol', handle: '@andycabindol', score: 3.4, rating: 2, imgUrl: '' },
      { id: 4, name: 'Zuhair', handle: '@zuhair', score: 6.7, rating: 3, imgUrl: '' },
    ];
    setData(fetchedData);
  }, []); 
  function getScoreColorClass(rating) {
    if (rating === 3) return 'score-green';
    if (rating === 2) return 'score-yellow';
    if (rating === 1) return 'score-red';
    return '';
  }
  return (
    <div className="friend-score-container">
      <h3 className="friend-score-title">
        What your friends think
      </h3>
      
      <ul className="friend-score-list">
        {data.map((item) => (
          <li key={item.id} className="friend-score-item">
            
            <div className="friend-score-item-left">
              <div className="friend-score-avatar">
                <img src={item.imgUrl} alt={`${item.name}'s avatar`} />
              </div>
              
              <div className="friend-score-user-info">
                <div className="friend-score-user-name">{item.name}</div>
                <div className="friend-score-user-handle">{item.handle}</div>
              </div>
            </div>
            
            <div className="friend-score-circle">
              <span className={`friend-score-number ${getScoreColorClass(item.rating)}`}>
                {item.score.toFixed(1)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FriendScore;