import styled from 'styled-components';

// Định nghĩa kiểu cho các props
interface AuthProps {
    $signinIn: boolean; // Sử dụng `$` cho transient prop
}

export const Section = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export const MidContainer = styled.div`
  background-color: #eee;
  border: 1px solid #ccc;
  position: absolute;
  top: 16%;
  left: 16%;
  overflow: hidden;
  width: 1000px;
  max-width: 100%;
  min-height: 550px;
`;

export const RegisterContainer = styled.div<AuthProps>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${props => props.$signinIn !== true ? `
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  ` : null}
`;

export const LoginContainer = styled.div<AuthProps>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  ${props => (props.$signinIn !== true ? `transform: translateX(100%);` : null)}
`;

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 45px;
  line-height: 45px;
  margin: 0 auto 30px auto;
`;
export const Greeting = styled.h1`
  font-size: 45px;
  line-height: 45px;
  text-shadow: 20px 0 20px #ea8025;
`;

export const Input = styled.input`
  background-color: #eee;
  border-radius: 10px;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
`;

export const Button = styled.button`
  position: relative;
  background-color: #ea8025;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 80px;
  letter-spacing: 1px;
  &:hover {
    letter-spacing: 3px;
  }
  &:active {
    transform: scale(0.95);
  }
  &:focus {
    outline: none;
  }
`;

export const GhostButton = styled(Button)`
  border-color: #ffffff;
`;
export const Anchor = styled.a`
  color: #333;
  font-size: 15px;
  text-decoration: none;
  margin: 15px 0;
  transition: 0.5s;
  &:hover {
    color: #ea8025;
  }
`;

export const OverlayContainer = styled.div<AuthProps>`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${props => props.$signinIn !== true ? `transform: translateX(-100%);` : null}
`;

export const Overlay = styled.div<AuthProps>`
  background-image: url("src/account/AuthPage/Bg-coffee.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  ${props => (props.$signinIn !== true ? `transform: translateX(50%);` : null)}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`;

export const LeftOverlayPanel = styled(OverlayPanel) <AuthProps>`
  transform: translateX(-20%);
  ${props => props.$signinIn !== true ? `transform: translateX(0);` : null}
`;

export const RightOverlayPanel = styled(OverlayPanel) <AuthProps>`
  right: 0;
  transform: translateX(0);
  ${props => props.$signinIn !== true ? `transform: translateX(20%);` : null}
`;

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
`;