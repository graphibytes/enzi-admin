import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // For accessing user_id from the route
import { supabase } from "../services/supabase";

const UserOrders = () => {
  const { userId } = useParams(); // Get user ID from URL parameters
  const [userOrders, setUserOrders] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserOrders();
    fetchUserInfo();
  }, [userId]);

  const fetchUserOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").eq("user_id", userId);
    if (error) console.error("Error fetching user orders:", error);
    else setUserOrders(data);
  };

  const fetchUserInfo = async () => {
    const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single();
    if (error) console.error("Error fetching user info:", error);
    else setUserInfo(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Orders</h2>

      {/* User Information */}
      {userInfo ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold">User Information</h3>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Phone:</strong> {userInfo.phone}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}

      {/* User Orders Table */}
      <h3 className="text-xl font-semibold mb-4">Orders</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Order ID</th>
            <th className="p-2">Total Price</th>
            <th className="p-2">Order Status</th>
            <th className="p-2">Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {userOrders.map((order) => (
            <tr key={order.order_id} className="border-t">
              <td className="p-2">{order.order_id}</td>
              <td className="p-2">${order.total_amount}</td>
              <td className="p-2">{order.order_status}</td>
              <td className="p-2">{order.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrders;
