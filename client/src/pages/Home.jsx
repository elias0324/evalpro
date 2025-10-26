import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
      <Sidebar/>
      <Header/>
    </div>
  )
}

export default Home
