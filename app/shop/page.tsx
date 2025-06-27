"use client";

import { useEffect, useState } from "react";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/shop?query=protein");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, []);

  const categories = Array.from(
    new Set(products.map((p) => p.category || "Supplements"))
  );

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => (p.category || "Supplements") === selectedCategory
        );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fitness Shop</h1>
          <span className="text-sm text-gray-600">
            Find your perfect fitness gear
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-full border ${
              selectedCategory === "All"
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-600 border-purple-600"
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-600 border-purple-600"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <div className="relative h-64">
                <img
                  src={product.image || "/protien.jpeg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.short_description || "No description"}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price || "$--"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.rating || 0}⭐
                  </span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
