import React, { useEffect,useState,useRef } from 'react'
import axios from 'axios';
import { FaFilter } from 'react-icons/fa';
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../redux/slices/productSlice';

const CollectionPage = () => {
  const {collection} = useParams();
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state)=> state.products);
  const searchParamsKey = searchParams.toString();
  const activeGender = new URLSearchParams(searchParamsKey).get('gender');
  const collectionTitle = activeGender
    ? `${activeGender} Collection`
    : 'All Collection';
  const [totalProducts, setTotalProducts] = useState(null);
  const [totalProductsError, setTotalProductsError] = useState(false);

  const sidebarRef= useRef(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  useEffect(()=>{
    const queryParams = Object.fromEntries(new URLSearchParams(searchParamsKey));
    dispatch(fetchProductsByFilters({collection,...queryParams}));
  },[dispatch, collection, searchParamsKey]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (collection) params.set('collection', collection);
    if (activeGender) params.set('gender', activeGender);

    const fetchTotalProducts = async () => {
      setTotalProducts(null);
      setTotalProductsError(false);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/category-counts?${params}`,
          { signal: controller.signal }
        );
        setTotalProducts(response.data.total);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Failed to fetch collection product total:', error);
          setTotalProductsError(true);
        }
      }
    };

    fetchTotalProducts();
    return () => controller.abort();
  }, [collection, activeGender]);

  const activeFilters = (() => {
    const params = new URLSearchParams(searchParamsKey);
    const filters = [];
    const categoryLabels = {
      'Top Wear': 'Top Wear',
      'Bottom Wear': 'Bottom Wear',
    };
    const addFilter = (key, label, value) => {
      if (value) filters.push({ key, label, value });
    };

    addFilter('category', 'Category', categoryLabels[params.get('category')] || params.get('category'));
    addFilter('gender', 'Gender', params.get('gender'));
    addFilter('material', 'Fabric', params.get('material')?.split(',').join(', '));
    addFilter('color', 'Color', params.get('color')?.split(',').join(', '));
    addFilter('size', 'Size', params.get('size')?.split(',').join(', '));
    if (params.has('minPrice') || params.has('maxPrice')) {
      const minPrice = params.get('minPrice') || '0';
      const maxPrice = params.get('maxPrice') || '100';
      addFilter('price', 'Price', `$${minPrice} – $${maxPrice}`);
    }
    addFilter('search', 'Search', params.get('search'));
    return filters;
  })();

  const removeFilter = (key) => {
    const nextParams = new URLSearchParams(searchParams);
    if (key === 'price') {
      nextParams.delete('minPrice');
      nextParams.delete('maxPrice');
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams();
    if (activeGender) nextParams.set('gender', activeGender);
    setSearchParams(nextParams);
  };

  const toggleSidebar =()=>{
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCliclOutside=(e)=>{
    //close sidebar if clicked outside
    if(sidebarRef.current && !sidebarRef.current.contains(e.target)){
      setIsSidebarOpen(false);
    }
  }
  useEffect(()=>{
    //add event listner for clicks
    document.addEventListener('mousedown', handleCliclOutside)
    //clean event listner
    return ()=>{
      document.removeEventListener('mousedown',handleCliclOutside)
    };
  },[])

  
  return (
    <section className='min-h-screen bg-[#F5F2ED]'>
    <div className='flex flex-col lg:flex-row'>
      {/* Mobile Filter Button  */}
      <button 
      onClick={toggleSidebar}
      className='flex items-center justify-center border-b border-gray-200 bg-[#F0EDE7] p-3 text-xs font-semibold uppercase tracking-widest lg:hidden'>
        <FaFilter className='mr-2 '/>
      </button>

      {/* Filter Sidebar  */}
      <div ref={sidebarRef}
      className={`${isSidebarOpen  ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 z-50 left-0 w-64 border-r border-gray-200 bg-[#F5F2ED] overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}>
        <FilterSidebar collection={collection} />
      </div>
      <div className='flex-grow p-4 sm:p-8'>
        <div className='mb-6'>
          <div>
            <p className='luxury-eyebrow mb-2 text-gray-500'>The MegaKart edit</p>
            <h1 className='text-4xl uppercase sm:text-5xl'>{collectionTitle}</h1>
          </div>
        </div>

        <div className='mb-6 flex flex-col gap-4 border-y border-[#EAE6DF] py-4 xl:flex-row xl:items-center xl:justify-between'>
          <div className='flex min-w-0 flex-wrap items-center gap-2'>
            <span className='mr-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#77746D]'>
              Applied:
            </span>
            {activeFilters.length > 0 ? (
              <>
                {activeFilters.map(({ key, label, value }) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => removeFilter(key)}
                    aria-label={`Remove ${label} filter`}
                    className='inline-flex items-center gap-2 rounded border border-[#EAE6DF] bg-white px-2.5 py-1.5 text-xs text-[#33342E] transition-colors hover:border-[#A7A197]'
                  >
                    <span>{label}: <strong className='font-medium text-[#171714]'>{value}</strong></span>
                    <span aria-hidden='true' className='text-[#77746D]'>×</span>
                  </button>
                ))}
                <button
                  type='button'
                  onClick={resetFilters}
                  className='px-1 text-xs font-medium text-[#A94F38] transition-colors hover:text-[#803A2A]'
                >
                  Reset All
                </button>
              </>
            ) : (
              <span className='text-xs text-[#77746D]'>No filters applied</span>
            )}
          </div>
          <div className='flex flex-wrap items-center justify-between gap-x-5 gap-y-3 xl:justify-end'>
            <p className='text-xs text-[#77746D]' aria-live='polite'>
              {loading
                ? 'Updating products...'
                : totalProductsError
                  ? `${products.length} items · total unavailable`
                  : totalProducts === null
                    ? `${products.length} items`
                    : `Showing ${products.length} of ${totalProducts} items`}
            </p>
            <SortOptions/>
          </div>
        </div>

        {/* Product Grid  */}
        <ProductGrid products={products} loading={loading} error={error}/>
      </div>
    </div>
    </section>
  )
}

export default CollectionPage