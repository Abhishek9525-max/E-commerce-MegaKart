import React from 'react'
import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi2'
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
          <div className='absolute bottom-6 left-6 w-[min(100%-3rem,320px)] bg-[#F5F2ED]/95 p-5 sm:bottom-8 sm:left-8 sm:w-[min(100%-4rem,360px)]'>
            <p className='luxury-eyebrow mb-2 text-[#A94F38]'>Couture edit</p>
            <h2 className='mb-2 text-3xl text-gray-900'>
              Women's Collection
            </h2>
            <p className='mb-5 text-sm leading-relaxed text-[#77746D]'>
              Silk draped wraps, pleated midis, and relaxed resort separates.
            </p>
            <Link
              to='/collection/all?gender=Women'
              className='luxury-eyebrow inline-flex items-center gap-2 text-[#414B36]'>
              Shop Now <HiArrowRight className='h-3.5 w-3.5' />
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
          <div className='absolute bottom-6 left-6 w-[min(100%-3rem,320px)] bg-[#F5F2ED]/95 p-5 sm:bottom-8 sm:left-8 sm:w-[min(100%-4rem,360px)]'>
            <p className='luxury-eyebrow mb-2 text-[#414B36]'>Sartorial line</p>
            <h2 className='mb-2 text-3xl text-gray-900'>
              Men's Collection
            </h2>
            <p className='mb-5 text-sm leading-relaxed text-[#77746D]'>
              Structured Giza cotton shirts, soft blazers, and tapered trousers.
            </p>
            <Link
              to='/collection/all?gender=Men'
              className='luxury-eyebrow inline-flex items-center gap-2 text-[#414B36]'>
              Shop Now <HiArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>
        </div>

      </div>

    </section>
  )
}

export default GenderCollectionSection