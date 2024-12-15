import styled from "styled-components"

export const PoolsListContainer = styled.div`
  text-align: center;
  margin: auto;
`

export const PoolItem = styled.div`
  text-align: center;
  margin: auto;
  width: 165px;
  padding: 10px;
  border: 1px dashed #fff;
  cursor: pointer;
  margin: 8px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.125s ease-in-out;
  &:hover {
    transform: scale(1.018);
    text-decoration: underline;
    border: 1px solid #fff;
  }
`

export const Icon = styled.img`
  height: 20px;
  padding: 0 8px 0 0;
`

export const AboutBtn = styled.span`
  text-decoration: underline;
  cursor: pointer;
`

export const Locked = styled.span`
  text-decoration: underline;
  cursor: not-allowed;
  color: gray;
`
