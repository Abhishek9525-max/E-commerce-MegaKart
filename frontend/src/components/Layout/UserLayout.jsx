import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { Outlet } from 'react-router-dom'
import ChatWidget from '../Common/ChatWidget'

const UserLayout = () => {
  return (
    <>
    {/* header */}
    <Header/>
    {/* main content */}
   <main>
    <Outlet />
   </main>
    {/* footer */}
    <Footer />
    <ChatWidget />
    </>
  )
}

export default UserLayout