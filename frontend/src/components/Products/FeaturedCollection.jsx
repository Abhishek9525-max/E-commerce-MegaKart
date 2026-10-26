import React from 'react'
import {Link} from 'react-router-dom'
import featured from '../../assets/featured.webp'

const FeaturedCollection = () => {
  return (
    <section className='py-16 px-4 lg:px-0'>
      <div className='container mx-auto flex flex-col-reverse items-center overflow-hidden bg-pink-50 lg:flex-row'>
        {/* left content  */}
        <div className='p-8 text-center sm:p-12 lg:w-1/2 lg:text-left'>
          <p className='luxury-eyebrow mb-3 text-gray-600'>
            Apparel made for your everyday life
          </p>
          <h2 className='mb-6 text-4xl leading-[1.05] lg:text-6xl'>
          Everyday Confidence, Effortless Comfort
          </h2>
          <p className='text-lg text-gray-600 mb-6 '>
          Experience clothing that moves with your life—where premium comfort meets timeless style. Made to elevate your every day, in every way.

          </p>
          <Link to='/collection/all'
          className='luxury-button'>
            Explore the Collection
          </Link>
        </div>
        {/* Right Content  */}
        <div className='lg:w-1/2'>
        <img src={featured} 
        alt="Featured Collection" 
        className='w-full h-full object-cover lg:rounded-tr-3xl lg:rounded-br-3xl'
        />
        </div>
      </div>
    </section>
  )
}

export default FeaturedCollection