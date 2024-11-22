import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <h1>使用 Vite + React + Electron 构建案例</h1>
      <nav>
        <ul>
          <li>
            <Link to="/window">窗口管理</Link>
          </li>
          <li>
            <Link to="/dialog">对话框管理</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
