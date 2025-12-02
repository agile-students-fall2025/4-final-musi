import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Share, Menu, Edit, ChevronRight, Star, Flame, ChevronLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { theme } from '../theme';
import FollowButton from '../components/FollowButton';
import axios from 'axios';

const Container = styled.div`
  background: ${theme.colors.background};
  padding: 16px;
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const UserName = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${theme.colors.text};
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #d3d3d3;
  position: relative;
  margin-bottom: 16px;
`;

const EditIcon = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: 2px solid ${theme.colors.background};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Username = styled.div`
  font-size: 1rem;
  color: ${theme.colors.text};
  margin-bottom: 4px;
`;

const Bio = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 8px;
`;

const MemberSince = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

// const Button = styled.button`
//   flex: 1;
//   padding: 10px 20px;
//   border: 1px solid #e0e0e0;
//   background: white;
//   border-radius: 8px;
//   font-size: 0.9rem;
//   cursor: pointer;
// `;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 32px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 0;
  border: none;
  background: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ListItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ListItemText = styled.span`
  font-size: 1rem;
  color: ${theme.colors.text};
`;

const ListItemCount = styled.span`
  font-size: 1rem;
  color: ${theme.colors.text_secondary};
`;

const CardRow = styled.div`
  display: flex;
  gap: 12px;
  margin: 24px 0;
`;

const Card = styled.div`
  flex: 1;
  padding: 20px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardLabel = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
`;

const CardValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  border-bottom: 2px solid ${props => props.active ? '#000' : 'transparent'};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  color: ${theme.colors.text};
`;

const TabContent = styled.div`
  padding-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.text_secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  margin-top: 24px;
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  position: relative;
  height: 250px;
`;

const ChartLegend = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TrackImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #d3d3d3;
  flex-shrink: 0;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TrackTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${theme.colors.text};
`;

const TrackArtist = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const InsightCard = styled.div`
  padding: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
`;

const InsightLabel = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 4px;
`;

const InsightValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

// Edit Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: flex-end;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${theme.colors.text};
  position: absolute;
  left: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 auto;
  color: ${theme.colors.text};
`;

const EditPhotoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const EditPhotoButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FormItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border: none;
  background: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  text-align: left;
`;

const FormLabel = styled.div`
  font-size: 1rem;
  font-weight: 400;
  color: ${theme.colors.text};
`;

const FormValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormValue = styled.div`
  font-size: 1rem;
  color: ${theme.colors.text_secondary};
`;

const SectionDivider = styled.div`
  height: 16px;
`;

function User() {
  const [activeTab, setActiveTab] = useState('activity');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    email: '',
    followers: 0,
    following: 0,
    currentStreak: 0,
    longestStreak: 0,
    dateJoined: null,
    totalLogins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const userData = response.data.user;
        
        setProfile({
          name: userData.name || 'User',
          username: userData.username || '@user',
          bio: userData.bio || 'No bio yet',
          email: userData.email,
          followers: userData.followers?.length || 0,
          following: userData.following?.length || 0,
          currentStreak: userData.currentStreak || 0,
          longestStreak: userData.longestStreak || 0,
          dateJoined: userData.dateJoined || userData.createdAt,
          totalLogins: userData.totalLogins || 0
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const genreData = [
    { name: 'R&B', value: 32, color: '#4A4A4A' },
    { name: 'Pop', value: 28, color: '#C0C0C0' },
    { name: 'Hip Hop', value: 24, color: '#6B6B6B' },
    { name: 'Rock', value: 16, color: '#E8E8E8' },
  ];

  const topTracks = [
    { title: 'Got to Be Real', artist: 'Song • Cheryl Lynn' },
    { title: 'Got to Be Real', artist: 'Song • Cheryl Lynn' },
    { title: 'Got to Be Real', artist: 'Song • Cheryl Lynn' },
  ];

  if (loading) {
    return (
      <Container>
        <p style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.text_secondary }}>
          Loading profile...
        </p>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <div>
            <IconButton>
              <ChevronLeft size={22} />
            </IconButton>
          </div>
          <UserName>{profile.name}</UserName>
          <div>
            <IconButton><Share size={20} /></IconButton>
            <IconButton><Menu size={20} /></IconButton>
          </div>
        </Header>

        <ProfileSection>
          <Avatar>
            <EditIcon onClick={() => setShowEditModal(true)}>
              <Edit size={16} />
            </EditIcon>
          </Avatar>
          <Username>@{profile.username}</Username>
          <Bio>{profile.bio}</Bio>
          <MemberSince>Member since {formatDate(profile.dateJoined)}</MemberSince>

          <ButtonGroup>
            <FollowButton />
          </ButtonGroup>
        </ProfileSection>

        <StatsRow>
          <StatItem>
            <StatValue>{profile.followers}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{profile.following}</StatValue>
            <StatLabel>Following</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>#2</StatValue>
            <StatLabel>Rank on Musi</StatLabel>
          </StatItem>
        </StatsRow>

        <ListItem>
          <ListItemLeft>
            <span>🎧</span>
            <ListItemText>Listened</ListItemText>
          </ListItemLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListItemCount>0</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem>
          <ListItemLeft>
            <span>🔖</span>
            <ListItemText>Want to listen</ListItemText>
          </ListItemLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListItemCount>0</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem>
          <ListItemLeft>
            <span>🔗</span>
            <ListItemText>Music you both like</ListItemText>
          </ListItemLeft>
          <ChevronRight size={20} color="#999" />
        </ListItem>

        <CardRow>
          <Card>
            <Star size={20} />
            <CardLabel>Rank on Musi</CardLabel>
            <CardValue>#2</CardValue>
          </Card>
          <Card>
            <Flame size={20} />
            <CardLabel>Current streak</CardLabel>
            <CardValue>{profile.currentStreak} {profile.currentStreak === 1 ? 'day' : 'days'}</CardValue>
          </Card>
        </CardRow>

        <TabBar>
          <Tab active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
            Recent activity
          </Tab>
          <Tab active={activeTab === 'taste'} onClick={() => setActiveTab('taste')}>
            Music taste
          </Tab>
        </TabBar>

        {activeTab === 'activity' && (
          <TabContent>
            <p style={{ color: theme.colors.text_secondary, textAlign: 'center', padding: '40px 0' }}>
              No recent activity
            </p>
          </TabContent>
        )}

        {activeTab === 'taste' && (
          <TabContent>
            <SectionTitle>YOUR TOP GENRES</SectionTitle>

            <ChartContainer>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <ChartLegend style={{
                left: '10%',
                top: '50%',
                transform: 'translateY(-50%)'
              }}>
                <LegendItem>
                  <LegendColor color="#E8E8E8" />
                  <span>Rock</span>
                </LegendItem>
                <LegendItem>
                  <span style={{ marginLeft: '20px', fontSize: '0.8rem' }}>16.00%</span>
                </LegendItem>
                <LegendItem style={{ marginTop: '8px' }}>
                  <LegendColor color="#6B6B6B" />
                  <span>Hip Hop</span>
                </LegendItem>
                <LegendItem>
                  <span style={{ marginLeft: '20px', fontSize: '0.8rem' }}>24.00%</span>
                </LegendItem>
              </ChartLegend>

              <ChartLegend style={{
                right: '10%',
                top: '50%',
                transform: 'translateY(-50%)'
              }}>
                <LegendItem>
                  <LegendColor color="#4A4A4A" />
                  <span>R&B</span>
                </LegendItem>
                <LegendItem>
                  <span style={{ marginLeft: '20px', fontSize: '0.8rem' }}>32.00%</span>
                </LegendItem>
                <LegendItem style={{ marginTop: '8px' }}>
                  <LegendColor color="#C0C0C0" />
                  <span>Pop</span>
                </LegendItem>
                <LegendItem>
                  <span style={{ marginLeft: '20px', fontSize: '0.8rem' }}>28.00%</span>
                </LegendItem>
              </ChartLegend>
            </ChartContainer>

            <SectionTitle>YOUR TOP TRACKS</SectionTitle>
            <TrackList>
              {topTracks.map((track, index) => (
                <TrackItem key={index}>
                  <TrackImage />
                  <TrackInfo>
                    <TrackTitle>{track.title}</TrackTitle>
                    <TrackArtist>{track.artist}</TrackArtist>
                  </TrackInfo>
                </TrackItem>
              ))}
            </TrackList>

            <SectionTitle>INSIGHTS</SectionTitle>
            <InsightsGrid>
              <InsightCard>
                <InsightLabel>Total Logins</InsightLabel>
                <InsightValue>{profile.totalLogins}</InsightValue>
              </InsightCard>
              <InsightCard>
                <InsightLabel>Longest Streak</InsightLabel>
                <InsightValue>{profile.longestStreak}</InsightValue>
              </InsightCard>
            </InsightsGrid>
          </TabContent>
        )}
      </Container>

      {/* Edit Profile Modal */}
      <ModalOverlay show={showEditModal} onClick={() => setShowEditModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <CloseButton onClick={() => setShowEditModal(false)}>
              <ChevronLeft size={24} />
            </CloseButton>
            <ModalTitle>Edit profile</ModalTitle>
          </ModalHeader>

          <EditPhotoSection>
            <Avatar />
            <EditPhotoButton>Edit profile photo</EditPhotoButton>
          </EditPhotoSection>

          <FormSection>
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormValueContainer>
                <FormValue>{profile.name}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormValueContainer>
                <FormValue>@{profile.username}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormValueContainer>
                <FormValue>{profile.bio}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <SectionDivider />

            <FormItem>
              <FormLabel>Account settings</FormLabel>
              <ChevronRight size={20} color="#999" />
            </FormItem>
          </FormSection>
        </ModalContent>
      </ModalOverlay>
    </>
  );
}

export default User;