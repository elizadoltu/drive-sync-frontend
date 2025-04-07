import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
// import AdminLogin from './admin/LoginAdmin';
import Profile from "./pages/Profile";
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
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/user/profile' element={<Profile />} />
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
