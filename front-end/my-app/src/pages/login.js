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

const Subtitle = styled.h1`
  color: ${theme.colors.text_secondary};
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-size: 2rem;
  font-weight: 700;
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
  font-weight: 400;
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

const ForgotPassword = styled.div`
  text-align: right;
  color: ${theme.colors.text_secondary};
  font-size: 1rem;
  font-weight: 500;
  margin: 8px 0 20px 0;
  cursor: pointer;
  
  &:hover {
    color: ${theme.colors.text};
  }
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
  margin-bottom: 32px;
`;

const BottomText = styled.div`
  text-align: center;
  color: ${theme.colors.text_secondary};
  font-size: 1.1rem;
  margin-top: auto;
  margin-bottom: 36px;
`;

const LinkText = styled.span`
  color: ${theme.colors.text};
  font-weight: 600;
  cursor: pointer;
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/app");
  };

  return (
    <Container>
      <TopBar>
        <BackArrow />
      </TopBar>
      <LogoWrapper>
        <Logo src="/assets/images/logo.png" alt="musi logo" />
      </LogoWrapper>
      <Subtitle>Welcome back, we missed you!</Subtitle>
      <Title>Let's sign you in.</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Username or Email"
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
        <ForgotPassword onClick={() => navigate("/forgot")}>
          Forgot password?
        </ForgotPassword>
        <Button type="submit">Login</Button>
      </Form>
      <BottomText>
        Don’t have an account?{" "}
        <LinkText onClick={() => navigate("/signup")}>
          Create an account
        </LinkText>
      </BottomText>
    </Container>
  );
}

export default Login;
