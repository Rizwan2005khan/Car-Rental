import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const ManageCar = () => {

  const { isOwner, axios, currency } = useAppContext()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOwnerCars = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) {
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId) => {
    try {
      const confirm = window.confirm('Are you sure you want to permanently remove this vehicle from your inventory?')
      if (!confirm) return null;

      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    isOwner && fetchOwnerCars()
  }, [isOwner])

  return (
    <div className='px-6 py-10 md:px-12 w-full bg-[#F8FAFC] min-h-screen'>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <Title 
            title="Inventory Control" 
            subTitle="Monitor and manage your vehicle fleet. Update availability status or refine your listings for better performance." 
        />
        <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fleet</p>
                <p className="text-xl font-black text-slate-800">{cars.length} Vehicles</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                <img src={assets.carIconColored} className="h-6 w-6" alt="" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Category</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rental Rate</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {cars.map((car, index) => (
                  <motion.tr 
                    key={car._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={car.image} alt='' className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover shadow-md border-2 border-white group-hover:scale-105 transition-transform" />
                            {!car.isAvailable && (
                                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">OFFLINE</span>
                                </div>
                            )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-base md:text-lg tracking-tight leading-none mb-1">{car.brand} {car.model}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{car.year} Model</span>
                             <span className="text-slate-300">•</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{car.transmission}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 hidden md:table-cell">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                        {car.category}
                      </span>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <p className="text-lg font-black text-slate-800 leading-none">
                            <span className="text-primary text-sm mr-0.5">{currency}</span>
                            {car.pricePerDay}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">per day</p>
                      </div>
                    </td>

                    <td className="px-6 py-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${car.isAvailable ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${car.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                          {car.isAvailable ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                           onClick={() => toggleAvailability(car._id)}
                           className={`p-3 rounded-xl transition-all ${car.isAvailable ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                           title={car.isAvailable ? "Set Offline" : "Set Online"}
                        >
                          <img src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon} alt='' className="w-5 h-5" />
                        </button>
                        
                        <button 
                           onClick={() => deleteCar(car._id)}
                           className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                           title="Delete Vehicle"
                        >
                          <img src={assets.delete_icon} alt='' className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {cars.length === 0 && !loading && (
            <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <img src={assets.carIconColored} className="h-8 w-8 opacity-20 grayscale" alt="" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Your fleet is empty</h3>
                <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm">Start your rental business by listing your first premium vehicle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageCar
