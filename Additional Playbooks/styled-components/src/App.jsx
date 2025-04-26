import React, { useState } from "react"
import styled, { keyframes, ThemeProvider } from "styled-components"
import react_logo from "./assets/react.svg"

const Button = styled.button`
  background-color: ${(props) =>
    props.varient === "primary" ? "#007bff" : "#6c757d"};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #0056b3;
  }
  &:active {
    background-color: #004085;
  }
`

const FancyButtonn = styled(Button)`
  background-image: linear-gradient(to right, #f6d365 0%, #fda085 100%);
  border: none;
`

const SubmitButton = styled(Button).attrs({
  type: "submit",
})`
  box-shadow: 0.9px #999;
  transition: all 0.3s ease;
  &:active {
    background-color: ${(props) =>
      props.varient === "primary" ? "#007bff" : "#6c757d"};
    box-shadow: 0 5px #666;
    transform: translateY(4px);
  }
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const AnimatedLogo = styled.img`
  height: 40vmin;
  pointer-events: none;
  animation: ${rotate} infinite 5s linear;
`

const ThemeToggleButton = styled.button`
  background-color: ${(props) =>
    props.theme.background || props.theme.backgroundColor};
  color: ${(props) => props.theme.color};
  border: 1px solid ${(props) => props.theme.color};
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`

const AppContainer = styled.div`
  background-color: ${(props) =>
    props.theme.background || props.theme.backgroundColor};
  color: ${(props) => props.theme.color};
  min-height: 100vh;
  padding: 20px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
`

const theme = {
  dark: {
    background: "#333",
    color: "#fff",
  },
  light: {
    backgroundColor: "#fff",
    color: "#000",
  },
}

const App = () => {
  const [currentTheme, setCurrentTheme] = useState("dark")

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <AppContainer>
        <ThemeToggleButton onClick={toggleTheme}>
          Switch to {currentTheme === "dark" ? "Light" : "Dark"} Theme
        </ThemeToggleButton>
        <button>button</button>
        <Button varient="primary">styled button</Button>
        <Button>styled button</Button>
        <FancyButtonn as="a">fancy button</FancyButtonn>
        <SubmitButton varient="primary">submit</SubmitButton>
        <AnimatedLogo src={react_logo} />
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
