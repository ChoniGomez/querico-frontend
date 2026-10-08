export function calculateProductPricing(product, quantity, promotionQuantity = quantity) {
  const baseUnitPrice = Number(product.price) || 0;
  const minimumQuantity = Number(product.promoMinQuantity) || 0;
  const discountPercent = Number(product.promoDiscountPercent) || 0;
  const discountApplies = minimumQuantity > 0
    && discountPercent > 0
    && promotionQuantity >= minimumQuantity;
  const unitPrice = discountApplies
    ? Math.round(baseUnitPrice * (1 - discountPercent / 100) * 100) / 100
    : baseUnitPrice;
  const originalTotal = Math.round(baseUnitPrice * quantity * 100) / 100;
  const total = Math.round(unitPrice * quantity * 100) / 100;

  return {
    baseUnitPrice,
    unitPrice,
    originalTotal,
    total,
    discountAmount: Math.round((originalTotal - total) * 100) / 100,
    discountApplies,
    minimumQuantity,
    discountPercent,
  };
}