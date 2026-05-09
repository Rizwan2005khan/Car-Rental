import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

// Lazy-load map so Leaflet (which needs `window`) never runs on SSR
const CarMap = lazy(() => import('../components/CarMap'))

const Cars = () => {
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const { cars, axios, currency } = useAppContext()

  const [input, setInput] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [showFilters, setShowFilters] = useState(false)
  
  // Advanced Filter States
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTransmissions, setSelectedTransmissions] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000)

  const isSearchData = pickupLocation && pickupDate && returnDate 
  const [filteredCars, setFilteredCars] = useState([])

  // Extract unique brands and categories for filters
  const brands = useMemo(() => [...new Set(cars.map(car => car.brand))], [cars])
  const categories = useMemo(() => [...new Set(cars.map(car => car.category))], [cars])

  const toggleFilter = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const applyFilters = () => {
    let tempCars = cars.slice()

    // Text Search
    if (input) {
      tempCars = tempCars.filter(car => 
        car.brand.toLowerCase().includes(input.toLowerCase()) ||
        car.model.toLowerCase().includes(input.toLowerCase()) ||
        car.category.toLowerCase().includes(input.toLowerCase())
      )
    }

    // Brand Filter
    if (selectedBrands.length > 0) {
      tempCars = tempCars.filter(car => selectedBrands.includes(car.brand))
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      tempCars = tempCars.filter(car => selectedCategories.includes(car.category))
    }

    // Transmission Filter
    if (selectedTransmissions.length > 0) {
      tempCars = tempCars.filter(car => selectedTransmissions.includes(car.transmission))
    }

    // Price Filter
    tempCars = tempCars.filter(car => car.pricePerDay <= maxPrice)

    setFilteredCars(tempCars)
  }

  const searchCarAvailability = async () => {
    try {
      const {data} = await axios.post('/api/bookings/check-availability', {location: pickupLocation, pickupDate, returnDate})
      if(data.success){
        setFilteredCars(data.availableCars)
        if(data.availableCars.length === 0){
          toast.error('No cars available for these dates')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if(isSearchData) {
      searchCarAvailability()
    }
  }, [pickupLocation, pickupDate, returnDate])

  useEffect(() => {
    if (cars.length > 0 && !isSearchData) {
      applyFilters()
    }
  }, [input, cars, selectedBrands, selectedCategories, selectedTransmissions, maxPrice])

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero / Header Section */}
      <div className="bg-white border-b border-slate-100 pt-16 pb-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Discover Premium Rides</h1>
              <p className="text-slate-500 mt-2">Explore our collection of {cars.length} professional vehicles</p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                List View
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.382V7.553a2 2 0 011.106-1.789L9 3m0 17l9.927-4.136a2 2 0 001.073-1.789V5.136a2 2 0 00-1.073-1.789L9 3m0 17V3" /></svg>
                Map View
              </button>
            </div>
          </motion.div>

          <div className="mt-10 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <input 
                onChange={(e) => setInput(e.target.value)} 
                value={input} 
                placeholder='Search make, model...' 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 py-4 px-12 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 font-medium" 
              />
              <img src={assets.search_icon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold border transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <img src={assets.filter_icon} alt="" className={`w-5 h-5 ${showFilters ? 'brightness-0 invert' : ''}`} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Price Range */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                Price per day
                <span className="text-primary font-black text-sm">{currency}{maxPrice}</span>
              </h3>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{currency}0</span>
                <span>{currency}2000</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Brands</h3>
              <div className="space-y-3">
                {brands.map((brand, i) => (
                  <label key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 appearance-none rounded-md border border-slate-200 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transmission Filter */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Transmission</h3>
              <div className="flex flex-wrap gap-2">
                {['Automatic', 'Manual'].map((type, i) => (
                  <button 
                    key={i}
                    onClick={() => toggleFilter(type, selectedTransmissions, setSelectedTransmissions)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedTransmissions.includes(type) ? 'bg-primary text-white border-primary' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Category</h3>
              <div className="space-y-3">
                {categories.map((cat, i) => (
                  <label key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 appearance-none rounded-md border border-slate-200 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-800">{filteredCars.length}</span> Results
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Sort By:</span>
                <select className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer">
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'list' ? (
                <motion.div 
                  key="list-view"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredCars.map((car, index) => (
                    <motion.div
                      layout
                      initial={{opacity: 0, scale: 0.95}}
                      animate={{opacity: 1, scale: 1}}
                      transition={{duration: 0.3, delay: index * 0.05}}
                      key={car._id || index}
                    >
                      <CarCard car={car} />
                    </motion.div>
                  ))}
                  {filteredCars.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">No cars match your filters</h3>
                      <p className="text-slate-500 mt-1">Try adjusting your filters or search terms</p>
                      <button onClick={() => {setInput(''); setSelectedBrands([]); setSelectedCategories([]); setSelectedTransmissions([]); setMaxPrice(2000)}} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="map-view"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                >
                  <Suspense fallback={
                    <div className="h-[650px] w-full rounded-3xl bg-slate-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm font-bold text-slate-500">Loading Map...</p>
                      </div>
                    </div>
                  }>
                    <CarMap cars={filteredCars} currency={currency} />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Cars
