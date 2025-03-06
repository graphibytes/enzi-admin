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

  const handleSaveProduct = async () => {
    const imageUrl = productData.image ? await handleImageUpload(productData.image) : editingProduct?.image_url;

    const payload = {
      name: productData.name,
      selling_price: productData.selling_price,
      variant: productData.variant.split(",").map((v) => v.trim()),
      category: productData.category,
      image_url: imageUrl,
    };

    if (editingProduct) {
      await supabase.from("products").update(payload).eq("product_id", editingProduct.product_id);
    } else {
      await supabase.from("products").insert([payload]);
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

      {/* Products Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Image</th>
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
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
