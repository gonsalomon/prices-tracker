import Map, { NavigationControl, GeolocateControl, Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import './App.css'
import { useGeolocation } from './hooks/useGeolocation'
import { useNearbyStores } from './hooks/useNearbyStores'
import { useProducts } from './hooks/useProducts'
import { useStoreAvailability } from './hooks/useStoreAvailability'
import { useAppStore } from './store/useAppStore'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

function markerColor(storeId, availabilityMap) {
  if (!availabilityMap) return '#6b7280'
  const record = availabilityMap[storeId]
  if (!record) return '#6b7280'
  if (record.is_stale) return '#9ca3af'
  return record.is_available ? '#22c55e' : '#ef4444'
}

export default function App() {
  const { position } = useGeolocation()
  const { selectedProductId, setSelectedProductId } = useAppStore()

  const { data: stores = [] } = useNearbyStores(position.lat, position.lng)
  const { data: products = [] } = useProducts()

  const storeIds = stores.map(s => s.id)
  const { data: availabilityMap } = useStoreAvailability(selectedProductId, storeIds)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>
        {/* LEFT: Title */}
        <div id="title">
          <h1>Tendrán esto?</h1>
        </div>

        {/* CENTER: Product selector */}
        <div id="select-wrapper">
          <select
            id="select"
            value={selectedProductId ?? ''}
            onChange={e => setSelectedProductId(e.target.value || null)}
          >
            <option value="">Filtrar por producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* RIGHT: Action buttons */}
        <div id="actions">
          <button
            className="action-btn"
            onClick={() => {/* TODO: Open Add Store modal */ }}
          >
            <span className="icon">📍</span>
            <span className="btn-label">Agregar tienda</span>
          </button>
          <button
            className="action-btn action-btn-primary"
            onClick={() => {/* TODO: Open Add Product modal */ }}
          >
            <span className="icon">➕</span>
            <span className="btn-label">Agregar producto</span>
          </button>
        </div>
      </header>

      <div style={{ flex: 1 }}>
        <Map
          initialViewState={{
            latitude: position.lat,
            longitude: position.lng,
            zoom: 14
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" trackUserLocation />

          {stores.map(store => (
            <Marker
              key={store.id}
              latitude={store.lat}
              longitude={store.lng}
            >
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: markerColor(store.id, availabilityMap),
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }} />
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  )
}