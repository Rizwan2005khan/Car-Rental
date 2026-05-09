import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const KYCVerification = () => {
  const { axios, user, navigate } = useAppContext()

  const [kyc, setKyc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [cnic, setCnic] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [frontPreview, setFrontPreview] = useState(null)
  const [backPreview, setBackPreview] = useState(null)
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)

  const fetchKYCStatus = async () => {
    try {
      const { data } = await axios.get('/api/kyc/status')
      if (data.success) {
        setKyc(data.kyc)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchKYCStatus()
    else setLoading(false)
  }, [user])

  const handleFileChange = (e, side) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (side === 'front') {
        setFrontPreview(reader.result)
        setFrontFile(file)
      } else {
        setBackPreview(reader.result)
        setBackFile(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!frontFile || !backFile) {
      toast.error('Please upload both front and back of your license')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('cnic', cnic)
      formData.append('licenseNumber', licenseNumber)
      formData.append('licenseFront', frontFile)
      formData.append('licenseBack', backFile)

      const { data } = await axios.post('/api/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.success) {
        toast.success(data.message)
        fetchKYCStatus()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Format CNIC with dashes as user types
  const formatCNIC = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 13)
    if (digits.length <= 5) return digits
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16">
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-slate-100 max-w-md">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Login Required</h2>
          <p className="text-slate-500 mt-2">You need to login to verify your identity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-5 pb-16">
      <div className="container mx-auto px-6 max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {/* <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="text-2xl">🪪</span>
          </div> */}
          <h1 className="text-3xl font-black text-slate-800">Identity Verification</h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Verify your identity to unlock car bookings. We keep your documents safe and encrypted.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Already Verified */}
          {kyc?.status === 'verified' && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 text-center border border-emerald-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-emerald-700">Verified ✓</h2>
              <p className="text-slate-500 mt-2">Your identity is verified. You can now book any car on the platform.</p>
              <div className="mt-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                CNIC: {kyc.cnic?.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')}
              </div>
              <div className="mt-8">
                <button onClick={() => navigate('/cars')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-all">
                  Browse Cars →
                </button>
              </div>
            </motion.div>
          )}

          {/* Pending Review */}
          {kyc?.status === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 text-center border border-amber-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-amber-700">Under Review</h2>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                Your documents have been submitted and are being reviewed. This usually takes 24-48 hours.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC</p>
                  <p className="text-sm font-bold text-slate-700">{kyc.cnic?.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License</p>
                  <p className="text-sm font-bold text-slate-700">{kyc.licenseNumber}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                {kyc.licenseFrontImage && (
                  <img src={kyc.licenseFrontImage} alt="License Front" className="w-32 h-20 object-cover rounded-xl border border-slate-200" />
                )}
                {kyc.licenseBackImage && (
                  <img src={kyc.licenseBackImage} alt="License Back" className="w-32 h-20 object-cover rounded-xl border border-slate-200" />
                )}
              </div>
            </motion.div>
          )}

          {/* Rejected */}
          {kyc?.status === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 border border-red-100 shadow-sm"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-red-700">Verification Failed</h2>
                <p className="text-slate-500 mt-2">Your KYC submission was rejected.</p>
                {kyc.rejectionReason && (
                  <div className="mt-4 bg-red-50 text-red-700 px-5 py-3 rounded-xl text-sm font-semibold inline-block">
                    Reason: {kyc.rejectionReason}
                  </div>
                )}
                <p className="text-slate-400 text-sm mt-4">You can re-submit your documents below.</p>
              </div>
            </motion.div>
          )}

          {/* Submission Form — show when status is none or rejected */}
          {(!kyc || kyc.status === 'none' || kyc.status === 'rejected') && (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ${kyc?.status === 'rejected' ? 'mt-6' : ''}`}
            >
              {/* Step Indicator */}
              <div className="bg-gradient-to-r from-primary to-blue-700 px-8 py-6 text-white">
                <h2 className="text-lg font-black">Submit Your Documents</h2>
                <p className="text-slate-400 text-sm text-white mt-1">All fields are required. Your data is encrypted and secure.</p>
              </div>

              <div className="p-8 space-y-8">

                {/* Personal Info */}
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">CNIC Number</label>
                      <input
                        type="text"
                        value={cnic}
                        onChange={(e) => setCnic(formatCNIC(e.target.value))}
                        placeholder="12345-1234567-1"
                        maxLength={15}
                        required
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 font-semibold placeholder:text-slate-300"
                      />
                      <p className="text-xs text-slate-400 mt-1.5">13-digit National Identity Card number</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Driver's License Number</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. PSH-2024-00123"
                        required
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 font-semibold placeholder:text-slate-300"
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Your valid Pakistani driving license number</p>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                    License Photos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Front */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Front Side</label>
                      <label className="relative flex flex-col items-center justify-center h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden">
                        {frontPreview ? (
                          <img src={frontPreview} alt="Front" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10">
                              <svg className="w-6 h-6 text-slate-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-slate-400">Click to upload front</p>
                            <p className="text-[10px] text-slate-300 mt-0.5">JPG, PNG — Max 5MB</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
                        {frontPreview && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                            <p className="text-white text-xs font-bold">Click to change</p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Back */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Back Side</label>
                      <label className="relative flex flex-col items-center justify-center h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden">
                        {backPreview ? (
                          <img src={backPreview} alt="Back" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10">
                              <svg className="w-6 h-6 text-slate-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-slate-400">Click to upload back</p>
                            <p className="text-[10px] text-slate-300 mt-0.5">JPG, PNG — Max 5MB</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} className="hidden" />
                        {backPreview && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                            <p className="text-white text-xs font-bold">Click to change</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-blue-700">Your data is safe</p>
                    <p className="text-xs text-blue-500 mt-0.5">Documents are encrypted and only accessible to authorized administrators for verification purposes.</p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading Documents...
                    </span>
                  ) : (
                    'Submit for Verification →'
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default KYCVerification
