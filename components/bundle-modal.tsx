"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, ShoppingCart } from "lucide-react"
import { calculateBundlePrice, canRemoveEvent } from "@/lib/utils/bundles"
import Link from "next/link"

interface Event {
  id: string
  name: string
  category: string
  description: string
  date_time: string
  location: string
  price: number
  instructor_name: string
  image_url: string
}

interface BundleModalProps {
  isOpen: boolean
  onClose: () => void
  bundle: {
    id: string
    name: string
    description: string
    discount_percentage: number
    total_price: number
    events: Event[]
  } | null
}

export function BundleModal({ isOpen, onClose, bundle }: BundleModalProps) {
  const [selectedEvents, setSelectedEvents] = useState<Event[]>(bundle?.events || [])

  if (!bundle) return null

  const handleRemoveEvent = (eventId: string) => {
    if (!canRemoveEvent(selectedEvents.length)) return
    setSelectedEvents(prev => prev.filter(event => event.id !== eventId))
  }

  const pricing = calculateBundlePrice(selectedEvents)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{bundle.name}</DialogTitle>
          {bundle.description && (
            <p className="text-gray-600 mt-2">{bundle.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Events List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Events in this Bundle</h3>
            {selectedEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{event.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      <p><span className="font-medium">Category:</span> {event.category}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(event.date_time)}</p>
                      <p><span className="font-medium">Location:</span> {event.location}</p>
                      <p><span className="font-medium">Instructor:</span> {event.instructor_name}</p>
                      <p><span className="font-medium">Price:</span> £{event.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                    {canRemoveEvent(selectedEvents.length) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEvent(event.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Minimum Events Warning */}
          {selectedEvents.length === 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Minimum requirement:</strong> Bundles must include at least 2 events.
                You cannot remove more events.
              </p>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Bundle Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Individual Events Total:</span>
                <span>£{pricing.originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Bundle Discount ({pricing.discountPercentage}%):</span>
                <span>-£{(pricing.originalTotal - pricing.discountedTotal).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Bundle Total:</span>
                  <span className="text-green-600">£{pricing.discountedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button asChild className="bg-[#654625] hover:bg-[#4a3319] text-white">
              <Link href={`/book/bundle/${bundle.id}?events=${selectedEvents.map(e => e.id).join(',')}`}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Book This Bundle (£{pricing.discountedTotal.toFixed(2)})
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}