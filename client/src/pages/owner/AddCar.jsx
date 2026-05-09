import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import PriceAdvisor from '../../components/owner/PriceAdvisor'
import { motion } from 'motion/react'

const AddCar = () => {

  const { axios, currency } = useAppContext()

  const [image, setImage] = useState(null)
  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    pricePerDay: '',
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: '',
    location: '',
    description: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return null

    if (!image) {
      toast.error("Please upload a vehicle image")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('carData', JSON.stringify((car)))

      const { data } = await axios.post('/api/owner/add-car', formData)

      if (data.success) {
        toast.success(data.message)
        setImage(null)
        setCar({
          brand: '',
          model: '',
          year: '',
          mileage: '',
          pricePerDay: '',
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: '',
          location: '',
          description: '',
        })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='px-6 py-10 md:px-12 flex-1 bg-[#F8FAFC] min-h-screen'>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <Title 
          title="List New Vehicle" 
          subTitle="Expand your fleet by adding a new vehicle. Provide accurate details to attract more high-quality bookings." 
        />
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-full border border-blue-100">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
           <span className="text-[10px] font-black uppercase tracking-widest">Fleet Growth Mode</span>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Basic Identity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-primary rounded-lg flex items-center justify-center text-xs">01</div>
              Vehicle Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Car Brand</label>
                <input 
                  type="text" 
                  placeholder='e.g. BMW, Mercedes, Audi...' 
                  required 
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all font-bold text-slate-700" 
                  value={car.brand} 
                  onChange={e => setCar({...car, brand: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model Name</label>
                <input 
                  type="text" 
                  placeholder='e.g. X5, E-Class, M4...' 
                  required 
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all font-bold text-slate-700" 
                  value={car.model} 
                  onChange={e => setCar({...car, model: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Description</label>
              <textarea 
                rows={4} 
                placeholder='Highlight the premium features and condition of your car...' 
                required 
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-600 resize-none" 
                value={car.description} 
                onChange={e => setCar({...car, description: e.target.value})}
              ></textarea>
            </div>
          </motion.div>

          {/* Section 2: Technical Specs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs">02</div>
              Technical Specifications
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Year", key: "year", type: "number", placeholder: "2024" },
                { label: "Mileage", key: "mileage", type: "number", placeholder: "15000" },
                { label: "Seats", key: "seating_capacity", type: "number", placeholder: "5" },
                { label: "Location", key: "location", type: "select", options: ["New York", "Los Angeles", "Houston", "Chicago", "Austin"] }
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                   {field.type === 'select' ? (
                     <select 
                        required 
                        className="w-full bg-slate-50 border border-slate-100 px-3 py-3 rounded-xl outline-none focus:border-primary transition-all font-bold text-slate-700 text-sm cursor-pointer"
                        value={car[field.key]} 
                        onChange={e => setCar({...car, [field.key]: e.target.value})}
                     >
                        <option value="">Select</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                   ) : (
                     <input 
                        type={field.type} 
                        placeholder={field.placeholder} 
                        required 
                        className="w-full bg-slate-50 border border-slate-100 px-3 py-3 rounded-xl outline-none focus:border-primary transition-all font-bold text-slate-700 text-sm" 
                        value={car[field.key]} 
                        onChange={e => setCar({...car, [field.key]: e.target.value})}
                      />
                   )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
               {[
                 { label: "Category", key: "category", options: ["Luxury", "SUV", "Sedan", "Sport", "Electric"] },
                 { label: "Transmission", key: "transmission", options: ["Automatic", "Manual"] },
                 { label: "Fuel System", key: "fuel_type", options: ["Petrol", "Diesel", "Electric", "Hybrid"] }
               ].map((field) => (
                 <div key={field.key} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <select 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all font-bold text-slate-700 text-sm cursor-pointer"
                      value={car[field.key]} 
                      onChange={e => setCar({...car, [field.key]: e.target.value})}
                    >
                      <option value="">Choose Option</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>

        {/* Right Section: Media & Action */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section 3: Media */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xs">03</div>
              Media Assets
            </h3>
            
            <div className="relative group">
              <label 
                htmlFor="car-image" 
                className={`flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${image ? 'border-primary bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-primary hover:bg-blue-50'}`}
              >
                {image ? (
                  <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <img src={assets.upload_icon} alt="" className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Click to upload image</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input type="file" id='car-image' accept='image/*' hidden onChange={e => setImage(e.target.files[0])} />
              </label>
              {image && (
                <button 
                  type="button" 
                  onClick={() => setImage(null)} 
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </motion.div>

          {/* Section 4: Pricing */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs">04</div>
              Revenue Strategy
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-11">Pricing & Market Position</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Base Rate ({currency})</label>
                <input 
                  type="number" 
                  placeholder='0' 
                  required 
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-4 rounded-xl outline-none focus:border-primary transition-all text-2xl font-black text-slate-800" 
                  value={car.pricePerDay} 
                  onChange={e => setCar({...car, pricePerDay: e.target.value})}
                />
              </div>

              {/* AI Integration */}
              <PriceAdvisor
                car={car}
                onApplyPrice={(price) => {
                  setCar({...car, pricePerDay: price})
                  toast.success(`Market-competitive rate $${price} applied!`)
                }}
              />
            </div>

            <button 
              disabled={isLoading}
              className='w-full bg-primary hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest mt-10 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98]'
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <img src={assets.tick_icon} alt="" className="h-4 brightness-0 invert" />
              )}
              {isLoading ? 'Processing...' : 'Activate Listing'}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-tighter">Your car will be live instantly after submission</p>
          </motion.div>
        </div>
      </form>
    </div>
  )
}

export default AddCar
