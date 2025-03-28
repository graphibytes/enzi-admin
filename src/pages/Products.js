import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { supabase } from "../services/supabase";
import { PencilIcon, TrashIcon, StarIcon, FireIcon } from "@heroicons/react/24/solid";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({
    name: "",
    selling_price: "",
    variant: "",
    category: "",
    image: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
    fetchPopularProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else {
      setProducts(data);
      setFilteredProducts(data);
    }
  };

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase.from("featured_products").select("product_id");
    if (error) console.error("Error fetching featured products:", error);
    else setFeaturedProducts(data.map((item) => item.product_id));
  };

  const fetchPopularProducts = async () => {
    const { data, error } = await supabase.from("popular_products").select("product_id");
    if (error) console.error("Error fetching popular products:", error);
    else setPopularProducts(data.map((item) => item.product_id));
  };

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const filePath = `products/${file.name}`;
    const { data, error } = await supabase.storage.from("products").upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    return `https://asalkbffrpqbnldbohzp.supabase.co/storage/v1/object/public/products/${filePath}`;
  };

  const [categories, setCategories] = useState([]);

const fetchCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) {
    console.error("Error fetching categories:", error);
  } else {
    setCategories(data);
  }
};

useEffect(() => {
  fetchCategories();
}, []);

  const [lowStockItems, setLowStockItems] = useState([]);
const [showLowStockPopup, setShowLowStockPopup] = useState(false);

useEffect(() => {
  if (products.length) {
    const lowStock = products.filter((p) => p.stock_quantity < 15);
    if (lowStock.length) {
      setLowStockItems(lowStock);
      setShowLowStockPopup(true); // Show pop-up only if there are low-stock items
    }
  }
}, [products]);


  const handleSaveProduct = async () => {
  const imageUrl = productData.image ? await handleImageUpload(productData.image) : editingProduct?.image_url;

  const payload = {
    name: productData.name,
    selling_price: parseFloat(productData.selling_price),
    variant: productData.variant.split(",").map((v) => v.trim()),
    category: productData.category ? parseInt(productData.category) : null, // Save category_id
    image_url: imageUrl,
    description: productData.description,
    stock_quantity: parseInt(productData.stock_quantity) || 0,
  };

  if (editingProduct) {
    const { error } = await supabase.from("products").update(payload).eq("product_id", editingProduct.product_id);
    if (error) console.error("Error updating product:", error);
  } else {
    const { error } = await supabase.from("products").insert([payload]);
    if (error) console.error("Error adding product:", error);
  }

  fetchProducts();
  handleCloseDialog();
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await supabase.from("products").delete().eq("product_id", id);
    fetchProducts();
  };

  const handleOpenDialog = (product = null) => {
  console.log("Opening dialog for product:", product);
  setEditingProduct(product);
  setProductData({
    name: product?.name || "",
    selling_price: product?.selling_price || "",
    variant: product?.variant?.join(", ") || "",
    category: product?.category || "",
    image: null,
  });
  setShowDialog(true);
};

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setShowDialog(false);
  };

  // Add to Featured Products
  const addToFeatured = async (id) => {
    const { error } = await supabase.from("featured_products").insert([{ product_id: id }]);
    if (error) console.error("Error adding to featured:", error);
    else fetchFeaturedProducts();
  };

  // Remove from Featured Products
  const removeFromFeatured = async (id) => {
    const { error } = await supabase.from("featured_products").delete().eq("product_id", id);
    if (error) console.error("Error removing from featured:", error);
    else fetchFeaturedProducts();
  };

  // Add to Popular Products
  const addToPopular = async (id) => {
    const { error } = await supabase.from("popular_products").insert([{ product_id: id }]);
    if (error) console.error("Error adding to popular:", error);
    else fetchPopularProducts();
  };

  // Remove from Popular Products
  const removeFromPopular = async (id) => {
    const { error } = await supabase.from("popular_products").delete().eq("product_id", id);
    if (error) console.error("Error removing from popular:", error);
    else fetchPopularProducts();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Products</h2>

      {/* Navigation Buttons */}
      <div className="mb-4 space-x-2">
        <button onClick={() => navigate("/featured-products")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Featured Products
        </button>
        <button onClick={() => navigate("/popular-products")} className="bg-orange-500 text-white px-4 py-2 rounded">
          Popular Products
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      {/* Add Product Button */}
      <button onClick={() => handleOpenDialog()} className="bg-green-600 text-white p-2 rounded mb-4">
  + Add Product
</button>

      {showDialog && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">
        {editingProduct ? "Edit Product" : "Add Product"}
      </h3>
      <form>
        {/* Product Name */}
        <input
          type="text"
          value={productData.name}
          onChange={(e) => setProductData({ ...productData, name: e.target.value })}
          placeholder="Product Name"
          className="border p-2 w-full mb-4"
        />

        {/* Selling Price */}
        <input
          type="number"
          value={productData.selling_price}
          onChange={(e) => setProductData({ ...productData, selling_price: e.target.value })}
          placeholder="Selling Price"
          className="border p-2 w-full mb-4"
        />

        {/* Variants */}
        <input
          type="text"
          value={productData.variant}
          onChange={(e) => setProductData({ ...productData, variant: e.target.value })}
          placeholder="Variants (comma-separated)"
          className="border p-2 w-full mb-4"
        />

        {/* Category Dropdown */}
        <select
  value={productData.category || ""}
  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
  className="border p-2 w-full mb-4"
>
  <option value="">Select Category</option>
  {categories.map((cat) => (
    <option key={cat.category_id} value={cat.category_id}>
      {cat.category} {/* Display the category text */}
    </option>
  ))}
</select>

        {/* Description */}
        <textarea
          value={productData.description || ""}
          onChange={(e) => setProductData({ ...productData, description: e.target.value })}
          placeholder="Description"
          className="border p-2 w-full mb-4"
          rows="3"
        ></textarea>

        {/* Stock Quantity */}
        <input
          type="number"
          value={productData.stock_quantity || ""}
          onChange={(e) => setProductData({ ...productData, stock_quantity: e.target.value })}
          placeholder="Stock Quantity"
          className="border p-2 w-full mb-4"
        />

        {/* Image Upload */}
        <input
          type="file"
          onChange={(e) => setProductData({ ...productData, image: e.target.files[0] })}
          className="border p-2 w-full mb-4"
        />
      </form>

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end">
        <button onClick={handleSaveProduct} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save
        </button>
        <button onClick={handleCloseDialog} className="bg-red-500 text-white px-4 py-2 rounded ml-2">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {showLowStockPopup && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Low Stock Alert</h3>
      <ul className="list-disc pl-5">
        {lowStockItems.map((item) => (
          <li key={item.product_id} className="mb-2">
            {item.name} - <strong>{item.stock_quantity} left</strong>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setShowLowStockPopup(false)}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* Products Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Image</th>
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock Quantity</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.product_id} className="border-t">
              <td className="p-2">
                <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover" />
              </td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">${p.selling_price}</td>
              <td className="p-2">
          <span>{p.stock_quantity}</span>
          <span className={`ml-2 ${p.stock_quantity < 15 ? "text-red-500" : "text-green-500"}`}>
            {p.stock_quantity < 5
              ? "Restock"
              : p.stock_quantity < 15
              ? "Fair Stock"
              : "Sufficient Stock"}
          </span>
        </td>
              <td className="p-2 flex space-x-2">
                <button onClick={() => handleOpenDialog(p)} className="text-blue-500">
  <PencilIcon className="h-5 w-5" />
</button>
                <button onClick={() => handleDelete(p.product_id)} className="text-red-500">
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button onClick={() => featuredProducts.includes(p.product_id) ? removeFromFeatured(p.product_id) : addToFeatured(p.product_id)} className="text-yellow-500">
                  <StarIcon className="h-5 w-5" />
                </button>
                <button onClick={() => popularProducts.includes(p.product_id) ? removeFromPopular(p.product_id) : addToPopular(p.product_id)} className="text-orange-500">
                  <FireIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProducts;
