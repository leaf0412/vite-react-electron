import { HashRouter, Route, Routes } from 'react-router-dom';
import router from '@/router';
import './App.css';

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          {router.map((item, index) => {
            return (
              <Route
                key={index}
                path={item.path}
                element={<item.Component />}
              />
            );
          })}
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
