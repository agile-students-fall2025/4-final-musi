import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import BackArrow from "../components/BackArrow";
import { theme } from "../theme";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 32px 24px 0 24px;
  position: relative;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 28px 0;
`;

const Logo = styled.img`
  height: 80px;
`;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text};
  font-size: 1.1rem;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 16px;
  border: none;
  border-radius: 16px;
  background: ${theme.colors.background_secondary};
  color: ${theme.colors.text};
  font-size: 1.1rem;
  margin-bottom: 0;
  outline: none;
`;

const EyeIcon = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text_secondary};
  font-size: 1.3rem;
  cursor: pointer;
`;

const PasswordRequirements = styled.div`
  color: ${theme.colors.text_secondary};
  font-size: 1rem;
  margin: 8px 0 4px 0;
`;

const Button = styled.button`
  padding: 18px 0;
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
`;

const BottomText = styled.div`
  position: absolute;
  bottom: 36px;
  left: 24px;
  right: 24px;
  text-align: center;
  color: ${theme.colors.text_secondary};
  font-size: 1.1rem;
`;

const LinkText = styled.span`
  color: ${theme.colors.text};
  font-weight: 600;
  cursor: pointer;
`;

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/onboarding");
  };

  return (
    <Container>
      <TopBar>
        <BackArrow />
      </TopBar>
      <LogoWrapper>
        <Logo src="/assets/images/logo.png" alt="musi logo" />
      </LogoWrapper>
      <Title>Welcome to Musi.</Title>
      <Subtitle>
        Create an account to start exploring playlists, rate songs, and connect through sound.
      </Subtitle>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <InputWrapper>
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <EyeIcon onClick={() => setShowPassword((v) => !v)}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </EyeIcon>
        </InputWrapper>
        <InputWrapper>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <EyeIcon onClick={() => setShowConfirmPassword((v) => !v)}>
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </EyeIcon>
        </InputWrapper>
        <PasswordRequirements>
          <div><b>Your password must have:</b></div>
          <div>✓ 8 to 20 characters</div>
          <div>✓ Letters, numbers, and special characters</div>
        </PasswordRequirements>
        <Button type="submit">Create account</Button>
      </Form>
      <BottomText>
        Already have an account?{" "}
        <LinkText onClick={() => navigate("/login")}>
          Login now
        </LinkText>
      </BottomText>
    </Container>
  );
}

export default Signup;