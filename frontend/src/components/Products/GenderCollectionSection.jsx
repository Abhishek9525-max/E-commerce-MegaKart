import React from 'react'
import { Link } from 'react-router-dom'
import mensCollectionImgae from '../../assets/mens-collection.webp'
import womensCollectionImgae from '../../assets/womens-collection.webp'

const GenderCollectionSection = () => {
  return (
    <section className='px-4 py-16 lg:px-0 lg:py-20'>
      <div className='container mx-auto flex flex-col gap-5 md:flex-row md:gap-7'>
        {/* womens collection  */}
        <div className='group relative flex-1 overflow-hidden'>
          <img src={womensCollectionImgae}
            alt="Women's collection"
            className='h-[520px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] md:h-[620px]'
          />
          <div className='absolute bottom-6 left-6 min-w-52 bg-[#F5F2ED]/95 p-5 sm:bottom-8 sm:left-8'>
            <h2 className='mb-2 text-3xl text-gray-900'>
              Women's Collection
            </h2>
            <Link
              to='/collection/all?gender=Women'
              className='luxury-eyebrow inline-flex items-center border-b border-[#414B36] pb-1 text-[#414B36]'>
              Shop Women
            </Link>
          </div>
        </div>
        {/* Men's collection  */}
        <div className='group relative flex-1 overflow-hidden'>
          <img
            src={mensCollectionImgae}
            alt="Men's collection"
            className='h-[520px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] md:h-[620px]'
          />
          <div className='absolute bottom-6 left-6 min-w-52 bg-[#F5F2ED]/95 p-5 sm:bottom-8 sm:left-8'>
            <h2 className='mb-2 text-3xl text-gray-900'>
              Men's Collection
            </h2>
            <Link
              to='/collection/all?gender=Men'
              className='luxury-eyebrow inline-flex items-center border-b border-[#414B36] pb-1 text-[#414B36]'>
              Shop Men
            </Link>
          </div>
        </div>

      </div>

    </section>
  )
}

export default GenderCollectionSection