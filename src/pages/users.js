import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("*");
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    await supabase.from("users").delete().eq("user_id", id);
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Users</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">First Name</th>
            <th className="p-2">Last Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="border-t">
              <td className="p-2">{user.first_name}</td>
              <td className="p-2">{user.last_name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                <button onClick={() => handleDeleteUser(user.user_id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
