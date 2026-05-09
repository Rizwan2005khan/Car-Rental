import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const normalizeFuelType = (fuelType = '') => {
  if (fuelType === 'Gas') return 'Petrol'
  return fuelType
}

const normalizeTransmission = (transmission = '') => {
  if (transmission === 'Semi-Automatic') return 'Automatic'
  return transmission
}

const PriceAdvisor = ({ car, onApplyPrice }) => {
  const { axios } = useAppContext()

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [visible, setVisible] = useState(false)
  const [demandLevel, setDemandLevel] = useState('Normal')

  const handlePredict = async () => {
    if (!car.brand || !car.model || !car.year || !car.fuel_type || !car.transmission) {
      toast.error('Fill in Brand, Model, Year, Fuel Type and Transmission first')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const { data } = await axios.post('/api/ai/predict-price', {
        brand: car.brand,
        model: car.model,
        year: Number(car.year),
        fuel_type: normalizeFuelType(car.fuel_type),
        transmission: normalizeTransmission(car.transmission),
        mileage: Number(car.mileage) || 0,
        demand_level: demandLevel
      })

      if (data.success) {
        setResult(data.prediction)
        setVisible(true)
      } else {
        toast.error(data.message || 'Prediction failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'ML service is offline.')
    } finally {
      setLoading(false)
    }
  }

  const gaugePercent = result
    ? Math.round(((result.optimal - result.min) / Math.max(result.max - result.min, 1)) * 100)
    : 50

  return (
    <div className="mt-6 border border-blue-100 rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md text-white font-black text-xs">AI</span>
          <h3 className="text-white font-bold text-sm">Smart Price Advisor v2.0</h3>
        </div>
        <div className="flex items-center gap-2">
            <select 
                value={demandLevel} 
                onChange={(e) => setDemandLevel(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[10px] font-bold text-white outline-none cursor-pointer"
            >
                <option value="Normal" className="text-slate-800">Normal Demand</option>
                <option value="High" className="text-slate-800">Weekend Surge</option>
                <option value="Holiday" className="text-slate-800">Holiday Special</option>
                <option value="Low" className="text-slate-800">Off-Season</option>
            </select>
            <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                className="bg-white text-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
                {loading ? 'Analyzing...' : 'Predict'}
            </button>
        </div>
      </div>

      <div className="p-5">
        {!visible && (
            <p className="text-xs text-slate-400 text-center py-4 italic">Select market demand and click predict to get AI suggestions</p>
        )}

        {visible && result && (
            <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Daily Rate</p>
                        <p className="text-3xl font-black text-slate-800">
                            <span className="text-primary mr-1">$</span>
                            {result.optimal.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${result.confidence * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{Math.round(result.confidence * 100)}%</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                        <span>MIN ${result.min.toLocaleString()}</span>
                        <span className="text-indigo-600">IDEAL RANGE</span>
                        <span>MAX ${result.max.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full">
                        <div className="absolute inset-y-0 left-[10%] right-[10%] bg-indigo-100 rounded-full"></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md transition-all duration-700"
                            style={{ left: `calc(${gaugePercent}% - 8px)` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onApplyPrice(result.optimal)}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-slate-200 active:scale-[0.98]"
                    >
                        Apply AI Price
                    </button>
                    <div className="px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase leading-none mb-1">Status</p>
                        <p className="text-xs font-bold text-blue-800 whitespace-nowrap">{demandLevel} pricing applied</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default PriceAdvisor
