import React from 'react'
import { useAppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const NavbarOwner = () => {
  const { user, isSuperAdmin } = useAppContext()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0">
      <div>
        <p className="text-xs text-slate-400 font-semibold hidden md:block">{greeting}, <span className="font-black text-slate-700">{user?.name?.split(' ')[0] || 'Admin'}</span></p>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest hidden md:block">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isSuperAdmin && (
          <div className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Super Admin</span>
          </div>
        )}
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all border border-slate-100"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="hidden sm:block">View Site</span>
        </Link>
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-slate-100">
          <img
            src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=E2E8F0&color=64748B&bold=true`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}

export default NavbarOwner
