import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiRefreshCw, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchAdminProductById,
  updateProduct,
} from "../../redux/slices/adminProductSlice";
import ProductReviewsPanel from "./ProductReviewsPanel";

const inputClass =
  "w-full border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none transition focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10";

const splitList = (value) =>
  Array.isArray(value) ? value.join(", ") : "";

const EditProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [collectionOptionsError, setCollectionOptionsError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setProductData(null);
    setFormError("");

    dispatch(fetchAdminProductById(id))
      .unwrap()
      .then((product) => {
        if (!active) return;
        setProductData({
          name: product.name ?? "",
          description: product.description ?? "",
          price: product.price ?? 0,
          discountPrice: product.discountPrice ?? "",
          countInStock: product.countInStock ?? 0,
          sku: product.sku ?? "",
          category: product.category ?? "",
          brand: product.brand ?? "",
          sizes: splitList(product.sizes),
          colors: splitList(product.colors),
          collections: product.collections ?? "",
          material: product.material ?? "",
          gender: product.gender ?? "",
          images: product.images ?? [],
          weight: product.weight ?? "",
          length: product.dimensions?.length ?? "",
          width: product.dimensions?.width ?? "",
          height: product.dimensions?.height ?? "",
        });
      })
      .catch((loadError) => {
        if (active) {
          setFormError(
            typeof loadError === "string"
              ? loadError
              : "Unable to load product."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, id]);

  useEffect(() => {
    const fetchCollectionOptions = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/collections`
        );
        setCollectionOptions(data);
      } catch (error) {
        console.error("Failed to load collection options:", error);
        setCollectionOptionsError("Existing collections could not be loaded.");
      }
    };

    fetchCollectionOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProductData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const generateSku = () => {
    const bytes = new Uint8Array(6);
    globalThis.crypto.getRandomValues(bytes);
    const sku = `MK-${Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    )
      .join("")
      .toUpperCase()}`;
    setProductData((current) => ({ ...current, sku }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setFormError("");
    try {
      const uploadedImages = [];
      for (const file of files) {
        const body = new FormData();
        body.append("image", file);
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
          body
        );
        if (!data.imageUrl) {
          throw new Error("Image upload did not return an image URL.");
        }
        uploadedImages.push({ url: data.imageUrl, altText: "" });
      }

      setProductData((current) => ({
        ...current,
        images: [...current.images, ...uploadedImages],
      }));
      event.target.value = "";
    } catch (uploadError) {
      setFormError(
        uploadError.response?.data?.message ??
          uploadError.message ??
          "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!productData || uploading) return;
    setSaving(true);
    setFormError("");

    const updates = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: Number(productData.price),
      discountPrice:
        productData.discountPrice === "" ? null : Number(productData.discountPrice),
      countInStock: Number(productData.countInStock),
      sku: productData.sku.trim(),
      category: productData.category.trim(),
      brand: productData.brand.trim(),
      sizes: productData.sizes.split(",").map((value) => value.trim()).filter(Boolean),
      colors: productData.colors.split(",").map((value) => value.trim()).filter(Boolean),
      collections: productData.collections.trim(),
      material: productData.material.trim(),
      gender: productData.gender || null,
      images: productData.images,
      isPublished: true,
      isFeatured: false,
      weight: productData.weight === "" ? null : Number(productData.weight),
      dimensions: {
        length: productData.length === "" ? null : Number(productData.length),
        width: productData.width === "" ? null : Number(productData.width),
        height: productData.height === "" ? null : Number(productData.height),
      },
    };

    try {
      await dispatch(updateProduct({ id, productData: updates })).unwrap();
      navigate("/admin/products");
    } catch (updateError) {
      setFormError(
        typeof updateError === "string"
          ? updateError
          : "Unable to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (imageIndex) => {
    setProductData((current) => ({
      ...current,
      images: current.images.filter((_, index) => index !== imageIndex),
    }));
  };

  if (loading) {
    return <p className="p-8 text-sm text-[#77766e]">Loading product…</p>;
  }
  if (formError && !productData) {
    return (
      <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Unable to load product: {formError}
      </p>
    );
  }
  if (!productData) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Catalog</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Edit product</h1>
          <p className="mt-2 text-sm text-[#77766e]">Update the details shown in your storefront.</p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.08em] text-[#59634c] transition-colors hover:text-[#30392a] hover:underline sm:self-auto"
        >
          <FiArrowLeft aria-hidden="true" />
          Back to inventory
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 border border-[#e7e4dc] bg-white p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-8"
      >
        {formError && (
          <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {formError}
          </p>
        )}

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="edit-product-name" className="mb-2 block text-xs font-semibold text-[#55564f]">Product name</label>
            <input id="edit-product-name" name="name" value={productData.name} onChange={handleChange} className={inputClass} required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="edit-product-description" className="mb-2 block text-xs font-semibold text-[#55564f]">Description</label>
            <textarea id="edit-product-description" name="description" value={productData.description} onChange={handleChange} className={inputClass} rows={4} required />
          </div>
          <div>
            <label htmlFor="edit-product-price" className="mb-2 block text-xs font-semibold text-[#55564f]">Price</label>
            <input id="edit-product-price" name="price" type="number" min="0" step="0.01" value={productData.price} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="edit-product-discount" className="mb-2 block text-xs font-semibold text-[#55564f]">Discount price <span className="font-normal text-[#85847c]">(optional)</span></label>
            <input id="edit-product-discount" name="discountPrice" type="number" min="0" step="0.01" value={productData.discountPrice} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-product-stock" className="mb-2 block text-xs font-semibold text-[#55564f]">Stock remaining</label>
            <input id="edit-product-stock" name="countInStock" type="number" min="0" step="1" value={productData.countInStock} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="edit-product-sku" className="mb-2 block text-xs font-semibold text-[#55564f]">SKU</label>
            <div className="flex gap-2">
              <input id="edit-product-sku" name="sku" value={productData.sku} onChange={handleChange} className={inputClass} required />
              <button type="button" onClick={generateSku} aria-label="Generate SKU" title="Generate SKU" className="inline-flex shrink-0 items-center gap-2 border border-[#dedbd3] bg-white px-3 text-xs font-semibold text-[#59634c] transition-colors hover:border-[#68725b] hover:bg-[#faf9f6]">
                <FiRefreshCw aria-hidden="true" />
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="edit-product-category" className="mb-2 block text-xs font-semibold text-[#55564f]">Category</label>
            <select id="edit-product-category" name="category" value={productData.category} onChange={handleChange} className={inputClass} required>
              <option value="">Select a category</option>
              {productData.category && !["Top Wear", "Bottom Wear"].includes(productData.category) && (
                <option value={productData.category}>{productData.category}</option>
              )}
              <option value="Top Wear">Shirts &amp; Tops</option>
              <option value="Bottom Wear">Trousers &amp; Jeans</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-product-collection" className="mb-2 block text-xs font-semibold text-[#55564f]">Collection</label>
            <input id="edit-product-collection" list="available-edit-product-collections" name="collections" value={productData.collections} onChange={handleChange} className={inputClass} placeholder="Choose or enter a collection" required />
            <datalist id="available-edit-product-collections">
              {collectionOptions.map((collection) => (
                <option key={collection} value={collection} />
              ))}
            </datalist>
            {collectionOptionsError && (
              <p role="status" className="mt-1 text-xs text-[#A94F38]">{collectionOptionsError}</p>
            )}
          </div>
          <div>
            <label htmlFor="edit-product-brand" className="mb-2 block text-xs font-semibold text-[#55564f]">Brand</label>
            <input id="edit-product-brand" name="brand" value={productData.brand} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-product-material" className="mb-2 block text-xs font-semibold text-[#55564f]">Material</label>
            <input id="edit-product-material" name="material" value={productData.material} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-product-gender" className="mb-2 block text-xs font-semibold text-[#55564f]">Gender</label>
            <select id="edit-product-gender" name="gender" value={productData.gender} onChange={handleChange} className={inputClass}>
              <option value="">Not specified</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-product-sizes" className="mb-2 block text-xs font-semibold text-[#55564f]">Sizes <span className="font-normal text-[#85847c]">(comma-separated)</span></label>
            <input id="edit-product-sizes" name="sizes" value={productData.sizes} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-product-colors" className="mb-2 block text-xs font-semibold text-[#55564f]">Colors <span className="font-normal text-[#85847c]">(comma-separated)</span></label>
            <input id="edit-product-colors" name="colors" value={productData.colors} onChange={handleChange} className={inputClass} />
          </div>
        </section>

        <section className="border-t border-[#eeece6] pt-6">
          <h2 className="mb-4 text-base font-medium text-[#292b25]">Product images</h2>
          <label htmlFor="edit-product-images" className="mb-2 block text-xs font-semibold text-[#55564f]">Upload images</label>
          <input id="edit-product-images" type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="block w-full text-sm text-[#686961] file:mr-4 file:border-0 file:bg-[#414b36] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white hover:file:bg-[#30392a] disabled:opacity-60" />
          {uploading && <p role="status" className="mt-2 text-xs text-[#59634c]">Uploading image…</p>}
          {productData.images.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {productData.images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="relative">
                  <img src={image.url} alt={image.altText ?? ""} className="h-20 w-20 border border-[#e7e4dc] object-cover" />
                  <label htmlFor={`edit-image-alt-${index}`} className="sr-only">
                    Image description {index + 1}
                  </label>
                  <input
                    id={`edit-image-alt-${index}`}
                    value={image.altText ?? ""}
                    onChange={(event) =>
                      setProductData((current) => ({
                        ...current,
                        images: current.images.map((currentImage, imageIndex) =>
                          imageIndex === index
                            ? { ...currentImage, altText: event.target.value }
                            : currentImage
                        ),
                      }))
                    }
                    placeholder="Image description"
                    className="mt-2 w-32 border border-[#dedbd3] px-2 py-1 text-[10px] outline-none focus:border-[#68725b]"
                  />
                  <button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#414b36] text-white">
                    <FiX aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex justify-end border-t border-[#eeece6] pt-6">
          <button type="submit" disabled={saving || uploading} className="min-h-11 bg-[#414b36] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#30392a] disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving changes…" : "Save changes"}
          </button>
        </section>
      </form>
      <ProductReviewsPanel productId={id} />
    </div>
  );
};

export default EditProductPage;
