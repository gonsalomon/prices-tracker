import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useNearbyStores } from '../hooks/useNearbyStores'
import { useSubmitReport } from '../hooks/useSubmitReport'
import { useGeolocation } from '../hooks/useGeolocation'

const label = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: '#6b7280', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
}

const select = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: 14,
  color: '#374151', background: 'white',
}

export default function ReportModal({ store: preselected, onClose }) {
  const { position } = useGeolocation()
  const { data: products = [] } = useProducts()
  const { data: stores = [] } = useNearbyStores(position.lat, position.lng)

  const [storeId, setStoreId]       = useState(preselected?.id ?? '')
  const [productId, setProductId]   = useState('')
  const [isAvailable, setAvailable] = useState(null)

  const { mutate, isPending, isSuccess } = useSubmitReport()

  const canSubmit = storeId && productId && isAvailable !== null

  function handleSubmit() {
    mutate({ storeId, productId, isAvailable }, {
      onSuccess: () => setTimeout(onClose, 800),
    })
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 12, padding: 24,
          width: '90%', maxWidth: 400,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#111827' }}>
            Reportar disponibilidad
          </h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>
            ✕
          </button>
        </div>

        {/* Store */}
        <div>
          <span style={label}>Local</span>
          {preselected ? (
            <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 6, fontSize: 14, color: '#374151' }}>
              {preselected.name}
            </div>
          ) : (
            <select style={select} value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value="">Seleccioná un local...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>

        {/* Product */}
        <div>
          <span style={label}>Producto</span>
          <select style={select} value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">Seleccioná un producto...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Availability */}
        <div>
          <span style={label}>¿Lo tienen?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: true,  label: '✓ Sí tienen', active: '#22c55e', bg: '#f0fdf4', text: '#166534' },
              { value: false, label: '✗ No tienen', active: '#ef4444', bg: '#fef2f2', text: '#991b1b' },
            ].map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setAvailable(opt.value)}
                style={{
                  flex: 1, padding: 10, borderRadius: 8, cursor: 'pointer',
                  fontWeight: 600, fontSize: 14,
                  border: `2px solid ${isAvailable === opt.value ? opt.active : '#e5e7eb'}`,
                  background: isAvailable === opt.value ? opt.bg : 'white',
                  color: isAvailable === opt.value ? opt.text : '#6b7280',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          style={{
            padding: 12, borderRadius: 8, border: 'none',
            fontWeight: 600, fontSize: 14,
            background: canSubmit ? '#111827' : '#e5e7eb',
            color: canSubmit ? 'white' : '#9ca3af',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {isPending ? 'Enviando...' : isSuccess ? '¡Listo! ✓' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  )
}