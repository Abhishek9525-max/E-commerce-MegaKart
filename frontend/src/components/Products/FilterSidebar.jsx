import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios';

const FilterSidebar = ({ collection }) => {

  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryCounts, setCategoryCounts] = useState(null);
  const [categoryCountsError, setCategoryCountsError] = useState(false);
  const searchParamsKey = searchParams.toString();
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    color: '',
    size: [],
    material: [],
    brand: [],
    minPrice: '',
    maxPrice: '',
  })

  const [priceRange, setPriceRange] = useState([0, 100])
  const categories = [
    { value: 'Top Wear', label: 'Shirts & Tops' },
    { value: 'Bottom Wear', label: 'Trousers & Jeans' },
  ];
  const colors = [
    { name: 'Red', shade: '#DC2626' },
    { name: 'Blue', shade: '#0753B8' },
    { name: 'Black', shade: '#171714' },
    { name: 'Yellow', shade: '#E8B62D' },
    { name: 'Gray', shade: '#707783' },
    { name: 'Pink', shade: '#F1C1C8' },
    { name: 'Beige', shade: '#E8E1D3' },
    { name: 'Navy', shade: '#203A5D' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const materials = [
    'Cotton',
    'Wool',
    'Denim',
    'Polyester',
    'Silk',
    'Linen',
    'Viscose',
    'Fleece',
  ];
  const brands = [
    'Urban Threads',
    'MorderFit',
    'Street Style',
    'Beach Breeze',
    'Fashionista',
    'ChicStyle',
  ];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    setFilters({
      category: params.category || '',
      gender: params.gender || '',
      color: params.color || '',
      size: params.size ? params.size.split(',') : [],
      material: params.material ? params.material.split(',') : [],
      brand: params.brand ? params.brand.split(',') : [],
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
    });
    setPriceRange([
      Number(params.minPrice) || 0,
      Number(params.maxPrice) || 100,
    ]);
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(searchParamsKey);
    params.delete('category');
    params.delete('sortBy');
    if (collection) params.set('collection', collection);

    const fetchCategoryCounts = async () => {
      setCategoryCounts(null);
      setCategoryCountsError(false);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/category-counts?${params}`,
          { signal: controller.signal }
        );
        setCategoryCounts(response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Failed to fetch category counts:', error);
          setCategoryCountsError(true);
        }
      }
    };

    fetchCategoryCounts();
    return () => controller.abort();
  }, [collection, searchParamsKey]);


  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    // console.log({ name, value, checked, type })
    let newFilters = {...filters };

    if (type === 'checkbox') {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || [] ), value];
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
      }
    }else{
      newFilters[name] = value;
    }
    setFilters(newFilters);
    // console.log(newFilters)
    updateURLParams(newFilters);
  };

const updateURLParams=(newFilters)=>{
  const params = new URLSearchParams();
  //{category: 'Top Wear',size:['XS','S']}
  Object.keys(newFilters).forEach((key)=>{
    if(Array.isArray(newFilters[key])&& newFilters[key].length >0){
      params.append(key,newFilters[key].join(','));
    }else if(newFilters[key]){
      params.append(key,newFilters[key]);
    }
  });
  setSearchParams(params);
};

const handleColorSelect = (color) => {
  const newFilters = {
    ...filters,
    color: filters.color === color ? '' : color,
  };
  setFilters(newFilters);
  updateURLParams(newFilters);
};
  
const handlePriceChange = (bound, event) => {
  const nextValue = Number(event.target.value);
  const nextRange = [...priceRange];

  if (bound === 'min') {
    nextRange[0] = Math.min(nextValue, nextRange[1] - 1);
  } else {
    nextRange[1] = Math.max(nextValue, nextRange[0] + 1);
  }

  setPriceRange(nextRange);
  const newFilters = {
    ...filters,
    minPrice: nextRange[0] > 0 ? String(nextRange[0]) : '',
    maxPrice: nextRange[1] < 100 ? String(nextRange[1]) : '',
  };
  setFilters(newFilters);
  updateURLParams(newFilters);
};

const clearAllFilters = () => {
  const params = new URLSearchParams();
  const gender = searchParams.get('gender');
  if (gender) params.set('gender', gender);

  setSearchParams(params);
  setFilters({
    category: '',
    gender: gender || '',
    color: '',
    size: [],
    material: [],
    brand: [],
    minPrice: '',
    maxPrice: '',
  });
  setPriceRange([0, 100]);
};

const activeFilterCount = (() => {
  const params = new URLSearchParams(searchParamsKey);
  return (
    Number(params.has('category')) +
    Number(params.has('color')) +
    (params.get('size')?.split(',').filter(Boolean).length || 0) +
    (params.get('material')?.split(',').filter(Boolean).length || 0) +
    (params.get('brand')?.split(',').filter(Boolean).length || 0) +
    Number(params.has('minPrice') || params.has('maxPrice'))
  );
})();

return (
    <div className='p-4'>
      <div className='mb-5 flex items-center justify-between border-b border-[#EAE6DF] pb-4'>
        <div className='flex items-center gap-2.5'>
          <h3 className='font-display text-2xl text-[#171714]'>Filters</h3>
          {activeFilterCount > 0 && (
            <span className='rounded-full bg-[#414B36] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white'>
              {activeFilterCount} active
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type='button'
            onClick={clearAllFilters}
            className='text-xs text-[#77746D] underline underline-offset-4 transition-colors hover:text-[#171714]'
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category Filter  */}
      <div className='mb-5 border-b border-[#EAE6DF] pb-5'>
        <div className='mb-3 flex items-center justify-between'>
          <label className='text-sm font-medium uppercase tracking-[0.08em] text-[#171714]'>Category</label>
          {categoryCounts ? (
            <span className='text-sm text-[#77746D]'>
              All {categoryCounts.total} items
            </span>
          ) : categoryCountsError ? (
            <span className='text-xs text-[#A94F38]'>Counts unavailable</span>
          ) : null}
        </div>
        {categories.map(({ value, label }) => (
          <label
            key={value}
            className={`mb-2 flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2 transition-colors ${
              filters.category === value
                ? 'border-[#414B36] bg-[#F8F8F5]'
                : 'border-[#D8D2C8] bg-white hover:border-[#A7A197]'
            }`}
          >
            <input
              type="radio"
              name='category'
              value={value}
              onChange={handleFilterChange}
              checked={filters.category === value}
              className='h-5 w-5 shrink-0 accent-[#414B36]'
            />
            <span className='flex-1 text-base text-[#171714]'>{label}</span>
            <span className={`text-sm ${filters.category === value ? 'font-medium text-[#414B36]' : 'text-[#77746D]'}`}>
              {categoryCounts?.categories?.[value] ?? (categoryCounts ? 0 : '')}
            </span>
          </label>
        ))}
      </div>

      {/* Color Filter  */}
      <div className='mb-5 border-b border-[#EAE6DF] pb-5'>
        <div className='mb-3 flex items-center justify-between'>
          <h4 className='text-sm font-medium uppercase tracking-[0.08em] text-[#171714]'>Atelier Palette</h4>
          <span className='text-sm text-[#77746D]'>{colors.length} shades</span>
        </div>
        <div className='grid grid-cols-4 gap-x-2 gap-y-3'>
          {colors.map(({ name, shade }) => (
            <button
              key={name}
              type='button'
              onClick={() => handleColorSelect(name)}
              aria-label={`Filter by ${name}`}
              aria-pressed={filters.color === name}
              className='group flex flex-col items-center gap-1.5'
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white p-[3px] transition ${
                filters.color === name
                  ? 'border-[#414B36] ring-1 ring-[#414B36] ring-offset-1'
                  : 'border-[#D8D2C8] group-hover:border-[#77746D]'
              }`}>
                <span
                  className='h-full w-full rounded-full border border-black/10'
                  style={{ backgroundColor: shade }}
                />
              </span>
              <span className={`text-xs ${
                filters.color === name
                  ? 'font-medium text-[#171714]'
                  : 'text-[#77746D]'
              }`}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter  */}
      <div className='mb-5 border-b border-[#EAE6DF] pb-5'>
        <label className='mb-3 block text-sm font-medium uppercase tracking-[0.08em] text-[#171714]'>Size Range</label>
        <div className='grid w-full grid-cols-3 gap-2'>
          {sizes.map((size) => {
            const isSelected = filters.size.includes(size);
            return (
              <label
                key={size}
                className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-md border text-sm transition-colors ${
                  isSelected
                    ? 'border-[#414B36] bg-[#414B36] font-semibold text-white'
                    : 'border-[#D8D2C8] bg-white text-[#171714] hover:border-[#414B36]'
                }`}
              >
                <input
                  type="checkbox"
                  name="size"
                  value={size}
                  checked={isSelected}
                  onChange={handleFilterChange}
                  className='sr-only'
                />
                {size}
              </label>
            );
          })}
        </div>
      </div>

      {/* Material Filter  */}
      <div className='mb-5 border-b border-[#EAE6DF] pb-5'>
        <h4 className='mb-3 text-sm font-medium uppercase tracking-[0.08em] text-[#171714]'>
          Material
        </h4>
        <div className='space-y-2'>
          {materials.map((material) => (
            <label
              key={material}
              className='group flex cursor-pointer items-center gap-3 text-sm text-[#5C5A54] transition-colors hover:text-[#171714]'
            >
              <input
                type="checkbox"
                name="material"
                value={material}
                checked={filters.material.includes(material)}
                onChange={handleFilterChange}
                className='h-[17px] w-[17px] shrink-0 cursor-pointer accent-[#414B36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#414B36]'
              />
              <span className='leading-5'>{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter  */}
      <div className='mb-5 border-b border-[#EAE6DF] pb-5'>
        <h4 className='mb-3 text-sm font-medium uppercase tracking-[0.08em] text-[#171714]'>
          Brand
        </h4>
        <div className='space-y-2'>
          {brands.map((brand) => (
            <label
              key={brand}
              className='group flex cursor-pointer items-center gap-3 text-sm text-[#5C5A54] transition-colors hover:text-[#171714]'
            >
              <input
                type="checkbox"
                name="brand"
                value={brand}
                checked={filters.brand.includes(brand)}
                onChange={handleFilterChange}
                className='h-[17px] w-[17px] shrink-0 cursor-pointer accent-[#414B36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#414B36]'
              />
              <span className='leading-5'>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter  */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <h4 className='text-sm font-medium uppercase tracking-[0.08em] text-[#171714]'>
            Price Range
          </h4>
          <span className='text-xs font-medium tabular-nums text-[#414B36]'>
            ${priceRange[0]} — ${priceRange[1]}
          </span>
        </div>
        <label className='mb-3 block text-xs text-[#77746D]' htmlFor='minimum-price'>
          Minimum price <span className='float-right font-medium text-[#171714]'>${priceRange[0]}</span>
        </label>
        <input
          id='minimum-price'
          type='range'
          min={0}
          max={99}
          value={priceRange[0]}
          onChange={(event) => handlePriceChange('min', event)}
          className='h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D8D2C8] accent-[#414B36]'
        />
        <label className='mb-3 mt-4 block text-xs text-[#77746D]' htmlFor='maximum-price'>
          Maximum price <span className='float-right font-medium text-[#171714]'>${priceRange[1]}</span>
        </label>
        <input
          id='maximum-price'
          type='range'
          min={1}
          max={100}
          value={priceRange[1]}
          onChange={(event) => handlePriceChange('max', event)}
          className='h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D8D2C8] accent-[#414B36]'
        />
      </div>

    </div>
  )
}

export default FilterSidebar