import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { assets, dummyCarData } from '../assets/assets'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const PriceTracker = () => {
  const currency = import.meta.env.VITE_CURRENCY

  /* ---------- dummy historical data (12 months) ---------- */
  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ]
  const histPrices = months.map(() => 200 + Math.floor(Math.random() * 80)) // 200-280

  /* ---------- live “today” price (same engine we used) ---------- */
  const [livePrice, setLivePrice] = useState(histPrices[histPrices.length - 1])
  useEffect(() => {
    const id = setInterval(() => {
      setLivePrice(p => Math.max(150, p + (Math.floor(Math.random() * 11) - 5)))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  /* ---------- dummy prediction (next month) ---------- */
  const predict = livePrice + (Math.random() * 40 - 20) // ±20 $
  const nextMonthLabel = 'Next Month (AI pred.)'

  /* ---------- chart dataset ---------- */
  const data = {
    labels: [...months, nextMonthLabel],
    datasets: [
      {
        label: 'Average Selling Price',
        data: [...histPrices, predict],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: false } },
  }

  /* ---------- city cards ---------- */
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston']
  const cityCards = cities.map(c => ({
    city: c,
    price: livePrice + (Math.floor(Math.random() * 31) - 15), // ±15 $ spread
    change: (Math.random() * 8 - 4).toFixed(1),             // ±4 %
  }))

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16">
      <Title
        title="Car-Sell Price Tracker"
        subTitle="12-month historical prices, live today’s rate & AI prediction for next month across cities."
      />

      {/* ----- live ticker ----- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
        {cityCards.map((c) => (
          <div key={c.city} className="p-4 border border-borderColor rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">{c.city}</p>
            <p className="text-2xl font-semibold mt-1">
              {currency}{c.price}
              <span className={`text-sm ml-2 ${c.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {c.change >= 0 ? '+' : ''}{c.change}%
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Live • updates every 5 s</p>
          </div>
        ))}
      </div>

      {/* ----- chart ----- */}
      <div className="mt-10 p-4 bg-white border border-borderColor rounded-xl shadow-sm">
        <Line options={options} data={data} />
      </div>

      {/* ----- dummy insight ----- */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm">
        <strong>AI Insight:</strong> Prices are expected to {predict > livePrice ? 'rise' : 'drop'} by{' '}
        <span className="font-semibold">{Math.abs((predict - livePrice)).toFixed(0)} $</span> next month
        mainly due to seasonal demand shifts.
      </div>
    </div>
  )
}

export default PriceTracker