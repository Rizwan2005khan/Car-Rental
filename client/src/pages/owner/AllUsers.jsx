import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { assets } from '../../assets/assets'

const AllUsers = () => {
  const { axios } = useAppContext()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/users')
      if (data.success) setUsers(data.users)
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Remove "${name}" and all their data from the platform?`)) return
    try {
      const { data } = await axios.post('/api/admin/delete-user', { userId })
      if (data.success) { toast.success(data.message); fetchAllUsers() }
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  useEffect(() => { fetchAllUsers() }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.role === filter
    return matchSearch && matchFilter
  })

  const stats = [
    { label: 'Total Users', value: users.length, color: 'bg-blue-600' },
    { label: 'Fleet Owners', value: users.filter(u => u.role === 'owner').length, color: 'bg-violet-600' },
    { label: 'Customers', value: users.filter(u => u.role === 'user').length, color: 'bg-emerald-600' },
  ]

  return (
    <div className="flex-1 bg-[#F4F6FA] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-violet-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div>
            <p className="text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">System Control · User Management</p>
            <h1 className="text-3xl font-black text-white tracking-tight">User Directory</h1>
            <p className="text-slate-400 mt-1.5 text-sm">Platform-wide visibility of all registered members and their access levels.</p>
          </div>
          <div className="flex gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1.5`} />
                <p className="text-2xl font-black text-white">{s.value}</p>
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
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-semibold text-slate-700 placeholder-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {[['all', 'All Roles'], ['user', 'Customers'], ['owner', 'Owners']].map(([val, lbl]) => (
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

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Role</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Joined</th>
                <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-5"><div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" /><div className="space-y-2"><div className="w-32 h-3 bg-slate-100 rounded-full animate-pulse" /><div className="w-48 h-2 bg-slate-50 rounded-full animate-pulse" /></div></div></td>
                      <td className="px-6 py-5 hidden md:table-cell"><div className="w-16 h-5 bg-slate-100 rounded-full animate-pulse" /></td>
                      <td className="px-6 py-5 hidden lg:table-cell"><div className="w-20 h-3 bg-slate-100 rounded-full animate-pulse" /></td>
                      <td className="px-8 py-5 text-right"><div className="w-8 h-8 bg-slate-100 rounded-xl animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=E2E8F0&color=64748B&bold=true`}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === 'owner' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-xs font-semibold text-slate-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => deleteUser(u._id, u.name)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center ml-auto transition-all"
                        title="Remove user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-dashed border-slate-200">
                <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p className="font-black text-slate-400 text-sm">No users found</p>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-300 font-bold mt-4">{filtered.length} of {users.length} users shown</p>
      </div>
    </div>
  )
}

export default AllUsers
