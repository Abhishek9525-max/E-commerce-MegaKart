import React, { useEffect, useRef, useState } from 'react'
import { FiCamera, FiEye, FiEyeOff, FiLogOut, FiMail, FiShield, FiTrash2 } from 'react-icons/fi'
import { HiHeart } from 'react-icons/hi2'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { deleteProfileImage, logoutUser, uploadProfileImage } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import MyOrdersPage from './MyOrdersPage'
import { getLoginUrl } from '../utils/authRedirect'

const Profile = () => {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const passwordRequirements = [
    { label: 'At least 8 characters', passed: newPassword.length >= 8 },
    { label: 'One uppercase letter', passed: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', passed: /[a-z]/.test(newPassword) },
    { label: 'One number', passed: /\d/.test(newPassword) },
  ];

  useEffect(()=>{
    if(!user){
      navigate(getLoginUrl("/profile"));
    }
  },[user, navigate])

  const handleLogout = ()=>{
    dispatch(logoutUser());
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

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!passwordRequirements.every(({ passed }) => passed)) {
      toast.error('Please meet all new password requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Your new passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/password`,
        { currentPassword, newPassword }
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setVisiblePasswords({ current: false, new: false, confirm: false });
      setIsPasswordFormOpen(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to change your password. Please try again.'
      );
    } finally {
      setIsChangingPassword(false);
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
    <div className='min-h-screen bg-[#F5F2ED] px-4 py-6 sm:px-6 lg:py-8'>
      <div className='mx-auto max-w-[1440px]'>
        <header className='mb-6 border-b border-[#D8D2C8] pb-5 sm:mb-8'>
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
                onClick={() => setIsPasswordFormOpen(true)}
                className='mt-3 text-xs font-medium text-[#414B36] underline underline-offset-4 transition-colors hover:text-[#A94F38]'
              >
                Change password
              </button>
              <Link
                to='/favorites'
                className='mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#D8D2C8] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#414B36] transition-colors hover:border-[#414B36] hover:bg-[#F5F2ED]'
              >
                <HiHeart aria-hidden='true' className='h-4 w-4 text-[#A94F38]' />
                My Favorites
              </Link>
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
        {isPasswordFormOpen && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-[#171714]/50 p-4'
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isChangingPassword) {
                setIsPasswordFormOpen(false);
              }
            }}
          >
            <section
              aria-labelledby='change-password-title'
              aria-modal='true'
              className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-[#EAE6DF] bg-white p-6 shadow-xl sm:p-8'
              role='dialog'
            >
              <div className='mb-6 flex items-start justify-between gap-4'>
                <div>
                  <p className='luxury-eyebrow mb-2 text-[#A94F38]'>Account security</p>
                  <h2 id='change-password-title' className='text-3xl text-[#171714]'>
                    Change password
                  </h2>
                </div>
                <button
                  type='button'
                  aria-label='Close change password form'
                  onClick={() => setIsPasswordFormOpen(false)}
                  disabled={isChangingPassword}
                  className='flex h-9 w-9 shrink-0 items-center justify-center text-xl text-[#77746D] hover:text-[#171714] disabled:opacity-50'
                >
                  ×
                </button>
              </div>
              <p className='mb-5 text-sm leading-relaxed text-[#77746D]'>
                Enter your current password and choose a new one. Other active sessions will be signed out.
              </p>
              <form className='grid gap-4' onSubmit={handleChangePassword}>
                <label className='grid gap-2 text-xs font-semibold uppercase tracking-wider text-[#414B36]'>
                  Current password
                  <span className='relative'>
                    <input
                      type={visiblePasswords.current ? 'text' : 'password'}
                      autoComplete='current-password'
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className='w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm font-normal normal-case tracking-normal text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setVisiblePasswords((visible) => ({ ...visible, current: !visible.current }))}
                      aria-label={visiblePasswords.current ? 'Hide current password' : 'Show current password'}
                      className='absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77746D] hover:text-[#171714]'
                    >
                      {visiblePasswords.current ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
                    </button>
                  </span>
                </label>
                <label className='grid gap-2 text-xs font-semibold uppercase tracking-wider text-[#414B36]'>
                  New password
                  <span className='relative'>
                    <input
                      type={visiblePasswords.new ? 'text' : 'password'}
                      autoComplete='new-password'
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className='w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm font-normal normal-case tracking-normal text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setVisiblePasswords((visible) => ({ ...visible, new: !visible.new }))}
                      aria-label={visiblePasswords.new ? 'Hide new password' : 'Show new password'}
                      className='absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77746D] hover:text-[#171714]'
                    >
                      {visiblePasswords.new ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
                    </button>
                  </span>
                </label>
                <label className='grid gap-2 text-xs font-semibold uppercase tracking-wider text-[#414B36]'>
                  Confirm new password
                  <span className='relative'>
                    <input
                      type={visiblePasswords.confirm ? 'text' : 'password'}
                      autoComplete='new-password'
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className='w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm font-normal normal-case tracking-normal text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setVisiblePasswords((visible) => ({ ...visible, confirm: !visible.confirm }))}
                      aria-label={visiblePasswords.confirm ? 'Hide confirmed password' : 'Show confirmed password'}
                      className='absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77746D] hover:text-[#171714]'
                    >
                      {visiblePasswords.confirm ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
                    </button>
                  </span>
                </label>
                <div className='grid grid-cols-2 gap-2' aria-live='polite'>
                  {passwordRequirements.map(({ label, passed }) => (
                    <p
                      key={label}
                      className={`text-xs ${passed ? 'text-[#414B36]' : 'text-[#77746D]'}`}
                    >
                      {passed ? '✓' : '○'} {label}
                    </p>
                  ))}
                </div>
                <button
                  type='submit'
                  disabled={isChangingPassword}
                  className='luxury-button disabled:cursor-wait disabled:opacity-70'
                >
                  {isChangingPassword ? 'Updating password...' : 'Update password'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
