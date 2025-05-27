import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LandingPage from './LandingPage';
import MechanicChatbot from './pages/MechanicChatbot';
import Profile from "./pages/Profile";
import Maps from './pages/Maps';
import LoginAdmin from './pages/admin/LoginAdmin';
import LoginDriver from './pages/driver/LoginDriver';
import RegisterAdmin from './pages/admin/RegisterAdmin';
import RegisterDriver from './pages/driver/RegisterDriver';
// import ProfileSettings from "./pages/ProfileSettings";
// import Reservations from "./pages/Reservations";
// import Bills from "./pages/Bills";
// // import AdminDashboard from "./admin/AdminDashboard";
// import Cars from "./pages/Cars";
import "./styles/underline-animation.css";

function App() {
  return (
    <Router>
      

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/user/profile' element={<Profile />} />
          <Route path='/maps' element={<Maps />} />
          <Route path='/chatbot' element={<MechanicChatbot />} />
          <Route path='/admin/login' element={<LoginAdmin />} />
          <Route path='/driver/login' element={<LoginDriver />} />
          <Route path='/admin/register' element={<RegisterAdmin />} />
          <Route path='/driver/register' element={<RegisterDriver />} />
          {/* <Route path='/user/settings' element={<ProfileSettings />} /> */}
          {/* <Route path='/user/bills' element={<Bills />} />
          <Route path='/user/cars' element={<Cars />} />
          <Route path='/user/reservations' element={<Reservations />} /> */}
          {/* <Route path='/admin/login' element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} /> */}
        </Routes>
   
    </Router>
  );
}

export default App;
