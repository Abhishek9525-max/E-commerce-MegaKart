import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductGrid from "../components/Products/ProductGrid";

const NewArrivalsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );
        setProducts(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <section className="container mx-auto min-h-screen px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold uppercase">New Arrivals</h1>
      {!loading && !error && products.length === 0 ? (
        <p className="text-gray-600">No new arrivals are available right now.</p>
      ) : (
        <ProductGrid products={products} loading={loading} error={error} />
      )}
    </section>
  );
};

export default NewArrivalsPage;
