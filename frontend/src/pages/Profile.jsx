import React, { useEffect, useRef, useState } from 'react'
import { FiCamera, FiLogOut, FiMail, FiShield, FiTrash2 } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { deleteProfileImage, logout, uploadProfileImage } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import MyOrdersPage from './MyOrdersPage'

const Profile = () => {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  useEffect(()=>{
    if(!user){
      navigate("/login");
    }
  },[user, navigate])

  const handleLogout = ()=>{
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login")
  }

  const handleProfileImageChange = async (event) => {
    const imageFile = event.target.files?.[0];
    event.target.value = '';
    if (!imageFile) return;

    if (!imageFile.type.startsWith('image/')) {
      setImageUploadError('Choose a valid image file.');
      return;
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      setImageUploadError('Profile image must be 5 MB or smaller.');
      return;
    }

    setImageUploadError('');
    setIsUploadingImage(true);
    try {
      await dispatch(uploadProfileImage(imageFile)).unwrap();
    } catch (error) {
      setImageUploadError(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    setImageUploadError('');
    setIsDeletingImage(true);
    try {
      await dispatch(deleteProfileImage()).unwrap();
    } catch (error) {
      setImageUploadError(error);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className='min-h-screen bg-[#F5F2ED] px-4 py-10 sm:px-6 lg:py-14'>
      <div className='mx-auto max-w-[1440px]'>
        <header className='mb-8 border-b border-[#D8D2C8] pb-6 sm:mb-10'>
          <p className='luxury-eyebrow mb-2 text-[#A94F38]'>Your MegaKart account</p>
          <h1 className='text-4xl text-[#171714] sm:text-5xl'>My Account</h1>
          <p className='mt-2 text-sm text-[#77746D]'>
            Manage your account and keep track of your orders.
          </p>
        </header>

        <div className='grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8'>
          <aside className='overflow-hidden rounded-md border border-[#EAE6DF] bg-white shadow-[0_2px_12px_rgba(23,23,20,0.04)]'>
            <div className='h-2 bg-[#414B36]' />
            <div className='p-6'>
              <div className='mb-5 flex items-center gap-4'>
                <div className='relative h-16 w-16 shrink-0'>
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.name}'s profile`}
                    className='h-full w-full rounded-full border border-[#EAE6DF] object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center rounded-full bg-[#F0EDE7] font-display text-2xl text-[#414B36]'>
                    {initials}
                  </div>
                )}
                {user?.profileImage && (
                  <button
                    type='button'
                    onClick={handleDeleteProfileImage}
                    disabled={isUploadingImage || isDeletingImage}
                    aria-label='Delete profile photo'
                    title='Delete profile photo'
                    className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#A94F38] text-white shadow-sm transition-colors hover:bg-[#803A2A] disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    <FiTrash2 aria-hidden='true' className='h-3 w-3' />
                  </button>
                )}
                </div>
                <div>
                  <input
                    ref={imageInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleProfileImageChange}
                    className='sr-only'
                    aria-label='Choose a profile image'
                  />
                  <button
                    type='button'
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage || isDeletingImage}
                    className='inline-flex min-h-10 items-center gap-2 border border-[#D8D2C8] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#414B36] transition-colors hover:border-[#414B36] disabled:cursor-wait disabled:opacity-60'
                  >
                    <FiCamera aria-hidden='true' className='h-4 w-4' />
                    {isDeletingImage ? 'Removing...' : isUploadingImage ? 'Uploading...' : user?.profileImage ? 'Change photo' : 'Add photo'}
                  </button>
                </div>
              </div>
              {imageUploadError && (
                <p role='alert' className='mb-4 text-xs leading-relaxed text-[#A94F38]'>
                  {imageUploadError}
                </p>
              )}
              <p className='luxury-eyebrow mb-2 text-[#77746D]'>Account details</p>
              <h2 className='break-words text-2xl text-[#171714]'>{user?.name}</h2>
              <p className='mt-4 flex items-start gap-2.5 break-all text-sm leading-relaxed text-[#77746D]'>
                <FiMail aria-hidden='true' className='mt-0.5 h-4 w-4 shrink-0 text-[#414B36]' />
                {user?.email}
              </p>
              <div className='mt-6 flex items-center gap-2 border-t border-[#EAE6DF] pt-5 text-xs text-[#77746D]'>
                <FiShield aria-hidden='true' className='h-4 w-4 text-[#414B36]' />
                Your account is private and secure
              </div>
              <button
                type='button'
                onClick={handleLogout}
                className='mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#D8D2C8] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#414B36] transition-colors hover:border-[#A94F38] hover:bg-[#A94F38] hover:text-white'
              >
                <FiLogOut aria-hidden='true' className='h-4 w-4' />
                Logout
              </button>
            </div>
          </aside>

          <section className='min-w-0 rounded-md border border-[#EAE6DF] bg-white shadow-[0_2px_12px_rgba(23,23,20,0.04)]'>
            <MyOrdersPage/>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
