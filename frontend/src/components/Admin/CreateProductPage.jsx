import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/slices/adminProductSlice";

const initialForm = {
  name: "",
  description: "",
  price: "",
  countInStock: "0",
  sku: "",
  category: "",
  brand: "",
  sizes: "",
  colors: "",
  collections: "",
  material: "",
  gender: "",
  images: [],
};

const inputClass =
  "w-full border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none transition focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10";

const CreateProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSaving = useSelector((state) => state.adminProducts.createLoading);
  const [formData, setFormData] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [collectionOptionsError, setCollectionOptionsError] = useState("");

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
    setFormData((current) => {
      return {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    setSubmitError("");
  };

  const generateSku = () => {
    const bytes = new Uint8Array(6);
    globalThis.crypto.getRandomValues(bytes);
    const sku = `MK-${Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    )
      .join("")
      .toUpperCase()}`;
    setFormData((current) => ({ ...current, sku }));
    setSubmitError("");
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setUploadError("");

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
        uploadedImages.push({
          url: data.imageUrl,
          altText: "",
        });
      }

      setFormData((current) => ({
        ...current,
        images: [...current.images, ...uploadedImages],
      }));
      event.target.value = "";
    } catch (error) {
      setUploadError(
        error.response?.data?.message ?? error.message ?? "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageIndex) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, index) => index !== imageIndex),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (uploading) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      countInStock: Number(formData.countInStock),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      sizes: formData.sizes.split(",").map((size) => size.trim()).filter(Boolean),
      colors: formData.colors.split(",").map((color) => color.trim()).filter(Boolean),
      collections: formData.collections.trim(),
      isPublished: true,
      images: formData.images,
    };

    if (formData.brand.trim()) productData.brand = formData.brand.trim();
    if (formData.material.trim()) productData.material = formData.material.trim();
    if (formData.gender) productData.gender = formData.gender;

    try {
      await dispatch(createProduct(productData)).unwrap();
      navigate("/admin/products");
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "Unable to create product. Please try again."
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">
            Catalog
          </p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">
            Add product
          </h1>
          <p className="mt-2 text-sm text-[#77766e]">
            Add a new piece to your product catalog.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="self-start text-xs font-semibold uppercase tracking-[0.08em] text-[#59634c] hover:underline sm:self-auto"
        >
          Back to inventory
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 border border-[#e7e4dc] bg-white p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-8"
      >
        {submitError && (
          <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {submitError}
          </p>
        )}

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="product-name" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Product name
            </label>
            <input id="product-name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required maxLength={120} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="product-description" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Description
            </label>
            <textarea id="product-description" name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={4} required />
          </div>
          <div>
            <label htmlFor="product-price" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Price
            </label>
            <input id="product-price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="product-stock" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Stock remaining
            </label>
            <input id="product-stock" name="countInStock" type="number" min="0" step="1" value={formData.countInStock} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="product-sku" className="mb-2 block text-xs font-semibold text-[#55564f]">
              SKU
            </label>
            <div className="flex gap-2">
              <input id="product-sku" name="sku" value={formData.sku} onChange={handleChange} className={inputClass} required maxLength={64} />
              <button
                type="button"
                onClick={generateSku}
                aria-label="Generate SKU"
                title="Generate SKU"
                className="inline-flex shrink-0 items-center gap-2 border border-[#dedbd3] bg-white px-3 text-xs font-semibold text-[#59634c] transition-colors hover:border-[#68725b] hover:bg-[#faf9f6]"
              >
                <FiRefreshCw aria-hidden="true" />
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="product-category" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Category
            </label>
            <select id="product-category" name="category" value={formData.category} onChange={handleChange} className={inputClass} required>
              <option value="">Select a category</option>
              <option value="Top Wear">Shirts &amp; Tops</option>
              <option value="Bottom Wear">Trousers &amp; Jeans</option>
            </select>
          </div>
          <div>
            <label htmlFor="product-collection" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Collection
            </label>
            <input id="product-collection" list="available-product-collections" name="collections" value={formData.collections} onChange={handleChange} className={inputClass} placeholder="Choose or enter a collection" required />
            <datalist id="available-product-collections">
              {collectionOptions.map((collection) => (
                <option key={collection} value={collection} />
              ))}
            </datalist>
            {collectionOptionsError && (
              <p role="status" className="mt-1 text-xs text-[#A94F38]">{collectionOptionsError}</p>
            )}
          </div>
          <div>
            <label htmlFor="product-brand" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Brand <span className="font-normal text-[#85847c]">(optional)</span>
            </label>
            <input id="product-brand" name="brand" value={formData.brand} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="product-material" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Material <span className="font-normal text-[#85847c]">(optional)</span>
            </label>
            <input id="product-material" name="material" value={formData.material} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="product-gender" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Gender <span className="font-normal text-[#85847c]">(optional)</span>
            </label>
            <select id="product-gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
              <option value="">Not specified</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label htmlFor="product-sizes" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Sizes <span className="font-normal text-[#85847c]">(comma-separated)</span>
            </label>
            <input id="product-sizes" name="sizes" value={formData.sizes} onChange={handleChange} className={inputClass} placeholder="S, M, L" />
          </div>
          <div>
            <label htmlFor="product-colors" className="mb-2 block text-xs font-semibold text-[#55564f]">
              Colors <span className="font-normal text-[#85847c]">(comma-separated)</span>
            </label>
            <input id="product-colors" name="colors" value={formData.colors} onChange={handleChange} className={inputClass} placeholder="Black, Ivory" />
          </div>
        </section>

        <section className="border-t border-[#eeece6] pt-6">
          <h2 className="mb-4 text-base font-medium text-[#292b25]">Product image</h2>
          <label htmlFor="product-image-file" className="mb-2 block text-xs font-semibold text-[#55564f]">
            Upload images <span className="font-normal text-[#85847c]">(optional)</span>
          </label>
          <input
            id="product-image-file"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="block w-full text-sm text-[#686961] file:mr-4 file:border-0 file:bg-[#414b36] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white hover:file:bg-[#30392a] disabled:opacity-60"
          />
          <p className="mt-2 text-[11px] text-[#85847c]">
            Select one or more images, then add a description to each image.
          </p>
          {uploading && <p role="status" className="mt-4 text-xs text-[#59634c]">Uploading image…</p>}
          {uploadError && <p role="alert" className="mt-4 text-xs text-rose-700">{uploadError}</p>}
          {formData.images.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-4">
              {formData.images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="relative w-36">
                  <img src={image.url} alt={image.altText} className="h-28 w-full border border-[#e7e4dc] object-cover" />
                  <label htmlFor={`product-image-alt-${index}`} className="mb-1 mt-2 block text-[10px] font-semibold text-[#55564f]">
                    Image {index + 1} description
                  </label>
                  <input
                    id={`product-image-alt-${index}`}
                    value={image.altText}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        images: current.images.map((currentImage, imageIndex) =>
                          imageIndex === index
                            ? { ...currentImage, altText: event.target.value }
                            : currentImage
                        ),
                      }))
                    }
                    className={inputClass}
                    placeholder="Describe this image"
                    maxLength={300}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#414b36] text-white"
                  >
                    <FiX aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex justify-end border-t border-[#eeece6] pt-6">
          <button
            type="submit"
            disabled={isSaving || uploading}
            className="min-h-11 bg-[#414b36] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#30392a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving product…" : "Add product"}
          </button>
        </section>
      </form>
    </div>
  );
};

export default CreateProductPage;
