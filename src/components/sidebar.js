import { NavLink, useNavigate } from "react-router-dom";
import { HomeIcon, ShoppingCartIcon, UsersIcon, ChartPieIcon, ArrowLongRightIcon} from "@heroicons/react/24/outline";
import { supabase } from "../services/supabase";


const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/login"); // Redirect to login page after logout
    } else {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <NavLink to="/dashboard" className="flex items-center p-3 hover:bg-gray-700">
            <HomeIcon className="w-6 h-6 mr-2" /> Dashboard
          </NavLink>
          <NavLink to="/orders" className="flex items-center p-3 hover:bg-gray-700">
            <ShoppingCartIcon className="w-6 h-6 mr-2" /> Orders
          </NavLink>
          <NavLink to="/manage-categories" className="flex items-center p-3 hover:bg-gray-700">
             categories
          </NavLink>
          <NavLink to="/products" className="flex items-center p-3 hover:bg-gray-700">
            <ChartPieIcon className="w-6 h-6 mr-2" /> Products
          </NavLink>
          <NavLink to="/users" className="flex items-center p-3 hover:bg-gray-700">
            <UsersIcon className="w-6 h-6 mr-2" /> Users
          </NavLink>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center p-3 hover:bg-red-700 text-red-300 hover:text-white w-full mt-4"
          >
              <ArrowLongRightIcon className="w-6 h-6 mr-2" /> Logout
      </button>
    </div>
  );
};

export default Sidebar;

