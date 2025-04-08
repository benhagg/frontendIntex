import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import CookieConsent from "react-cookie-consent";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected movie routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <CookieConsent
        location="bottom"
        buttonText="Accept All"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="cineNicheConsent"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        declineButtonStyle={{ fontSize: "13px" }}
        onAccept={() => {
          // Set a cookie when the user accepts
          document.cookie = "cineNicheConsent=accepted; path=/; SameSite=Lax;";
          console.log("User accepted cookies");
        }}
        onDecline={() => {
          // Set a cookie when the user declines
          document.cookie = "cineNicheConsent=declined; path=/; SameSite=Lax;";
          console.log("User declined cookies");
        }}
      >
        We use cookies to enhance your experience, analyze traffic, and
        personalize content.{" "}
        <a href="/privacy" className="underline text-blue-300">
          Learn more
        </a>
      </CookieConsent>
    </AuthProvider>
  );
}

export default App;
