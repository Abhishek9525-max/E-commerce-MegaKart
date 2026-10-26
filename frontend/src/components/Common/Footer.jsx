import React from 'react';
import { Link } from 'react-router-dom';
import { TbBrandMeta } from 'react-icons/tb';
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { FiPhoneCall } from 'react-icons/fi';





const Footer = () => {
  return (
    <footer className='border-t border-[#D8D2C8] bg-[#F5F2ED] py-14 text-[#77746D]'>
      <div className='container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0'>
        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Stay in the know</h3>
          <p className='mb-4 text-[#77746D]'>
            Be the first to hear about new collections, considered edits, and private offers.
          </p>
          <p className='mb-6 text-sm font-medium text-[#77746D]'>Sign up and receive 10% off your first order.</p>

          {/* Newsletter form */}
          <form className='flex'>
            <input
              type="email"
              placeholder='Enter you email'
              className='w-full border border-[#D8D2C8] bg-[#FAF9F6] p-3 text-sm text-[#171714] placeholder:text-[#77746D] focus:outline-none focus:ring-1 focus:ring-[#414B36]'
              required />
            <button
              type='submit'
              className='bg-[#414B36] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#30392A]'>Subscribe</button>
          </form>

        </div>
        {/* shop Links  */}
        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Shop</h3>
          <ul className='space-y-2 text-[#77746D]'>
            <li>
              <Link to='/collection/all?gender=Men' className='transition-colors hover:text-[#414B36]'>
                Men
              </Link>
            </li>
            <li>
              <Link to='/collection/all?gender=Women' className='transition-colors hover:text-[#414B36]'>
                Women
              </Link>
            </li>
            <li>
              <Link to='/new-arrivals' className='transition-colors hover:text-[#414B36]'>
                New Arrivals
              </Link>
            </li>
            <li>
              <Link to='/collection/all' className='transition-colors hover:text-[#414B36]'>
                Collections
              </Link>
            </li>
          </ul>
        </div>

        {/* support links */}
        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Support</h3>
          <ul className='space-y-2 text-[#77746D]'>
            <li>
              <Link to='#' className='transition-colors hover:text-[#414B36]'>
                Contact Us
              </Link>
            </li>
            <li>
              <Link to='#' className='transition-colors hover:text-[#414B36]'>
                FAQs
              </Link>
            </li>
            <li>
              <Link to='#' className='transition-colors hover:text-[#414B36]'>
                Features
              </Link>
            </li>
          </ul>
        </div>
        {/* Follow us */}
        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Follow Us</h3>
          <div className='flex items-center space-x-4 mb-6 '>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#171714] transition-colors hover:text-[#414B36]'>
              <TbBrandMeta className='h-5 w-5' />
            </a>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#171714] transition-colors hover:text-[#414B36]'>
              <IoLogoInstagram className='h-5 w-5' />
            </a>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#171714] transition-colors hover:text-[#414B36]'>
              <RiTwitterXLine className='h-4 w-4' />
            </a>
          </div>
          <p className='text-[#77746D]'>Call us</p>
          <p>
            <FiPhoneCall className='inline-block mr-2 '/>
            0123-456-789
          </p>
        </div>
      </div>
      {/* Footer Bottom  */}
      <div className='container mx-auto mt-12 border-t border-[#D8D2C8] px-4 pt-6 lg:px-0'>
        <p className='text-center text-sm tracking-tighter text-[#77746D]'>
          © 2026 MegaKart. All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

export default Footer