import React from 'react';
import { Link } from 'react-router-dom';
import { TbBrandMeta } from 'react-icons/tb';
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { FiPhoneCall } from 'react-icons/fi';





const Footer = () => {
  return (
    <footer className='border-t border-[#D8D2C8] bg-[#F0EDE7] py-14'>
      <div className='container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0'>
        <div>
          <h3 className='mb-4 text-2xl text-gray-900'>Stay in the know</h3>
          <p className='text-gray-500 mb-4'>
            Be the first to hear about new collections, considered edits, and private offers.
          </p>
          <p className='font-medium text-sm text-gray-600 mb-6'>Sign up and receive 10% off your first order.</p>

          {/* Newsletter form */}
          <form className='flex'>
            <input
              type="email"
              placeholder='Enter you email'
              className='w-full border border-gray-300 bg-[#F5F2ED] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#414B36]'
              required />
            <button
              type='submit'
              className='bg-[#414B36] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#30392A]'>Subscribe</button>
          </form>

        </div>
        {/* shop Links  */}
        <div>
          <h3 className='mb-4 text-2xl text-gray-900'>Shop</h3>
          <ul className='space-y-2 text-gray-600'>
            <li>
              <Link to='/collection/all?gender=Men' className='hover:text-gray-500 transition-colors'>
                Men
              </Link>
            </li>
            <li>
              <Link to='/collection/all?gender=Women' className='hover:text-gray-500 transition-colors'>
                Women
              </Link>
            </li>
            <li>
              <Link to='/new-arrivals' className='hover:text-gray-500 transition-colors'>
                New Arrivals
              </Link>
            </li>
            <li>
              <Link to='/collection/all' className='hover:text-gray-500 transition-colors'>
                Collections
              </Link>
            </li>
          </ul>
        </div>

        {/* support links */}
        <div>
          <h3 className='mb-4 text-2xl text-gray-900'>Support</h3>
          <ul className='space-y-2 text-gray-600'>
            <li>
              <Link to='#' className='hover:text-gray-500 transition-colors'>
                Contact Us
              </Link>
            </li>
            <li>
              <Link to='#' className='hover:text-gray-500 transition-colors'>
                FAQs
              </Link>
            </li>
            <li>
              <Link to='#' className='hover:text-gray-500 transition-colors'>
                Features
              </Link>
            </li>
          </ul>
        </div>
        {/* Follow us */}
        <div>
          <h3 className='mb-4 text-2xl text-gray-900'>Follow Us</h3>
          <div className='flex items-center space-x-4 mb-6 '>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-500'>
              <TbBrandMeta className='h-5 w-5' />
            </a>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-500'>
              <IoLogoInstagram className='h-5 w-5' />
            </a>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-gray-500'>
              <RiTwitterXLine className='h-4 w-4' />
            </a>
          </div>
          <p className='text-gray-500'>Call us</p>
          <p>
            <FiPhoneCall className='inline-block mr-2 '/>
            0123-456-789
          </p>
        </div>
      </div>
      {/* Footer Bottom  */}
      <div className='container mx-auto mt-12 border-t border-gray-200 px-4 pt-6 lg:px-0'>
        <p className='text-gray-500 text-sm tracking-tighter text-center'>
          © 2026 MegaKart. All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

export default Footer