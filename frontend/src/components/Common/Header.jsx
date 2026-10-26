import React from 'react'
import Topbar from '../Layout/Topbar'
import Navbar from './Navbar'

const Header = () => {
  return (
    <>
      <header>
        <Topbar />
      </header>
      <Navbar />
    </>
  )
}

export default Header