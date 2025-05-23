import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Notification from "./components/Notification";
import Chat from "./components/Chat"; // ✅ NEW: Import Chat component
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import SinglePage from "./components/SinglePage/SinglePage";
import PaymentSuccess from "./components/Payment/PaymentSuccess";
import Payment from "./components/Payment/Payment";
import CreateEvent from "./components/CreateEvent/CreateEvent";
import EditEvent from "./components/EditEvent/EditEvent";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Profile from "./components/Profile/Profile";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import EventReview from "./components/EventReview/EventReview";
import MyEvent from "./pages/MyEvent/MyEvent";
import MyTickets from "./pages/MyTickets/MyTickets";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Notification /> {/* 🔔 Notifications visible globally */}
        <Chat /> {/* 💬 Chat visible globally */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<SinglePage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/payment" element={<Payment />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["organizer", "admin"]} />}>
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/myEvent" element={<MyEvent />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["user", "organizer", "admin"]} />}>
            <Route path="/my-tickets" element={<MyTickets />} />
          </Route>

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/review-event/:eventId" element={<EventReview />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
