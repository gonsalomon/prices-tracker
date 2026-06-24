import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useSubmitReport } from '../hooks/useSubmitReport'

export default function ReportModal({ onClose, preselectedStore, stores }) {
  const { data: products = [] } = useProducts()
  const { mutate: submit, isPending, error } = useSubmitReport()

  const [storeSearch, setStoreSearch]     = useState(preselectedStore?.name ?? '')
  const [storeId, setStoreId]             = useState(preselectedStore?.id ?? null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [productId, setProductId]         = useState('')
  const [isAvailable, setIsAvailable]     = useState(null)

  const suggestions = storeSearch.length > 1 && !storeId
    ? stores
        .filter(s => s.name.toLowerCase().includes(storeSearch.toLowerCase()))
        .slice(0, 8)
    : []

  function selectStore(store) {
    setStoreId(store.id)
    setStoreSearch(store.name)
    setShowSuggestions(false)
  }

  function handleSearchChange(e) {
    setStoreSearch(e.target.value)
    setStoreId(null)
    setShowSuggestions(true)
  }

  function handleSubmit() {
    if (!storeId || !productId || isAvailable === null) return
    submit({ storeId, productId, isAvailable }, { onSuccess: onClose })
  }

  const canSubmit = storeId && productId && isAvailable !== null && !isPending

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Reportar disponibilidad</h2>

        {error && <div className="modal-error">{error.message}</div>}

        <div className="modal-form">

          {/* Store search */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Tienda</label>
            <input
              className="form-input"
              placeholder="Buscar tienda..."
              value={storeSearch}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map(s => (
                  <div
                    key={s.id}
                    className="suggestion-item"
                    onClick={() => selectStore(s)}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product selector */}
          <div className="form-group">
            <label className="form-label">Producto</label>
            <select
              className="form-input"
              value={productId}
              onChange={e => setProductId(e.target.value)}
            >
              <option value="">Seleccionar producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Availability toggle */}
          <div className="form-group">
            <label className="form-label">Disponibilidad</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`toggle-btn ${isAvailable === true ? 'toggle-btn-yes' : ''}`}
                onClick={() => setIsAvailable(true)}
              >
                ✓ Disponible
              </button>
              <button
                type="button"
                className={`toggle-btn ${isAvailable === false ? 'toggle-btn-no' : ''}`}
                onClick={() => setIsAvailable(false)}
              >
                ✗ Sin stock
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isPending ? 'Enviando...' : 'Reportar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}