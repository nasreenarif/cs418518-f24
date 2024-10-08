import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ChangePassword from "./components/changePassword";
import ChangeInfo from "./components/changeInfo";
import ForgotPassword from "./components/forgotPassword";
import CreateAccount from "./components/createAccount";
import VerifyCode from "./components/verifyCode";



/* import Create from "./components/create";
import Reset from "./components/reset"; */

function App() {

  return (

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/change-info" element={<ChangeInfo />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/verify-code" element={<VerifyCode />} />

    </Routes>

  );
}

export default App;


