import Pool from './pages/Pool';
import Header from './components/Header/';
import PoolsList from './pages/PoolsList';
// import About from './components/About/';
//import Swap from './components/Swap/'
//import SwapForm from './components/SwapForm/'

import { Provider } from 'react-redux'
import { store } from './store/reducers'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Provider store={store}>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PoolsList />} />
          <Route path="/pool/:syntName" element={<Pool />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
// <Route path="/swap" element={<Swap />} />
// <Route path="/swap/:outSyntName/:targetSyntName" element={<SwapForm />} />

export default App;
