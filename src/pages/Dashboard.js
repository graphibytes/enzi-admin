import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// 🔥 Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    products: 0,
    users: 0,
    orders: 0,
    sales: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("*", { count: "exact" });

        const { count: userCount, error: userError } = await supabase
          .from("users")
          .select("*", { count: "exact" });

        const { count: orderCount, error: orderError } = await supabase
          .from("orders")
          .select("*", { count: "exact" });

        const { data: salesData, error: salesError } = await supabase
          .from("orders")
          .select("*");

        if (productError || userError || orderError || salesError) {
          console.error(
            "Error fetching metrics:",
            productError || userError || orderError || salesError
          );
          return;
        }

        // Calculate total sales revenue
        const totalSales = salesData
          ? salesData.reduce((sum, order) => sum + order.total_price, 0)
          : 0;

        setMetrics({
          products: productCount || 0,
          users: userCount || 0,
          orders: orderCount || 0,
          sales: totalSales || 0,
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ["Products", "Users", "Orders", "Sales (Ksh)"],
    datasets: [
      {
        label: "Counts",
        data: [metrics.products, metrics.users, metrics.orders, metrics.sales],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "E-commerce Metrics" },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-200 rounded shadow-md text-lg font-semibold">
          📦 Total Products: {metrics.products}
        </div>
        <div className="p-4 bg-green-200 rounded shadow-md text-lg font-semibold">
          👥 Total Users: {metrics.users}
        </div>
        <div className="p-4 bg-red-200 rounded shadow-md text-lg font-semibold">
          📑 Total Orders: {metrics.orders}
        </div>
        <div className="p-4 bg-yellow-200 rounded shadow-md text-lg font-semibold">
          💰 Total Sales: Ksh {metrics.sales.toLocaleString()}
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-2">E-commerce Trends</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
