import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const FilterSidebar = () => {

  const [searchParams, setsearchParams] = useSearchParams();
  //x.com/?a=1&b=2
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    color: '',
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 100,
  })

  const [priceRange, setPriceRange] = useState([0, 100])
  const categories = ['Top Wear', 'Bottom Wear'];
  const colors = [
    'Red',
    'Blue',
    'Black',
    'Green',
    'Yellow',
    'Gray',
    'White',
    'Pink',
    'Beige',
    'Navy',
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
  const genders = ['Men', 'Women'];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    setFilters({
      category: params.category || '',
      gender: params.gender || '',
      color: params.color || '',
      size: params.size ? params.size.split(',') : [],
      material: params.material ? params.material.split(',') : [],
      brand: params.brand ? params.brand.split(',') : [],
      minPrice: params.minPrice || 0,
      maxPrice: params.maxPrice || 100,
    });
    setPriceRange([0, params.maxPrice || 100]);
  }, [searchParams]);

  return (
    <div className='p-4'>
      <h3 className='text-xl font-medium text-gray-800 mb-4 '>Filter</h3>

      {/* Category Filter  */}
      <div className='mb-6'>
        <label className='block text-gray-600 font-medium mb-2'>Category </label>
        {categories.map((category) => (
          <div
            key={category}
            className='flex items-center mb-1'
          >
            <input
              type="radio"
              name='category'
              className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 '
            />
            <span className='text-gray-700'>{category}</span>

          </div>
        ))};
      </div>

      {/* Gender Filter  */}
      <div className='mb-6'>
        <label className='block text-gray-600 font-medium mb-2'>Gender </label>
        {genders.map((gender) => (
          <div
            key={gender}
            className='flex items-center mb-1'
          >
            <input
              type="radio"
              name='category'
              className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 '
            />
            <span className='text-gray-700'>{gender}</span>

          </div>
        ))};
      </div>

      {/* Color Filter  */}
      <div className='mb-6'>
        <label className='block text-gray-600 font-medium mb-2'>Color</label>
        <div className='flex flex-wrap gap-2'>
          {colors.map((color) => (
            <button
              key={color}
              name='color'
              className='w-8 h-8 rounded-full border-gray-300 cursor-pointer transition hover:scale-105'
              style={{backgroundColor: color.toLowerCase()}}
            >
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter  */}
      <div className='mb-6'>
        <label className='block text-gray-600 font-medium mb-2'>Size</label>
        {sizes.map((size)=>(
          <div 
          key={size}
          className='flex items-center mb-1'
          >
            <input type="checkbox"
             name="size" 
             className='mr-2 h-4 w-4 text-blue-500 border-gray-300'          
             />
             <span className='text-gray-700'>{size}</span>
          </div>
        ))}
      </div>

      {/* Material Filter  */}
      <div className='mb-6'>
        <label className='block text-gray-600 font-medium mb-2'>Material</label>
        {materials.map((material)=>(
          <div 
          key={material}
          className='flex items-center mb-1'
          >
            <input type="checkbox"
             name="material" 
             className='mr-2 h-4 w-4 text-blue-500 border-gray-300'          
             />
             <span className='text-gray-700'>{material}</span>
          </div>
        ))}
      </div>

      {/* Brand Filter  */}
      <div className='mb-6'>
        <label className='block text-gray-600 font-medium mb-2'>Brand</label>
        {brands.map((brand)=>(
          <div 
          key={brand}
          className='flex items-center mb-1'
          >
            <input type="checkbox"
             name="brand" 
             className='mr-2 h-4 w-4 text-blue-500 border-gray-300'          
             />
             <span className='text-gray-700'>{brand}</span>
          </div>
        ))}
      </div>

{/* Price Range Filter  */}
<div className='mb-8'>
  <label className='block text-gray-600 font-medium mb-2'>
    Price Range
  </label>
  <input type="range"
  name='priceRange'
  min={0}
  max={100}
  className='w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer'
  />
  <div className='flex justify-between text-gray-600 mt-2'>
    <span>$0</span>
    <span>$0{priceRange[1]}</span>
  </div>
</div>

    </div>
  )
}

export default FilterSidebar