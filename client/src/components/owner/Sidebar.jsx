import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const NavItem = ({ to, end = false, icon, label, activeColor = 'blue' }) => {
  const colors = {
    blue: { active: 'bg-blue-600 text-white shadow-lg shadow-blue-200', hover: 'hover:bg-blue-50 hover:text-blue-700 text-slate-500' },
    violet: { active: 'bg-violet-600 text-white shadow-lg shadow-violet-200', hover: 'hover:bg-violet-50 hover:text-violet-700 text-slate-500' },
    dark: { active: 'bg-slate-800 text-white shadow-lg shadow-slate-200', hover: 'hover:bg-slate-100 hover:text-slate-800 text-slate-500' },
  }
  const c = colors[activeColor] || colors.blue
  return (
    <NavLink to={to} end={end} className={({ isActive }) =>
      `flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-bold ${isActive ? c.active : c.hover}`
    }>
      {({ isActive }) => (
        <>
          <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? 'text-white' : ''}`}>{icon}</span>
          <span className="hidden md:block">{label}</span>
        </>
      )}
    </NavLink>
  )
}

const SectionLabel = ({ children }) => (
  <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-300 uppercase tracking-[0.35em] hidden md:block">{children}</p>
)

const Sidebar = () => {
  const { user, axios, fetchUser, isSuperAdmin, logout } = useAppContext()
  const [imageFile, setImageFile] = useState(null)

  const updateImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await axios.post('/api/owner/update-image', formData)
      if (data.success) { fetchUser(); toast.success('Profile updated') }
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const Icons = {
    dashboard: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    addCar: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    cars: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>,
    bookings: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    ai: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    users: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    fleet: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    logout: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  }

  return (
    <aside className="w-[72px] md:w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-50 gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-black text-slate-900 leading-none">CarRental</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            {isSuperAdmin ? 'Super Admin' : 'Owner Portal'}
          </p>
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 py-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <label htmlFor="sidebar-img-upload" className="relative group cursor-pointer flex-shrink-0">
            <img
              src={user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'}
              alt=""
              className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-100 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-2xl transition-opacity">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            </div>
            <input type="file" id="sidebar-img-upload" hidden onChange={e => { const f = e.target.files[0]; if (f) updateImage(f) }} />
          </label>
          <div className="hidden md:block min-w-0">
            <p className="text-sm font-black text-slate-900 truncate leading-none">{user?.name || 'Admin'}</p>
            <span className={`inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-700'}`}>
              {isSuperAdmin ? '⚡ Super Admin' : 'Fleet Owner'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {isSuperAdmin ? (
          <>
            <SectionLabel>Overview</SectionLabel>
            <NavItem to="/owner" end icon={Icons.dashboard} label="Command Center" activeColor="dark" />

            <SectionLabel>Platform Control</SectionLabel>
            <NavItem to="/owner/all-users" icon={Icons.users} label="User Directory" activeColor="dark" />
            <NavItem to="/owner/all-fleet" icon={Icons.fleet} label="Global Fleet" activeColor="dark" />
            <NavItem to="/owner/manage-bookings" icon={Icons.bookings} label="All Bookings" activeColor="dark" />
            <NavItem to="/owner/kyc-review" icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} label="KYC Review" activeColor="dark" />

            <SectionLabel>Intelligence</SectionLabel>
            <NavItem to="/owner/ai-price-advisor" icon={Icons.ai} label="Market AI" activeColor="violet" />
          </>
        ) : (
          <>
            <SectionLabel>Overview</SectionLabel>
            <NavItem to="/owner" end icon={Icons.dashboard} label="Dashboard" activeColor="blue" />

            <SectionLabel>Fleet</SectionLabel>
            <NavItem to="/owner/add-car" icon={Icons.addCar} label="List New Car" activeColor="blue" />
            <NavItem to="/owner/manage-cars" icon={Icons.cars} label="Inventory" activeColor="blue" />
            <NavItem to="/owner/manage-bookings" icon={Icons.bookings} label="Bookings" activeColor="blue" />

            <SectionLabel>Intelligence</SectionLabel>
            <NavItem to="/owner/ai-price-advisor" icon={Icons.ai} label="AI Advisor" activeColor="violet" />
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-50 space-y-1">
        <Link to="/" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all text-sm font-bold">
          <span className="w-5 h-5 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </span>
          <span className="hidden md:block">Back to Site</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-bold"
        >
          <span className="w-5 h-5 flex-shrink-0">{Icons.logout}</span>
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
