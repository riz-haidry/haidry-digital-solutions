import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import SectionDots from "./components/SectionDots";
import SeoHead from "./components/SeoHead";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <WhatsAppButton />
      <SectionDots />
    </>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const frame = window.requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
            block: "start",
          }),
      );
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    return undefined;
  }, [pathname, hash]);
  return null;
}

function ProtectedRoute({ children }) {
  return sessionStorage.getItem("hds-admin-token") ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 / THAT PAGE ISN’T HERE</p>
      <h1>
        Looks like this
        <br />
        idea wandered off.
      </h1>
      <Link className="button button-primary" to="/">
        Back to home <span>↗</span>
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SeoHead />
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
