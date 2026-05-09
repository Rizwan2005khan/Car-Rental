import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title as ChartTitle,
  Tooltip,
} from 'chart.js'
import Title from '../components/Title'
import PriceAdvisor from '../components/owner/PriceAdvisor'
import { useAppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'motion/react'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  ChartTitle,
  Tooltip
)

const initialCarState = {
  brand: '',
  model: '',
  year: '',
  mileage: '',
  transmission: '',
  fuel_type: '',
}

const AIPriceAdvisor = () => {
  const { axios } = useAppContext()
  const [car, setCar] = useState(initialCarState)
  const [appliedPrice, setAppliedPrice] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loadingInsights, setLoadingInsights] = useState(true)
  
  // Sentiment Analysis State
  const [reviewText, setReviewText] = useState('')
  const [sentimentResult, setSentimentResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const updateField = (field, value) => {
    setCar((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnalyzeSentiment = async () => {
    if (!reviewText.trim()) return
    setAnalyzing(true)
    try {
      const { data } = await axios.post('/api/ai/analyze-review', { text: reviewText })
      if (data.success) {
        setSentimentResult(data)
      }
    } catch (error) {
      toast.error("Sentiment analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await axios.get('/api/ai/insights')
        if (data.success) {
          setInsights(data)
        }
      } catch (error) {
        console.error("Failed to load training insights")
      } finally {
        setLoadingInsights(false)
      }
    }
    fetchInsights()
  }, [axios])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(241, 245, 249, 1)', drawBorder: false },
        ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' }
      }
    }
  }

  const yearlyTrendData = insights && {
    labels: insights.charts.yearlyTrend.map((item) => item.year),
    datasets: [{
      label: 'Avg Rate',
      data: insights.charts.yearlyTrend.map((item) => item.avgDailyRate),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
    }]
  }

  const brandData = insights && {
    labels: insights.charts.topBrands.map((item) => item.brand),
    datasets: [{
      data: insights.charts.topBrands.map((item) => item.avgDailyRate),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      barThickness: 20
    }]
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="bg-white border-b border-slate-100 pt-16 pb-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
             <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <span className="bg-primary text-white px-3 py-1 rounded-2xl text-xl">AI</span>
               Market Intelligence
             </h1>
             <p className="text-slate-500 mt-2 max-w-2xl font-medium">
               Leverage our trained machine learning models to optimize your pricing strategy and understand market trends through real-time data analysis.
             </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Price Prediction */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                Rate Predictor
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Brand", key: "brand", type: "text", placeholder: "e.g. BMW" },
                  { label: "Model", key: "model", type: "text", placeholder: "e.g. X5" },
                  { label: "Year", key: "year", type: "number", placeholder: "2023" },
                  { label: "Mileage", key: "mileage", type: "number", placeholder: "0" }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={car[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold text-slate-700"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Transmission</label>
                  <select
                    value={car.transmission}
                    onChange={(e) => updateField('transmission', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Fuel Type</label>
                  <select
                    value={car.fuel_type}
                    onChange={(e) => updateField('fuel_type', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <PriceAdvisor
                car={car}
                onApplyPrice={(price) => {
                  setAppliedPrice(price)
                  toast.success(`Suggested rate $${price} noted`)
                }}
              />
            </div>

            {/* Sentiment Check */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                Sentiment Vibe Check
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Real-time Review Analysis</p>
              
              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste customer feedback here to analyze the vibe..."
                className="w-full h-24 bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-medium text-slate-600 mb-4 resize-none"
              ></textarea>
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleAnalyzeSentiment}
                  disabled={analyzing || !reviewText.trim()}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Vibe'}
                </button>
                
                <AnimatePresence>
                  {sentimentResult && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${sentimentResult.sentiment === 'Positive' ? 'bg-green-50 border-green-100 text-green-700' : sentimentResult.sentiment === 'Negative' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                    >
                      <span className="text-xs font-black uppercase tracking-tighter">{sentimentResult.vibe}</span>
                      <span className="text-[10px] font-bold opacity-60">{Math.round(sentimentResult.confidence * 100)}% Match</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Insights & Charts */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mb-2">Training Intelligence</p>
                <h2 className="text-3xl font-black tracking-tight">Dataset DNA Overview</h2>
                <p className="mt-2 text-slate-400 text-sm max-w-md font-medium leading-relaxed">
                  These insights are derived from the foundational dataset used to train our pricing engine.
                </p>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Data Points", value: insights?.summary.records || '...', color: "text-blue-400" },
                    { label: "Car Brands", value: insights?.summary.brands || '...', color: "text-indigo-400" },
                    { label: "Unique Models", value: insights?.summary.models || '...', color: "text-purple-400" },
                    { label: "Global Avg", value: `$${insights?.summary.avg_daily_rate || '...'}`, color: "text-emerald-400" }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Yearly Market Trend</h3>
                <div className="h-60">
                  {insights && <Line data={yearlyTrendData} options={chartOptions} />}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Brand Competitiveness</h3>
                <div className="h-60">
                  {insights && <Bar data={brandData} options={chartOptions} />}
                </div>
              </div>
            </div>

            {insights && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">AI Note</h4>
                  <p className="text-xs font-medium text-blue-700/70 mt-1 leading-relaxed">
                    {insights.notes.timeGranularity} Consider that seasonal factors and regional popularity may shift these averages by up to 20%.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPriceAdvisor
