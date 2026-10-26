import React from 'react'
import { useSearchParams } from 'react-router-dom';

const SortOptions = () => {
  const [searchParams, setSearchParams] = useSearchParams()


  const handelSortChange = (e) => {
    const sortBy = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (sortBy) {
      nextParams.set('sortBy', sortBy);
    } else {
      nextParams.delete('sortBy');
    }
    setSearchParams(nextParams);
  };


  return (
    <label htmlFor="sort" className='flex items-center gap-2 rounded-md border border-[#EAE6DF] bg-white px-3 py-2'>
      <span className='text-[10px] font-medium uppercase tracking-[0.1em] text-[#77746D]'>Sort:</span>
      <select
        id="sort"
        aria-label="Sort products"
        className='max-w-[190px] cursor-pointer bg-transparent text-xs font-medium text-[#171714] outline-none'
        onChange={handelSortChange}
        value={searchParams.get('sortBy') || ''}>
        <option value="">Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </label>
  )
}

export default SortOptions