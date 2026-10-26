import React, { useEffect,useState,useRef } from 'react'
import { FaFilter } from 'react-icons/fa';
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../redux/slices/productSlice';

const CollectionPage = () => {
  const {collection} = useParams();
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state)=> state.products);
  const searchParamsKey = searchParams.toString();
  const activeGender = new URLSearchParams(searchParamsKey).get('gender');
  const collectionTitle = activeGender
    ? `${activeGender} Collection`
    : 'All Collection';

  const sidebarRef= useRef(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  useEffect(()=>{
    const queryParams = Object.fromEntries(new URLSearchParams(searchParamsKey));
    dispatch(fetchProductsByFilters({collection,...queryParams}));
  },[dispatch, collection, searchParamsKey]);

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
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='luxury-eyebrow mb-2 text-gray-500'>The MegaKart edit</p>
            <h1 className='text-4xl uppercase sm:text-5xl'>{collectionTitle}</h1>
          </div>
          <SortOptions/>
        </div>

        {/* Product Grid  */}
        <ProductGrid products={products} loading={loading} error={error}/>
      </div>
    </div>
    </section>
  )
}

export default CollectionPage