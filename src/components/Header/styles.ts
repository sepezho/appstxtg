import styled from "styled-components"

export const HeaderContainer = styled.div`
  text-align: center;
  width: 165px;
  margin: auto;
  display: flex;
  align-items: center;
  flex-direction: column;
`

export const Logo = styled.img`
  width: 32px;
  transition: transform 1s ease-in-out;
  &:hover {
    transform: perspective(200px) rotateY(-180deg);
  }
`
