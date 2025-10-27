import BottomNavBar from "../components/BottomNavBar";
import FriendScore from "../components/FriendScore";
import ImageHeader from "../components/ImageHeader";
import Scores from "../components/Scores";
import AlbumList from "../components/AlbumList"
function Music(props) {
    return (
        <div className="Music">
            <ImageHeader name={props.musicName}></ImageHeader>
            <Scores name={props.musicName}/>
            {props.musicType==="Album" && <AlbumList name={props.musicName}/>}
            <FriendScore name={props.musicName}></FriendScore>
            <BottomNavBar/>
        </div>
    )
}

export default Music;