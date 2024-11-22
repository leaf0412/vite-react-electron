import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <h1>使用 Vite + React + Electron 构建案例</h1>
      <nav>
        <ul>
          <li>
            <Link to="/window">Window Management</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
