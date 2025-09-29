"use client";

export default function ShopPage() {
  const products = [
    {
      id: 1,
      name: "Premium Whey Protein",
      price: 49.99,
      description: "High-quality whey protein for muscle growth and recovery",
      image: "/protien.jpeg",
      category: "Supplements",
      rating: 4.5,
      reviews: 123,
    },
    {
      id: 2,
      name: "Premium Resistance Bands",
      price: 29.99,
      description:
        "Professional-grade set of 5 resistance bands for strength training",
      image: "/protien.jpeg",
      category: "Equipment",
      rating: 4.8,
      reviews: 87,
    },
    {
      id: 3,
      name: "Performance Running Shoes",
      price: 129.99,
      description:
        "Lightweight and breathable running shoes for optimal performance",
      image: "/protien.jpeg",
      category: "Footwear",
      rating: 4.7,
      reviews: 56,
    },
    {
      id: 4,
      name: "Premium Yoga Mat",
      price: 39.99,
      description:
        "Professional-grade yoga mat with excellent grip and durability",
      image: "/protien.jpeg",
      category: "Equipment",
      rating: 4.9,
      reviews: 92,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fitness Shop</h1>
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm text-gray-600">
              Find your perfect fitness gear
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <div className="relative h-64">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-purple-100 rounded-full p-1">
                  <span className="text-purple-600 font-semibold">
                    {product.rating}⭐
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.reviews} reviews
                  </span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
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
