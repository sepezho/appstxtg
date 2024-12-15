import styled from "styled-components"

export const Back = styled.div`
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 8px;
`

export const PoolInfo = styled.div`
  text-align: left;
  width: 250px;
  margin: auto;
`

export const UserInfo = styled.div`
  text-align: left;
  width: 250px;
  margin: auto;
`


export const UserAddressHint = styled.span`
  display: none;
  font-style: italic;
  position: absolute;
  margin: 0 0 0 8px;
  @media only screen and (max-width: 599px) {
    display: none !important;
  
  }
`

export const UserAddress = styled.span`
  cursor: pointer;
  text-decoration: underline;
  margin: 0 0 0 4px;
  &:hover + ${UserAddressHint} {
    display: inline;
  }
`

export const PoolContainer = styled.div`
  text-align: center;
  margin: auto;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`

export const ActionButton = styled.button`
  width: 100px;
  background-color: #000;
  border:${(props) => props.disabled ? '1px dashed gray !important' : "1px dashed #fff !important"};
  color:${(props) => props.disabled ? 'gray' : "white"};
  padding: 2px 8px;
  font-size: 14px;
  margin: 8px 0;
  transition: transform 0.125s ease-in-out;
  &:hover {
    transform: scale(1.018);
    border:${(props) => props.disabled ? '1px dashed gray !important' : "1px solid #fff !important"};
    text-decoration:${(props) => props.disabled ? 'none' : "underline"};
  }
`

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // border: 1px dashed #fff;
  width: 300px;
  margin: 8px auto;
`

export const FormInput = styled.input`
  background-color: #000;
  outline: none;
  color: white;
  border: 1px dashed #fff ;
  padding: 2px 8px;
  font-size: 14px;
  transition: transform 0.125s ease-in-out;
  
  &:focus {
    transform: scale(1.018);
    border: 1px solid #fff;
  }

  &:hover {
    transform: scale(1.018);
    border: 1px solid #fff;
  }
`;

export const MintForm = styled(Form)`

`

export const BurnForm = styled(Form)`
`

export const Icon = styled.img`
  height: 20px;
`
