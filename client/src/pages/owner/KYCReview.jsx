import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const KYCReview = () => {
  const { axios } = useAppContext()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending | all
  const [selectedUser, setSelectedUser] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchSubmissions = async () => {
    try {
      const endpoint = filter === 'pending' ? '/api/kyc/pending' : '/api/kyc/all'
      const { data } = await axios.get(endpoint)
      if (data.success) {
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchSubmissions()
  }, [filter])

  const handleReview = async (userId, action) => {
    setProcessing(true)
    try {
      const { data } = await axios.post('/api/kyc/review', {
        userId,
        action,
        rejectionReason: action === 'reject' ? rejectReason : ''
      })

      if (data.success) {
        toast.success(data.message)
        setSelectedUser(null)
        setRejectReason('')
        fetchSubmissions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black border ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
        {status?.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">KYC Verification Center</h1>
          <p className="text-slate-500 text-sm mt-1">Review and verify user identity documents</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
          >
            📋 All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: submissions.filter(s => s.kyc?.status === 'pending').length, color: 'from-amber-500 to-orange-500', icon: '⏳' },
          { label: 'Verified', value: submissions.filter(s => s.kyc?.status === 'verified').length, color: 'from-emerald-500 to-green-600', icon: '✅' },
          { label: 'Rejected', value: submissions.filter(s => s.kyc?.status === 'rejected').length, color: 'from-red-500 to-rose-600', icon: '❌' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{filter === 'all' ? stat.value : (i === 0 ? submissions.length : '—')}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && submissions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {filter === 'pending' ? 'No pending submissions' : 'No KYC submissions yet'}
          </h3>
          <p className="text-slate-500 mt-1">
            {filter === 'pending' ? 'All submissions have been reviewed!' : 'Users haven\'t submitted KYC documents yet.'}
          </p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {submissions.map((user, i) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* User Header Row */}
                <div
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center text-lg font-black text-white overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <div className="text-right mr-2">
                      <p className="text-xs font-bold text-slate-400">CNIC</p>
                      <p className="text-sm font-semibold text-slate-600">
                        {user.kyc?.cnic?.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')}
                      </p>
                    </div>
                    {statusBadge(user.kyc?.status)}
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${selectedUser?._id === user._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedUser?._id === user._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-slate-100 pt-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Info */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNIC</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">
                                  {user.kyc?.cnic?.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')}
                                </p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License #</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">{user.kyc?.licenseNumber}</p>
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted</p>
                              <p className="text-sm font-bold text-slate-700 mt-1">
                                {user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleString('en-PK') : 'N/A'}
                              </p>
                            </div>

                            {/* Action Buttons — only for pending */}
                            {user.kyc?.status === 'pending' && (
                              <div className="space-y-3 pt-2">
                                <button
                                  disabled={processing}
                                  onClick={() => handleReview(user._id, 'approve')}
                                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                  ✅ Approve & Verify
                                </button>
                                <div>
                                  <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Rejection reason (optional)"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-red-300 mb-2"
                                  />
                                  <button
                                    disabled={processing}
                                    onClick={() => handleReview(user._id, 'reject')}
                                    className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                  >
                                    ❌ Reject
                                  </button>
                                </div>
                              </div>
                            )}

                            {user.kyc?.status === 'rejected' && user.kyc?.rejectionReason && (
                              <div className="bg-red-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Rejection Reason</p>
                                <p className="text-sm font-semibold text-red-600 mt-1">{user.kyc.rejectionReason}</p>
                              </div>
                            )}
                          </div>

                          {/* Document Images */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License Documents</p>
                            {user.kyc?.licenseFrontImage && (
                              <div>
                                <p className="text-xs font-bold text-slate-500 mb-1">Front Side</p>
                                <img
                                  src={user.kyc.licenseFrontImage}
                                  alt="License Front"
                                  className="w-full h-40 object-cover rounded-xl border border-slate-200 cursor-pointer hover:scale-[1.02] transition-all"
                                  onClick={() => window.open(user.kyc.licenseFrontImage, '_blank')}
                                />
                              </div>
                            )}
                            {user.kyc?.licenseBackImage && (
                              <div>
                                <p className="text-xs font-bold text-slate-500 mb-1">Back Side</p>
                                <img
                                  src={user.kyc.licenseBackImage}
                                  alt="License Back"
                                  className="w-full h-40 object-cover rounded-xl border border-slate-200 cursor-pointer hover:scale-[1.02] transition-all"
                                  onClick={() => window.open(user.kyc.licenseBackImage, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default KYCReview
