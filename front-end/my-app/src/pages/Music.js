import BottomNavBar from "../components/BottomNavBar";
import FriendScore from "../components/FriendScore";
import ImageHeader from "../components/ImageHeader";
import Scores from "../components/Scores";
import AlbumList from "../components/AlbumList"
function Music({musicType, artist, title, isRated}) {
    return (
        <div className="Music">
            <ImageHeader artist={artist} title={title} isRated={isRated}/>
            {musicType==="Song" && <SpotifySample title={title} artist={artist}/>}
            <Scores title={title} artist={artist} isRated={isRated}/>
            {musicType==="Album" && <AlbumList title={title} artist={artist}/>}
            <FriendScore artist={artist} title={title}/>
            <BottomNavBar/>
        </div>
    )
}

export default Music;