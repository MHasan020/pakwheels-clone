import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CarDetail from "./pages/CarDetail";
import PostAd from "./pages/PostAd";
import MyAds from "./pages/MyAds";
import AdminPanel from "./pages/AdminPanel";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import MessageThread from "./pages/MessageThread";
import EditAd from "./pages/EditAd";
import Welcome from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:carId/:otherUserId" element={<MessageThread />} />
        <Route path="/edit-ad/:id" element={<EditAd />} />
                <Route path="/welcome" element={<Welcome />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
            <ChatWidget />
    </BrowserRouter>
  );
}

export default App;