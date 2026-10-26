import React from 'react'
import {Link} from 'react-router-dom'

const ProductGrid = ({products , loading, error}) => {

  if(loading){
    return <p>Loading...</p>
  }
  if(error){
    return <p>Error: {error}</p>
  }
  return (
    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
      {products.map((product)=>(
        <Link key={product._id} to={`/product/${product._id}`}
        className='group block'>
          <article className='h-full bg-white p-3 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(23,23,20,0.08)] sm:p-4'>
            <div className='mb-4 aspect-[3/4] overflow-hidden bg-[#F0EDE7]'>
              {product.images?.[0]?.url && (
                <img src={product.images[0].url}
                alt={product.images[0].altText || product.name}
                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
                />
              )}
            </div>
            <h3 className='mb-2 font-sans text-sm font-medium text-[#171714]'>{product.name}</h3>
            <p className='font-sans text-sm font-medium tracking-wide text-[#77746D]'>
              ${product.price}
            </p>
          </article>
        </Link>
      ))}
    </div>
  )
}

export default ProductGrid