import { createGlobalStyle } from "styled-components"

export const GlobalStyles = createGlobalStyle`
  html {
    background-color: #000;
    color: #fff;
  }
  
  * {
    font-family: 'Times New Roman' !important ;
  } 

  tc-root {
    left: 0 !important;
    right: 0 !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translate(0%);
    button {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  #ton-connect-button {
    > div {
      > tc-root{
        > div {
          border: none !important;
        }
      }
    }
    :hover {
      button {
        text-decoration: underline;
        border-radius: 0;
        border: 1px solid #fff;
      }
    }
    button {
      border-radius: 0;
      background-color: #000;
      border: 1px dashed #fff;
    }
  }
  
  #tc-widget-root {
    tc-root {
      display:contents;
    }
  }
  
  a {
    color: white
  }
`
