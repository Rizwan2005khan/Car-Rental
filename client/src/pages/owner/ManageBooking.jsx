import React, { useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { assets } from '../../assets/assets'

const ManageBooking = () => {

  const { axios, currency } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/bookings/owner')
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/bookings/change-status', { bookingId, status })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'cancelled': return 'bg-red-50 text-red-500 border-red-100'
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
      default: return 'bg-slate-50 text-slate-500 border-slate-100'
    }
  }

  return (
    <div className='px-6 py-10 md:px-12 w-full bg-[#F8FAFC] min-h-screen'>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <Title 
            title="Order History" 
            subTitle="Track and manage all vehicle reservations. Monitor incoming requests and maintain high fulfillment rates." 
        />
        <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
                <p className="text-xs font-black text-slate-600 uppercase tracking-tight">
                    {bookings.filter(b => b.status === 'pending').length} Actions Required
                </p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle / Booking ID</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Schedule</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Method</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {bookings.map((booking, index) => (
                  <motion.tr 
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={booking.car.image} alt="" className='h-14 w-14 rounded-xl object-cover shadow-sm border border-slate-100'/>
                        <div>
                            <p className="font-black text-slate-800 text-sm md:text-base tracking-tight leading-none mb-1">
                                {booking.car.brand} {booking.car.model}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{booking._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>   

                    <td className="px-6 py-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <p className="text-xs font-bold text-slate-700">{new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <p className="text-xs font-bold text-slate-400">{new Date(booking.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </td>      

                    <td className="px-6 py-6">
                      <p className="text-base font-black text-slate-800 leading-none">
                        <span className="text-primary text-xs mr-0.5">{currency}</span>
                        {booking.price.toLocaleString()}
                      </p>
                    </td>   

                    <td className="px-6 py-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                         <span className='text-[10px] font-black uppercase tracking-widest'>Offline Pay</span>
                      </div>
                    </td>    

                    <td className="px-8 py-6 text-right">
                      {booking.status === 'pending' ? (
                        <select 
                          onChange={e => changeBookingStatus(booking._id, e.target.value)} 
                          value={booking.status} 
                          className='bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl text-xs font-black outline-none cursor-pointer focus:ring-2 focus:ring-amber-200 transition-all uppercase'
                        >
                          <option value="pending">Reviewing</option>
                          <option value="confirmed">Confirm</option>
                          <option value="cancelled">Reject</option>
                        </select>
                      ) : (
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {bookings.length === 0 && !loading && (
            <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <img src={assets.listIconColored} className="h-8 w-8 opacity-20 grayscale" alt="" />
                </div>
                <h3 className="text-xl font-black text-slate-800">No bookings yet</h3>
                <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm">Once customers start booking your cars, they will appear here for management.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageBooking
