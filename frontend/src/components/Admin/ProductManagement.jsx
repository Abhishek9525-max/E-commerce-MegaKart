import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteProduct, fetchAdminProducts } from "../../redux/slices/adminProductSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state)=> state.adminProducts)
  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.sku, product.category]
        .some((value) => value?.toLocaleLowerCase().includes(query))
    );
  }, [products, searchTerm]);

  useEffect(()=>{
    dispatch(fetchAdminProducts())
  },[dispatch])

  const handleDelete = async () => {
    if (!productToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await dispatch(deleteProduct(productToDelete._id)).unwrap();
      setProductToDelete(null);
    } catch (requestError) {
      setDeleteError(
        typeof requestError === "string"
          ? requestError
          : "Unable to delete product. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if(loading) return <p className="p-8 text-sm text-[#77766e]">Loading products…</p>
  if(error) return <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load products: {error}</p>



  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Catalog</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Inventory &amp; Products</h1>
          <p className="mt-2 text-sm text-[#77766e]">Manage the pieces available in your storefront.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-[#e7e4dc] bg-white px-4 py-2.5 text-xs font-medium text-[#686961]">
            {filteredProducts.length === products.length
              ? `${products.length} ${products.length === 1 ? "product" : "products"}`
              : `${filteredProducts.length} of ${products.length} products`}
          </span>
          <Link
            to="/admin/products/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#414b36] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#30392a]"
          >
            <FiPlus aria-hidden="true" />
            Add product
          </Link>
        </div>
      </header>
      <div className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
        <div className="border-b border-[#eeece6] p-4 sm:px-6">
          <label htmlFor="admin-product-search" className="sr-only">
            Search products by name, SKU, or category
          </label>
          <div className="flex max-w-lg items-center gap-3 border border-[#dedbd3] bg-[#fcfbf9] px-3.5 py-2.5 transition focus-within:border-[#68725b] focus-within:ring-2 focus-within:ring-[#414b36]/10">
            <FiSearch className="shrink-0 text-[#85847c]" aria-hidden="true" />
            <input
              id="admin-product-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by product name, SKU, or category"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#292b25] outline-none placeholder:text-[#a19f96]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear product search"
                className="text-[#85847c] transition-colors hover:text-[#41443b]"
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-[#85847c]">
            <tr>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Product</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Price</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">SKU</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeece6] text-sm">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="transition-colors hover:bg-[#fcfbf9]"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-[#292b25] sm:px-6">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          className="h-12 w-12 shrink-0 border border-[#e7e4dc] bg-[#f5f2ed] object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-12 w-12 shrink-0 border border-[#e7e4dc] bg-[#f5f2ed]"
                        />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[#55564f] sm:px-6">
                    {Number(product.discountPrice) > 0 &&
                    Number(product.discountPrice) < Number(product.price) ? (
                      <span className="inline-flex items-baseline gap-2">
                        <span className="font-medium text-[#a94f38]">${Number(product.discountPrice).toFixed(2)}</span>
                        <span className="text-xs text-[#99958c] line-through">${Number(product.price).toFixed(2)}</span>
                      </span>
                    ) : (
                      `$${Number(product.price).toFixed(2)}`
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[#77766e] sm:px-6">{product.sku || "—"}</td>
                  <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="mr-3 text-xs font-semibold text-[#59634c] hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteError("");
                        setProductToDelete(product);
                      }}
                      className="text-xs font-semibold text-[#a94f38] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#85847c]">
                  {searchTerm.trim()
                    ? `No products match "${searchTerm.trim()}".`
                    : "No products found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      {productToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#171714]/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setProductToDelete(null);
              setDeleteError("");
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            aria-describedby="delete-product-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border border-[#e7e4dc] bg-white p-5 shadow-[0_24px_70px_rgba(23,23,20,0.2)] sm:p-6"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a94f38]">
              Confirm deletion
            </p>
            <h2 id="delete-product-title" className="text-xl font-medium text-[#292b25]">
              Delete this product?
            </h2>
            <p id="delete-product-description" className="mt-2 text-sm leading-6 text-[#77766e]">
              “{productToDelete.name}” will be permanently removed from your catalog.
            </p>
            {deleteError && (
              <p role="alert" className="mt-4 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="min-h-11 border border-[#dedbd3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#55564f] transition-colors hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-11 bg-[#a94f38] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#873c2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete product"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
