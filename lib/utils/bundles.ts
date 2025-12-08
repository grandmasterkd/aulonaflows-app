/**
 * Calculate discount percentage based on number of events in bundle
 */
export function calculateBundleDiscount(eventCount: number): number {
  switch (eventCount) {
    case 2:
      return 10;
    case 3:
      return 15;
    case 4:
      return 20;
    case 5:
      return 25;
    default:
      return 0;
  }
}

/**
 * Calculate total price for a bundle with discount applied
 */
export function calculateBundlePrice(events: Array<{ price: number }>): {
  originalTotal: number;
  discountPercentage: number;
  discountedTotal: number;
} {
  const originalTotal = events.reduce((sum, event) => sum + event.price, 0);
  const discountPercentage = calculateBundleDiscount(events.length);
  const discountAmount = (originalTotal * discountPercentage) / 100;
  const discountedTotal = originalTotal - discountAmount;

  return {
    originalTotal,
    discountPercentage,
    discountedTotal,
  };
}

/**
 * Validate bundle event count (2-5 events)
 */
export function validateBundleEventCount(eventCount: number): boolean {
  return eventCount >= 2 && eventCount <= 5;
}

/**
 * Check if bundle can have events removed (must keep at least 2)
 */
export function canRemoveEvent(currentEventCount: number): boolean {
  return currentEventCount > 2;
}