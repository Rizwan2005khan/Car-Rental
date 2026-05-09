import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'

// Fix Leaflet default icon paths broken by Vite's asset pipeline
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
})

// Custom colored SVG marker factory
const createColoredIcon = (color = '#2563EB') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.059 27.941 0 18 0z"
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
      <path d="M12 18l2-4h8l2 4v2h-1v1h-2v-1h-6v1h-2v-1h-1v-2z
               M13.5 16.5l.75-1.5h7.5l.75 1.5h-9z
               M13 19a1 1 0 100 2 1 1 0 000-2z
               M23 19a1 1 0 100 2 1 1 0 000-2z"
            fill="${color}" opacity="0.9" transform="translate(0 -1)"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [36, 44],
    iconAnchor: [18, 44],
    popupAnchor:[0, -46],
  })
}

// Stable deterministic offset so cars don't all stack at the same point
const deterministicOffset = (id = '', index = 0) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  const lat = ((hash & 0xff) / 255 - 0.5) * 0.18   // ±~10 km
  const lng = (((hash >> 8) & 0xff) / 255 - 0.5) * 0.22
  return [lat, lng]
}

// City center coordinates — Peshawar, Pakistan
const CITY_CENTER = [34.0151, 71.5249]

// Fits the map bounds to all markers when cars change
const BoundsFitter = ({ positions }) => {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 13)
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] })
    }
  }, [positions])
  return null
}

const CarMap = ({ cars, currency }) => {
  const navigate = useNavigate()

  // Assign stable coordinates to each car
  const carsWithCoords = useMemo(() =>
    cars.map((car, i) => {
      const [dLat, dLng] = deterministicOffset(car._id || String(i), i)
      return {
        ...car,
        lat: CITY_CENTER[0] + dLat,
        lng: CITY_CENTER[1] + dLng,
      }
    }),
    [cars]
  )

  const positions = carsWithCoords.map(c => [c.lat, c.lng])

  // Color by category
  const categoryColor = (cat = '') => {
    const map = {
      Sedan: '#2563EB', SUV: '#059669', Luxury: '#7C3AED',
      Sports: '#DC2626', Van: '#D97706', Truck: '#374151',
    }
    return map[cat] || '#2563EB'
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '650px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '4px solid white' }}>
      {/* Legend */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
        {[
          { label: 'Sedan',   color: '#2563EB' },
          { label: 'SUV',     color: '#059669' },
          { label: 'Luxury',  color: '#7C3AED' },
          { label: 'Sports',  color: '#DC2626' },
          { label: 'Van',     color: '#D97706' },
          { label: 'Other',   color: '#374151' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-xs font-semibold text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Car count badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-primary text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg shadow-blue-200">
        📍 {cars.length} Cars Available
      </div>

      <MapContainer
        center={CITY_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Premium map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <BoundsFitter positions={positions} />

        {carsWithCoords.map((car, i) => (
          <Marker
            key={car._id || i}
            position={[car.lat, car.lng]}
            icon={createColoredIcon(categoryColor(car.category))}
          >
            <Popup
              maxWidth={260}
              className="car-popup"
            >
              <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: 220 }}>
                {/* Car image */}
                <div style={{
                  height: 120, borderRadius: 12, overflow: 'hidden',
                  marginBottom: 10, background: '#f1f5f9',
                }}>
                  <img
                    src={car.image?.[0] || car.image || ''}
                    alt={`${car.brand} ${car.model}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;font-weight:700;">
                          🚗 No Image
                        </div>`
                    }}
                  />
                </div>

                {/* Car info */}
                <div style={{ padding: '0 2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 15, color: '#0f172a', margin: 0 }}>
                        {car.brand} {car.model}
                      </p>
                      <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{car.year} · {car.category}</p>
                    </div>
                    <div style={{
                      background: '#eff6ff', borderRadius: 8,
                      padding: '4px 8px', textAlign: 'right', flexShrink: 0,
                    }}>
                      <p style={{ fontWeight: 900, color: '#2563eb', fontSize: 14, margin: 0 }}>
                        {currency}{car.pricePerDay}
                      </p>
                      <p style={{ color: '#93c5fd', fontSize: 10, margin: 0 }}>/day</p>
                    </div>
                  </div>

                  {/* Specs chips */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {[car.transmission, car.fuelType, car.seats && `${car.seats} seats`]
                      .filter(Boolean)
                      .map((spec, j) => (
                        <span key={j} style={{
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          borderRadius: 6, padding: '2px 8px',
                          fontSize: 11, fontWeight: 700, color: '#475569',
                        }}>
                          {spec}
                        </span>
                      ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/cars/${car._id}`)}
                    style={{
                      marginTop: 12, width: '100%', padding: '9px 0',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white', border: 'none', borderRadius: 10,
                      fontWeight: 800, fontSize: 13, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    }}
                  >
                    View & Book →
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map attribution overlay style fix */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
          border: 1px solid #e2e8f0;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          color: #374151 !important;
          font-weight: 800 !important;
        }
      `}</style>
    </div>
  )
}

export default CarMap
