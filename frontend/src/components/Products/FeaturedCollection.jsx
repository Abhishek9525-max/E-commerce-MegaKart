import React from 'react'
import {Link} from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi2'
import featured from '../../assets/featured.webp'

const FeaturedCollection = () => {
  return (
    <section className='px-4 py-16 lg:px-0'>
      <div className='container mx-auto flex flex-col overflow-hidden bg-[#ECE8E9] lg:h-[530px] lg:flex-row'>
        <div className='flex flex-col items-start justify-center p-8 text-left sm:p-12 lg:w-1/2 lg:px-[52px] lg:py-12'>
          <p className='luxury-eyebrow mb-3 text-[#A94F38]'>
            Apparel made for your everyday life
          </p>
          <h2 className='mb-6 max-w-lg text-4xl leading-[1.15] sm:text-5xl lg:text-4xl'>
            Everyday Confidence, Effortless Comfort
          </h2>
          <p className='mb-8 max-w-lg text-base leading-relaxed text-[#414B5A] sm:text-lg'>
            Experience clothing that moves with your life—where premium comfort meets timeless style. Made to elevate your every day, in every way.
          </p>
          <div className='flex flex-col items-start gap-5 sm:flex-row sm:items-center'>
            <Link to='/collection/all' className='luxury-button min-w-[190px]'>
              Shop Now <HiArrowRight className='h-4 w-4' />
            </Link>
            <a
              href='#best-seller'
              className='luxury-eyebrow border-b border-[#414B36] pb-1 text-[#171714]'
            >
              Read Atelier Notes
            </a>
          </div>
        </div>
        <div className='h-64 sm:h-72 lg:h-full lg:w-1/2'>
          <img
            src={featured}
            alt='Featured everyday apparel collection'
            className='h-full w-full object-cover'
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturedCollection