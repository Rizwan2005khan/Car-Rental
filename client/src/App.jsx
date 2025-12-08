import React, { useState } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/carDetails'
import Cars from './pages/Cars'
import MyBooking from './pages/MyBooking'
import Footer from './components/Footer'
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import AddCar from './pages/owner/AddCar'
import ManageCar from './pages/owner/ManageCar'
import ManageBooking from './pages/owner/ManageBooking'
import Login from './components/Login'

const App = () => {

  const [showLogin, setShowLogin] = useState(false)
  const isOwnerPath = useLocation().pathname.startsWith('/owner')
  return (
    <>
    {showLogin && <Login setShowLogin={setShowLogin} /> }
      {!isOwnerPath && <Navbar setShowLogin={setShowLogin}/>}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBooking />} /> 
        <Route path='/owner' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='add-car' element={<AddCar />} />
        <Route path='manage-cars' element={<ManageCar />} />
        <Route path='manage-bookings' element={<ManageBooking />} />
        </Route>
      </Routes>

      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App
