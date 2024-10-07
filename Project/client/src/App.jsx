import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ChangePassword from "./components/changePassword"


/* import Create from "./components/create";
import Reset from "./components/reset"; */

function App() {

  return (

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/change-password" element={<ChangePassword />} />
      {/*  <Route path="/create" element={<Create />} />
      <Route path="/reset" element={<Reset />} /> */}

    </Routes>

  );
}

export default App;


