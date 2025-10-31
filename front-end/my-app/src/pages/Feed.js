import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Search, Menu, Heart, Bookmark } from "lucide-react";
import { theme } from "../theme";
import Sidebar from "../components/Sidebar";


const Container = styled.div`
  background: white;
  min-height: 100vh;
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
`;

const Logo = styled.img`
  height: 48px;
  width: auto;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
`;

const SearchContainer = styled.div`
  padding: 16px 20px;
  background: white;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  margin-left: 8px;
  font-size: 0.9rem;
  color: #666;

  &::placeholder {
    color: #999;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterButton = styled.button`
  background: ${(props) => (props.active ? theme.colors.accent : "white")};
  color: ${(props) => (props.active ? "white" : theme.colors.accent)};
  border: 1px solid ${theme.colors.accent};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Section = styled.div`
  padding: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const SeeAll = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.accent};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
`;

const FeaturedLists = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const ListCard = styled.div`
  min-width: 120px;
  height: 120px;
  background: #666;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
`;

const ListCardButton = styled.button`
  min-width: 120px;
  height: 120px;
  background: #666;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const FeedItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: #ddd;
  border-radius: 50%;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  text-align: left;
`;

const ActivityText = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
  text-align: left;
`;

const TimeStamp = styled.div`
  font-size: 0.8rem;
  color: #999;
  text-align: left;
`;

const Rating = styled.div`
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: auto;
`;

const AlbumGrid = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
`;

const AlbumCover = styled.div`
  width: 80px;
  height: 80px;
  background: #666;
  border-radius: 4px;
`;

const ReviewText = styled.p`
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
  margin: 12px 0;
  text-align: left;
`;

const InteractionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const InteractionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: #666;
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  padding: 0;

  &:hover {
    color: #333;
  }
`;

const InteractionRight = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    opacity: 0.85;
  }
`;

const FEATURED_LISTS = [
  {
    title: "Study flow",
    tracks: [
      { id: 1, title: "Got to Be Real", subtitle: "Song • Cheryl Lynn" },
      { id: 2, title: "September", subtitle: "Song • Earth, Wind & Fire" },
      { id: 3, title: "Boogie Wonderland", subtitle: "Song • Earth, Wind & Fire, The Emotions" },
      { id: 4, title: "Ain’t Nobody", subtitle: "Song • Chaka Khan" },
      { id: 5, title: "Le Freak", subtitle: "Song • CHIC" },
    ],
  },
  {
    title: "RapCaviar",
    tracks: [
      { id: 11, title: "Meltdown", subtitle: "Song • Travis Scott, Drake" },
      { id: 12, title: "First Person Shooter", subtitle: "Song • Drake, J. Cole" },
      { id: 13, title: "Rich Flex", subtitle: "Song • Drake, 21 Savage" },
      { id: 14, title: "BROTHER STONE", subtitle: "Song • Don Toliver" },
      { id: 15, title: "Knife Talk", subtitle: "Song • Drake, 21 Savage, Project Pat" },
    ],
  },
  {
    title: "Teenage Fever",
    tracks: [
      { id: 21, title: "drivers license", subtitle: "Song • Olivia Rodrigo" },
      { id: 22, title: "Heather", subtitle: "Song • Conan Gray" },
      { id: 23, title: "Telepatía", subtitle: "Song • Kali Uchis" },
      { id: 24, title: "Sweater Weather", subtitle: "Song • The Neighbourhood" },
      { id: 25, title: "Someone You Loved", subtitle: "Song • Lewis Capaldi" },
    ],
  },
];

function Feed({ setSelectedMusic }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const [feedData, setFeedData] = useState([
    {
      id: 1,
      user: "Mia",
      activity: "ranked",
      rating: "7.6",
      time: "Today",
      review:
        "People slept on Views way too hard when it dropped. Yeah, it's moody and self-indulgent, but that's what makes it timeless. The production aged beautifully.",
      likes: 10,
      bookmarks: 5,
      isLiked: false,
      title: "Views",
      artist: "Drake",
      musicType: "Album",
    },
    {
      id: 2,
      user: "Mia",
      activity: "ranked",
      rating: "7.6",
      time: "Today",
      review:
        "People slept on Views way too hard when it dropped. Yeah, it's moody and self-indulgent, but that's what makes it timeless. The production aged beautifully.",
      likes: 10,
      bookmarks: 5,
      isLiked: false,
      title: "Views",
      artist: "Drake",
      musicType: "Album",
    },
    {
      id: 3,
      user: "Mia",
      activity: "ranked",
      rating: "7.6",
      time: "Today",
      review:
        "People slept on Views way too hard when it dropped. Yeah, it's moody and self-indulgent, but that's what makes it timeless. The production aged beautifully.",
      likes: 10,
      bookmarks: 5,
      isLiked: false,
      title: "Views",
      artist: "Drake",
      musicType: "Album",
    },
  ]);

  // Different content for each tab
  const getTabData = (tab) => {
    switch (tab) {
      case "trending":
        return [
          {
            id: 1,
            user: "Mia",
            activity: "ranked",
            rating: "7.6",
            time: "Today",
            review:
              "People slept on Views way too hard when it dropped. Yeah, it's moody and self-indulgent, but that's what makes it timeless. The production aged beautifully.",
            likes: 10,
            bookmarks: 5,
            isLiked: false,
            artist: "Drake",
            title: "Views",
            musicType: "Album",
          },
          {
            id: 2,
            user: "Alex",
            activity: "ranked",
            rating: "9.2",
            time: "2 hours ago",
            review:
              "Kendrick really outdid himself here. Every track hits different and the production is insane.",
            likes: 24,
            bookmarks: 12,
            isLiked: false,
            artist: "Kendrick Lamar",
            title: "DAMN.",
            musicType: "Album",
          },
        ];
      case "friend-recs":
        return [
          {
            id: 3,
            user: "Sarah",
            activity: "recommended",
            rating: "8.8",
            time: "1 day ago",
            review:
              "If you haven't listened to Igor yet, you're missing out. Tyler's evolution as an artist is incredible.",
            likes: 15,
            bookmarks: 8,
            isLiked: false,
            artist: "Tyler, The Creator",
            title: "Igor",
            musicType: "Album",
          },
          {
            id: 4,
            user: "Jake",
            activity: "recommended",
            rating: "9.5",
            time: "2 days ago",
            review:
              "Still the best album of the 2010s. Frank's vocals and the production are otherworldly.",
            likes: 31,
            bookmarks: 18,
            isLiked: false,
            artist: "Frank Ocean",
            title: "Blonde",
            musicType: "Album",
          },
        ];
      case "new-releases":
        return [
          {
            id: 5,
            user: "Music Bot",
            activity: "new release",
            rating: "8.4",
            time: "3 hours ago",
            review:
              "SZA's highly anticipated follow-up to Ctrl is finally here. R&B perfection with modern twists.",
            likes: 42,
            bookmarks: 25,
            isLiked: false,
            artist: "SZA",
            title: "SOS",
            musicType: "Album",
          },
          {
            id: 6,
            user: "Music Bot",
            activity: "new release",
            rating: "7.9",
            time: "5 hours ago",
            review:
              "Metro proves once again why he's one of the best producers in the game right now.",
            likes: 28,
            bookmarks: 14,
            isLiked: false,
            artist: "Metro Boomin",
            title: "Heroes & Villains",
            musicType: "Album",
          },
        ];
      default:
        return [];
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFeedData(getTabData(tab));
  };

  // Initialize with trending data
  React.useEffect(() => {
    setFeedData(getTabData("trending"));
  }, []);

  const handleLike = (itemId) => {
    setFeedData((prevData) =>
      prevData.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const openFeatured = (list) => {
    navigate(`/app/featuredlist/${encodeURIComponent(list.title)}`, {
      state: { title: list.title, tracks: list.tracks },
    });
  };
  
  const goToMusic = (music) => {
    setSelectedMusic(music);
    navigate("/app/music");
  };
  return (
    <Container>
      <Header>
        <Logo src="/assets/images/logo.png" alt="musi" />
        <MenuButton onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} color="#333" />
        </MenuButton>
      </Header>

      <SearchContainer>
        <SearchBar>
          <Search size={16} color="#999" />
          <SearchInput placeholder="Search a song, album or user..." />
        </SearchBar>

        <FilterButtons>
          <FilterButton
            active={activeTab === "trending"}
            onClick={() => handleTabChange("trending")}
          >
            Trending
          </FilterButton>
          <FilterButton
            active={activeTab === "friend-recs"}
            onClick={() => handleTabChange("friend-recs")}
          >
            Friend recs
          </FilterButton>
          <FilterButton
            active={activeTab === "new-releases"}
            onClick={() => handleTabChange("new-releases")}
          >
            New releases
          </FilterButton>
        </FilterButtons>
      </SearchContainer>

      <Section>
        <SectionHeader>
          <SectionTitle>Featured Lists</SectionTitle>
          <SeeAll>See all</SeeAll>
        </SectionHeader>

        <FeaturedLists>
          {FEATURED_LISTS.map((list) => (
            <ListCardButton
              key={list.title}
              onClick={() => openFeatured(list)}
              aria-label={`Open ${list.title}`}
            >
              {list.title}
            </ListCardButton>
          ))}
        </FeaturedLists>
      </Section>

      <Section>
        <SectionTitle>Your Feed</SectionTitle>
      </Section>

      {feedData.map((item, index) => (
        <FeedItem key={item.id}>
          <UserInfo>
            <Avatar />
              <UserDetails>
                <UserName>{item.user}</UserName>
                  <ActivityText>
                  {item.activity}{" "}
                    <span
                      style={{ color: theme.colors.accent, cursor: "pointer", fontWeight: 600 }}
                      onClick={() => goToMusic(item)}
                    >
                      {item.title}
                    </span>
                  {" "}by {item.artist}
                  </ActivityText>
                  <TimeStamp>{item.time}</TimeStamp>
                  </UserDetails>
                  <Rating>{item.rating}</Rating>
              </UserInfo>

          <AlbumGrid>
            <AlbumCover />
            <AlbumCover />
            <AlbumCover />
          </AlbumGrid>

          <ReviewText>{item.review}</ReviewText>

          <InteractionBar>
            <InteractionLeft>
              <LikeButton onClick={() => handleLike(item.id)}>
                <Heart
                  size={16}
                  fill={item.isLiked ? "#ff6b6b" : "none"}
                  color={item.isLiked ? "#ff6b6b" : "#666"}
                />
                <span>{item.likes} likes</span>
              </LikeButton>
            </InteractionLeft>
            <InteractionRight>
              <span>{item.bookmarks} bookmarks</span>
            </InteractionRight>
          </InteractionBar>
        </FeedItem>
      ))}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </Container>
  );
}

export default Feed;
