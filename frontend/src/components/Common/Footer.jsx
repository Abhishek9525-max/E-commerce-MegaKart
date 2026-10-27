import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TbBrandMeta } from 'react-icons/tb';
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { FiPhoneCall } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'sonner';


const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscribe`,
        { email }
      );
      toast.success(response.data.message);
      setEmail('');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to subscribe right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className='border-t border-[#D8D2C8] bg-[#F5F2ED] py-12 text-[#77746D] sm:py-14'>
      <div className='mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-10'>
        <div className='lg:pr-3'>
          <h3 className='mb-4 text-2xl text-[#171714]'>Stay in the know</h3>
          <p className='mb-4 max-w-sm leading-relaxed text-[#77746D]'>
            Be the first to hear about new collections, considered edits, and private offers.
          </p>
          <p className='mb-6 text-sm font-medium text-[#77746D]'>Sign up and receive 10% off your first order.</p>

          <form className='flex max-w-md' onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='Enter your email'
              aria-label='Email address for newsletter'
              className='min-w-0 flex-1 border border-[#D8D2C8] bg-[#FAF9F6] p-3 text-sm text-[#171714] placeholder:text-[#77746D] focus:outline-none focus:ring-1 focus:ring-[#414B36]'
              required
            />
            <button
              type='submit'
              disabled={isSubmitting}
              className='bg-[#414B36] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#30392A] disabled:cursor-not-allowed disabled:opacity-70'
            >
              {isSubmitting ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        </div>

        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Shop</h3>
          <ul className='space-y-2.5 text-[#77746D]'>
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

        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Support</h3>
          <ul className='space-y-2.5 text-[#77746D]'>
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
        <div>
          <h3 className='mb-4 text-2xl text-[#171714]'>Follow Us</h3>
          <div className='mb-6 flex items-center space-x-4'>
            <a href="https://www.facebook.com"
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Follow MegaKart on Facebook'
              className='text-[#171714] transition-colors hover:text-[#414B36]'>
              <TbBrandMeta className='h-5 w-5' />
            </a>
            <a href="https://www.instagram.com"
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Follow MegaKart on Instagram'
              className='text-[#171714] transition-colors hover:text-[#414B36]'>
              <IoLogoInstagram className='h-5 w-5' />
            </a>
            <a href="https://x.com"
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Follow MegaKart on X'
              className='text-[#171714] transition-colors hover:text-[#414B36]'>
              <RiTwitterXLine className='h-4 w-4' />
            </a>
          </div>
          <p className='text-[#77746D]'>Call us</p>
          <a href='tel:0123456789' className='transition-colors hover:text-[#414B36]'>
            <FiPhoneCall className='inline-block mr-2 '/>
            0123-456-789
          </a>
        </div>
      </div>
      <div className='mx-auto mt-12 max-w-[1440px] border-t border-[#D8D2C8] px-5 pt-6 lg:px-10'>
        <p className='text-center text-sm tracking-tighter text-[#77746D]'>
          © 2026 MegaKart. All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

export default Footer