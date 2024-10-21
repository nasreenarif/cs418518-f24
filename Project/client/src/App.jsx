import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/dashboard";
import Header from "./components/Header";
import Login from "./components/Login";
function App() {

  return (
    <>
    <Header />
    <Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
    </>
  );
}

export default App;


