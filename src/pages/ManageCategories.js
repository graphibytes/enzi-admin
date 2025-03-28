import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [iconUrl, setIconUrl] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  };
    
    const [editingCategory, setEditingCategory] = useState(null);

const handleEditCategory = (category) => {
  setEditingCategory(category);
  setNewCategory(category.category);
  setIconUrl(null); // Reset iconUrl for updating
};

const handleSaveEditedCategory = async () => {
  let uploadedIconUrl = editingCategory.iconUrl;

  if (iconUrl) {
    const filePath = `categories/${iconUrl.name}`;
    const { data, error } = await supabase.storage.from("categories").upload(filePath, iconUrl, {
      upsert: true,
    });

    if (error) {
      console.error("Error uploading icon:", error);
      return;
    }

    uploadedIconUrl = `https://asalkbffrpqbnldbohzp.supabase.co/storage/v1/object/public/categories/${filePath}`;
  }

  const { error } = await supabase
    .from("categories")
    .update({ category: newCategory, iconUrl: uploadedIconUrl })
    .eq("category_id", editingCategory.category_id);

  if (error) {
    console.error("Error saving edited category:", error);
  } else {
    fetchCategories();
    setEditingCategory(null);
    setNewCategory("");
    setIconUrl(null);
  }
};


  const handleAddCategory = async () => {
  if (!newCategory) return;

  let uploadedIconUrl = null;
  if (iconUrl) {
    const filePath = `categories/${iconUrl.name}`;
    const { data, error } = await supabase.storage.from("categories").upload(filePath, iconUrl, {
      upsert: true,
    });

    if (error) {
      console.error("Error uploading icon:", error);
      return;
    }

    uploadedIconUrl = `https://asalkbffrpqbnldbohzp.supabase.co/storage/v1/object/public/categories/${filePath}`;
  }

  const { error } = await supabase.from("categories").insert([
    { category: newCategory, iconUrl: uploadedIconUrl },
  ]);

  if (error) {
    console.error("Error adding category:", error);
  } else {
    fetchCategories();
    setNewCategory("");
    setIconUrl(null);
  }
};


  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    const { error } = await supabase.from("categories").delete().eq("category_id", categoryId);

    if (error) {
      console.error("Error deleting category:", error);
    } else {
      fetchCategories();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

      {/* Add New Category */}
      <div className="mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category Name"
          className="border p-2 w-full mb-2"
        />
        <input
          type="file"
          onChange={(e) => setIconUrl(e.target.files[0])}
          className="border p-2 w-full mb-2"
        />
        <button onClick={handleAddCategory} className="bg-green-500 text-white px-4 py-2 rounded">
          Add Category
        </button>
      </div>

      {/* List of Categories */}
      <table className="w-full border">
  <thead>
    <tr className="bg-gray-100">
      <th className="p-2">Icon</th>
      <th className="p-2">Category</th>
      <th className="p-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {categories.map((cat) => (
      <tr key={cat.category_id} className="border-t">
        <td className="p-2">
          {cat.iconUrl ? (
            <img
              src={cat.iconUrl}
              alt={cat.category}
              className="w-12 h-12 object-cover"
            />
          ) : (
            "No Icon"
          )}
        </td>
        <td className="p-2">{cat.category}</td>
        <td className="p-2">
  <button
    onClick={() => handleEditCategory(cat)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    Edit
  </button>
  <button
    onClick={() => handleDeleteCategory(cat.category_id)}
    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
  >
    Delete
  </button>
</td>
      </tr>
    ))}
  </tbody>
          </table>
          
          {editingCategory && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Edit Category</h3>
      <form>
        {/* Category Name */}
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category Name"
          className="border p-2 w-full mb-4"
        />

        {/* Icon Upload */}
        <input
          type="file"
          onChange={(e) => setIconUrl(e.target.files[0])}
          className="border p-2 w-full mb-4"
        />
      </form>
      <div className="flex justify-end">
        <button
          onClick={handleSaveEditedCategory}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={() => setEditingCategory(null)}
          className="bg-red-500 text-white px-4 py-2 rounded ml-2"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default ManageCategories;
