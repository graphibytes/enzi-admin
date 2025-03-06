import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { TrashIcon } from "@heroicons/react/24/solid";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from("featured_products")
    .select("product_id, products!inner(*)"); // Inner join with products

  if (error) console.error("Error fetching featured products:", error);
  else setProducts(data);
};



  const removeFromFeatured = async (id) => {
    await supabase.from("featured_products").delete().eq("product_id", id);
    fetchFeaturedProducts();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
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
          {products.map(({ product_id, products: p }) => (
            <tr key={product_id} className="border-t">
              <td className="p-2">
                <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover" />
              </td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">${p.selling_price}</td>
              <td className="p-2">
                <button onClick={() => removeFromFeatured(product_id)} className="text-red-500">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeaturedProducts;
