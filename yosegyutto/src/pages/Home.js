import { useNavigate } from "react-router-dom";
import "./home.css";    //CSS適応先参照

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="box" onClick={() => navigate("/make")}>
        寄木を作る
      </div>
      <div className="box" onClick={() => navigate("/looking")}>
        寄木を探す
      </div>
    </div>
  );
}

export default Home;
