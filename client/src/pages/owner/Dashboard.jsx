import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const StatCard = ({ title, value, icon, gradient, delay, prefix = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-400 group cursor-default"
  >
    <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-10 group-hover:opacity-15 transition-opacity ${gradient}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <div className="mt-4 flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span className="text-[10px] font-black">12.5%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">vs last month</span>
        </div>
      </div>
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="mt-5 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '68%' }}
        transition={{ delay: delay + 0.4, duration: 1.2, ease: 'easeOut' }}
        className={`h-full ${gradient}`}
      />
    </div>
  </motion.div>
)

const Dashboard = () => {
  const { axios, isOwner, isSuperAdmin, currency } = useAppContext()
  const [data, setData] = useState({
    totalCars: 0, totalBookings: 0, pendingBookings: 0,
    completeBookings: 0, recentBookings: [], monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const endpoint = isSuperAdmin ? '/api/admin/stats' : '/api/owner/dashboard'
      const { data: res } = await axios.get(endpoint)
      if (res.success) {
        if (isSuperAdmin) {
          setData({
            totalCars: res.stats.totalCars,
            totalBookings: res.stats.totalBookings,
            pendingBookings: res.stats.totalUsers,
            completeBookings: res.stats.totalOwners,
            recentBookings: [],
            monthlyRevenue: res.stats.totalRevenue,
          })
        } else {
          setData(res.dashboardData)
        }
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner || isSuperAdmin) fetchDashboardData()
  }, [isOwner, isSuperAdmin])

  const ownerCards = [
    { title: "Fleet Size", value: data.totalCars, gradient: "bg-gradient-to-br from-blue-500 to-blue-700", delay: 0, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg> },
    { title: "Total Bookings", value: data.totalBookings, gradient: "bg-gradient-to-br from-violet-500 to-purple-700", delay: 0.1, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { title: "Pending Actions", value: data.pendingBookings, gradient: "bg-gradient-to-br from-amber-400 to-orange-600", delay: 0.2, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: "Confirmed", value: data.completeBookings, gradient: "bg-gradient-to-br from-emerald-400 to-teal-600", delay: 0.3, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ]

  const adminCards = [
    { title: "Global Fleet", value: data.totalCars, gradient: "bg-gradient-to-br from-blue-500 to-blue-700", delay: 0, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg> },
    { title: "All Transactions", value: data.totalBookings, gradient: "bg-gradient-to-br from-violet-500 to-purple-700", delay: 0.1, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    { title: "Registered Users", value: data.pendingBookings, gradient: "bg-gradient-to-br from-rose-400 to-pink-600", delay: 0.2, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { title: "Fleet Owners", value: data.completeBookings, gradient: "bg-gradient-to-br from-emerald-400 to-teal-600", delay: 0.3, icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ]

  const cards = isSuperAdmin ? adminCards : ownerCards

  const statusStyle = (status) => {
    if (!status) return ''
    const s = status.toLowerCase()
    if (s === 'confirmed') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className='flex-1 bg-[#F4F6FA] min-h-screen'>
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                {isSuperAdmin ? 'System Online · All Services Active' : 'Fleet Management · Active'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {isSuperAdmin ? 'Command Center' : 'Executive Overview'}
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium max-w-lg">
              {isSuperAdmin
                ? 'Full platform governance. Real-time visibility across all users, assets, and financial flows.'
                : 'Monitor your rental business performance. Analyze metrics and take informed decisions.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Platform Revenue</p>
              <p className="text-2xl font-black text-white mt-1">
                <span className="text-blue-400 text-base mr-1">{currency}</span>
                {data.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <button onClick={fetchDashboardData} className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Recent Bookings</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Latest transaction activity</p>
              </div>
              <Link
                to="/owner/manage-bookings"
                className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {data.recentBookings.length > 0 ? data.recentBookings.slice(0, 5).map((booking, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-5 px-8 py-5 hover:bg-slate-50/50 transition-colors group"
                >
                  <img
                    src={booking.car.image}
                    alt=""
                    className="h-14 w-14 object-cover rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{booking.car.brand} {booking.car.model}</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900">{currency}{booking.price.toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div className="py-20 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-400">No recent bookings</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="space-y-5">
            {/* Revenue Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-7 text-white relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Yield</span>
                </div>
                <p className="text-4xl font-black tracking-tight">
                  <span className="text-blue-400 text-xl mr-1">{currency}</span>
                  {data.monthlyRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-black bg-emerald-400/10 px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    +14.2%
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">vs last month</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">This Week</p>
                    <p className="text-lg font-black text-white mt-1">{currency}{Math.round(data.monthlyRevenue * 0.24).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg/Day</p>
                    <p className="text-lg font-black text-white mt-1">{currency}{Math.round(data.monthlyRevenue / 30).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
            >
              <h3 className="text-sm font-black text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2.5">
                {(isSuperAdmin ? [
                  { label: 'User Directory', to: '/owner/all-users', color: 'from-slate-700 to-slate-900' },
                  { label: 'Global Fleet', to: '/owner/all-fleet', color: 'from-blue-600 to-indigo-700' },
                  { label: 'AI Intelligence', to: '/owner/ai-price-advisor', color: 'from-violet-600 to-purple-700' },
                ] : [
                  { label: 'Add New Car', to: '/owner/add-car', color: 'from-blue-600 to-indigo-700' },
                  { label: 'Manage Bookings', to: '/owner/manage-bookings', color: 'from-violet-600 to-purple-700' },
                  { label: 'AI Price Advisor', to: '/owner/ai-price-advisor', color: 'from-indigo-600 to-blue-700' },
                ]).map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className={`flex items-center justify-between bg-gradient-to-r ${item.color} text-white px-5 py-3.5 rounded-2xl hover:opacity-90 transition-opacity group`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
