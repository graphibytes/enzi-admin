import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./services/supabase";
import Login from "./pages/login";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/Dashboard";
import ManageProducts from "./pages/Products";
import Users from "./pages/users";
import Orders from "./pages/orders";
import FeaturedProducts from "./pages/FeaturedProducts";
import PopularProducts from "./pages/PopularProducts";





function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {!session ? (
          <Route path="/*" element={<Login />} />
        ) : (
          <Route
            path="/*"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<ManageProducts />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/featured-products" element={<FeaturedProducts />} />
                    <Route path="/popular-products" element={<PopularProducts />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            }
          />
        )}
      </Routes>
    </Router>
  );
}

export default App;

