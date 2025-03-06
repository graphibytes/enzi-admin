import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*");
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUpdateOrder = async (orderId, field, value) => {
    const { error } = await supabase.from("orders").update({ [field]: value }).eq("order_id", orderId);
    if (error) console.error("Error updating order:", error);
    else fetchOrders(); // Refresh after update
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const { error } = await supabase.from("orders").delete().eq("order_id", orderId);
    if (error) console.error("Error deleting order:", error);
    else fetchOrders(); // Refresh after deletion
  };

  const filteredOrders = orders.filter((order) =>
    order.order_id.toString().includes(searchTerm) ||
    (order.tracking_number && order.tracking_number.includes(searchTerm))
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Order ID or Tracking Number..."
        value={searchTerm}
        onChange={handleSearch}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Orders Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Order ID</th>
            <th className="p-2">User ID</th>
            <th className="p-2">Total Price</th>
            <th className="p-2">Order Status</th>
            <th className="p-2">Payment Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.order_id} className="border-t">
              <td className="p-2">{order.order_id}</td>
              <td className="p-2">{order.user_id}</td>
              <td className="p-2">${order.total_amount}</td>

              {/* Order Status Dropdown */}
              <td className="p-2">
                <select
                  value={order.order_status || "Pending"}
                  onChange={(e) => handleUpdateOrder(order.order_id, "order_status", e.target.value)}
                  className="border p-1 rounded bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>

              {/* Payment Status Dropdown */}
              <td className="p-2">
                <select
                  value={order.payment_status || "Unpaid"}
                  onChange={(e) => handleUpdateOrder(order.order_id, "payment_status", e.target.value)}
                  className="border p-1 rounded bg-white"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </td>

              {/* Delete Button */}
              <td className="p-2">
                <button
                  onClick={() => handleDeleteOrder(order.order_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
