import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const AllFleet = () => {
  const { axios, currency } = useAppContext()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchAllFleet = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/cars')
      if (data.success) setCars(data.cars)
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteCar = async (carId, name) => {
    if (!window.confirm(`Permanently remove "${name}" and all its booking history from the platform?`)) return
    try {
      const { data } = await axios.post('/api/admin/delete-car', { carId })
      if (data.success) { toast.success(data.message); fetchAllFleet() }
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  useEffect(() => { fetchAllFleet() }, [])

  const filtered = cars.filter(c => {
    const matchSearch = `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.owner?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'available' ? c.isAvailable : !c.isAvailable)
    return matchSearch && matchFilter
  })

  const totalRevenuePotential = cars.reduce((acc, c) => acc + c.pricePerDay, 0)

  const stats = [
    { label: 'Total Listings', value: cars.length, icon: '🚗' },
    { label: 'Active Now', value: cars.filter(c => c.isAvailable).length, icon: '✅' },
    { label: 'Daily Potential', value: `${currency}${totalRevenuePotential.toLocaleString()}`, icon: '💰' },
  ]

  const categoryColors = {
    SUV: 'bg-blue-50 text-blue-700',
    Sedan: 'bg-violet-50 text-violet-700',
    Luxury: 'bg-amber-50 text-amber-700',
    Sport: 'bg-red-50 text-red-700',
    Electric: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <div className="flex-1 bg-[#F4F6FA] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">System Control · Fleet Oversight</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Global Fleet Registry</h1>
            <p className="text-slate-400 mt-1.5 text-sm">Complete inventory of all vehicles listed across the platform by all fleet owners.</p>
          </div>
          <div className="flex gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[100px]">
                <p className="text-lg mb-1">{s.icon}</p>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by car name or owner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-semibold text-slate-700 placeholder-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {[['all', 'All'], ['available', 'Live'], ['unavailable', 'Hidden']].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === val ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                  <div className="h-8 bg-slate-50 rounded-2xl mt-4" />
                </div>
              </div>
            )) : filtered.map((car, i) => (
              <motion.div
                key={car._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={car.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-sm ${car.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-slate-600/90 text-white'}`}>
                      {car.isAvailable ? '● Live' : '● Hidden'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${categoryColors[car.category] || 'bg-slate-50 text-slate-600'}`}>
                      {car.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-white font-black text-lg leading-none drop-shadow">{car.brand}</p>
                      <p className="text-white/80 font-bold text-sm">{car.model} · {car.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xl leading-none">{currency}{car.pricePerDay}</p>
                      <p className="text-white/70 text-[10px] font-bold">per day</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={car.owner?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(car.owner?.name || 'Unknown')}&background=E2E8F0&color=64748B&bold=true`}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover border border-slate-100"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-700">{car.owner?.name || 'Unknown Owner'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{car.owner?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold text-slate-400 mb-4">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">{car.transmission}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">{car.fuel_type}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">{car.seating_capacity} Seats</span>
                  </div>
                  <button
                    onClick={() => deleteCar(car._id, `${car.brand} ${car.model}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remove from Platform
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-dashed border-slate-200">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>
            </div>
            <p className="font-black text-slate-400 text-sm">No vehicles found</p>
          </div>
        )}
        <p className="text-center text-xs text-slate-300 font-bold mt-6">{filtered.length} of {cars.length} vehicles shown</p>
      </div>
    </div>
  )
}

export default AllFleet
