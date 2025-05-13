import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import SinglePage from "./components/SinglePage/SinglePage";
import PaymentSuccess from "./components/Payment/PaymentSuccess";
import Payment from "./components/Payment/Payment";
import CreateEvent from "./components/CreateEvent/CreateEvent";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Profile from "./components/Profile/Profile";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<SinglePage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
            <Route path="/create-event" element={<CreateEvent />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
