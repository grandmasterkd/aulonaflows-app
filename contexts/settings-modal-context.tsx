"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SettingsModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const SettingsModalContext = createContext<SettingsModalContextType | undefined>(undefined)

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <SettingsModalContext.Provider value={{ isOpen, openModal, closeModal }}>{children}</SettingsModalContext.Provider>
  )
}

export function useSettingsModal() {
  const context = useContext(SettingsModalContext)
  if (context === undefined) {
    throw new Error("useSettingsModal must be used within a SettingsModalProvider")
  }
  return context
}
