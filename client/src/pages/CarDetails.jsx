import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const CarDetails = () => {

  const { id } = useParams()
  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, currency } = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)

  const fetchRecommendations = async (currentCar) => {
    try {
      setLoadingRecs(true)
      const { data } = await axios.post('/api/ai/recommend', {
        brand: currentCar.brand,
        category: currentCar.category,
        limit: 3
      })
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setLoadingRecs(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate,
        returnDate
      })

      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const foundCar = cars.find(car => car._id === id)
    if (foundCar) {
      setCar(foundCar)
      fetchRecommendations(foundCar)
    }
  }, [cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 bg-slate-50 min-h-screen pb-20'>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors cursor-pointer font-medium">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to all cars
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Car Image & Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <motion.img
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={car.image} alt="" className="w-full h-auto md:max-h-120 object-cover rounded-2xl shadow-inner" 
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-10 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{car.brand} {car.model}</h1>
                <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full uppercase tracking-wider">{car.category}</span>
                    <span className="text-slate-400 font-medium">•</span>
                    <span className="text-slate-500 font-bold">{car.year} Model</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="ml-2 text-slate-400 font-bold text-sm">(4.8)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: assets.users_icon, label: "Capacity", value: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, label: "Fuel", value: car.fuel_type },
                { icon: assets.carIconColored, label: "Shift", value: car.transmission },
                { icon: assets.location_icon, label: "City", value: car.location }
              ].map(({ icon, label, value }) => (
                <div key={label} className='flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-primary/20 hover:bg-primary/[0.02] transition-all'>
                  <img src={icon} alt='' className='h-6 w-6 mb-3 opacity-70 group-hover:opacity-100 transition-opacity' />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                  <p className="text-sm font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                Vehicle Overview
              </h3>
              <p className="text-slate-500 leading-relaxed text-lg">{car.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                Premium Amenities
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["360 Camera", "Bluetooth", "Smart GPS", "Heated Seats", "Climate Control", "Premium Audio"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600 font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Booking from */}
        <div className="relative">
            <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onSubmit={handleSubmit} className='bg-white shadow-xl shadow-slate-200/50 border border-slate-100 h-max sticky top-24 rounded-3xl p-8 space-y-8'
            >
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price per day</p>
                    <p className='text-4xl text-slate-900 font-black tracking-tight'>
                        <span className="text-xl font-bold text-primary mr-1">{currency}</span>
                        {car.pricePerDay}
                    </p>
                </div>
                <div className="text-right">
                    <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-md border border-green-100">AVAILABLE</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className='flex flex-col gap-2'>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="pickup-date">Pickup Date</label>
                    <input value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} type="date" className='bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700' required id='pickup-date' min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className='flex flex-col gap-2'>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="return-date">Return Date</label>
                    <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)} type="date" className='bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700' required id='return-date' />
                </div>
            </div>

            <button className='w-full bg-primary hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all py-4 font-black text-sm uppercase tracking-widest text-white rounded-2xl cursor-pointer active:scale-[0.98]'>
                Confirm Booking
            </button>

            <div className="flex flex-col items-center gap-3">
                <p className='text-xs text-slate-400 font-medium'>No hidden fees • Instant Confirmation</p>
                <div className="flex items-center gap-2">
                    <img src={assets.tick_icon} className="h-3 w-3 brightness-0 opacity-20" alt="" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Verified Owner</span>
                </div>
            </div>
            </motion.form>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="mt-20">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Smart Recommendations</h2>
                <p className="text-slate-500 mt-1">AI-powered suggestions based on your interests</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest">AI Engine Active</span>
            </div>
        </div>

        {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 bg-slate-200 rounded-3xl"></div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg leading-none">{rec.brand} {rec.model}</h4>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">{rec.year} • {rec.reason}</p>
                            </div>
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-md uppercase">Top Match</span>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                            <p className="font-black text-slate-900">
                                <span className="text-primary text-sm mr-0.5">{currency}</span>
                                {rec.price}
                                <span className="text-slate-400 text-[10px] font-medium ml-1">/day</span>
                            </p>
                            <button onClick={() => toast.success("Feature coming soon!")} className="text-xs font-black text-primary hover:underline group-hover:translate-x-1 transition-transform">View Details →</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </div>
  ) : <Loading />
}

export default CarDetails
