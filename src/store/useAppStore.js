import { create } from 'zustand'

export const useAppStore = create((set) => ({
  selectedProductId: null,
  selectedStoreId: null,
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setSelectedStoreId:   (id) => set({ selectedStoreId: id }),
}))