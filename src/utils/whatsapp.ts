import { Product, StoreOrder, Customer } from '../types';

/**
 * Normalizes phone numbers into international WhatsApp standard (e.g., 923001234567)
 */
export function normalizeWhatsAppNumber(phone: string, defaultCountryCode = '92'): string {
  if (!phone) return '';
  // Remove non-digit characters
  let cleaned = phone.replace(/[^0-9]/g, '');

  // Strip leading 00
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Handle local Pakistani numbers starting with 03xx
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned;
  }

  return cleaned;
}

/**
 * Generates official click-to-chat WhatsApp link
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalizedPhone = normalizeWhatsAppNumber(phone);
  if (!normalizedPhone) return '#';
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

/**
 * Product Inquiry Message Template
 */
export function createProductInquiryMessage(
  storeName: string, 
  product: Product
): string {
  return `*Assalam-o-Alaikum ${storeName}!*
I have an inquiry regarding this product from your website catalog:

*Product:* ${product.name} ${product.urduName ? `(${product.urduName})` : ''}
*SKU:* ${product.sku}
*Price:* Rs. ${product.price.toLocaleString()} / ${product.unit}
*Current Availability:* ${product.stock > 0 ? `In Stock (${product.stock} ${product.unit} available)` : 'Out of Stock'}

Is this item currently available for immediate pickup or home delivery?`;
}

/**
 * Cart Order Submission Message Template
 */
export function createCartOrderMessage(
  storeName: string,
  items: Array<{ name: string; quantity: number; unit: string; price: number }>,
  customerInfo: { name: string; phone: string; address?: string; notes?: string },
  deliveryCharges: number,
  subtotal: number,
  total: number,
  orderNumber?: string
): string {
  let text = `*NEW GROCERY ORDER — ${storeName.toUpperCase()}*\n`;
  if (orderNumber) {
    text += `*Order Reference:* #${orderNumber}\n`;
  }
  text += `----------------------------------------\n`;
  text += `*Customer Details:*\n`;
  text += `• Name: ${customerInfo.name || 'Valued Customer'}\n`;
  text += `• Contact Phone: ${customerInfo.phone || 'Not specified'}\n`;
  if (customerInfo.address) {
    text += `• Delivery Address: ${customerInfo.address}\n`;
  }
  if (customerInfo.notes) {
    text += `• Special Instructions: ${customerInfo.notes}\n`;
  }
  text += `----------------------------------------\n`;
  text += `*Ordered Items:*\n`;

  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    text += `${index + 1}. *${item.name}*\n   Qty: ${item.quantity} ${item.unit} @ Rs. ${item.price.toLocaleString()} = Rs. ${itemTotal.toLocaleString()}\n`;
  });

  text += `----------------------------------------\n`;
  text += `*Subtotal:* Rs. ${subtotal.toLocaleString()}\n`;
  text += `*Delivery Charges:* ${deliveryCharges === 0 ? 'FREE' : `Rs. ${deliveryCharges.toLocaleString()}`}\n`;
  text += `*TOTAL ESTIMATED PAYABLE:* Rs. ${total.toLocaleString()}\n\n`;
  text += `_Note: This order is awaiting store confirmation. Please confirm availability and dispatch schedule._`;

  return text;
}

/**
 * Order Status Update Notification for Staff
 */
export function createOrderStatusMessage(
  storeName: string,
  order: StoreOrder
): string {
  let statusText = order.status;
  if (order.status === 'Confirmed') statusText = 'CONFIRMED & SCHEDULED';
  if (order.status === 'Preparing') statusText = 'BEING PACKED & WEIGHED';
  if (order.status === 'Ready') statusText = 'READY FOR PICKUP AT STORE';
  if (order.status === 'Out for Delivery') statusText = 'OUT FOR DOORSTEP DELIVERY';
  if (order.status === 'Completed') statusText = 'DELIVERED & COMPLETED';
  if (order.status === 'Cancelled') statusText = 'CANCELLED';

  let msg = `*Assalam-o-Alaikum ${order.customerName}!*
Update from *${storeName}* regarding your Order *#${order.orderNumber}*:

*Status:* ${statusText}
*Total Bill Amount:* Rs. ${order.total.toLocaleString()} (${order.paymentMethod})
*Delivery Address:* ${order.deliveryAddress || 'Store Pickup'}

`;

  if (order.status === 'Ready') {
    msg += `Your grocery package has been packed with fresh items. You can collect it from our counter.\n`;
  } else if (order.status === 'Out for Delivery') {
    msg += `Our delivery rider is en route to your address. Please keep the exact cash ready if paying on delivery.\n`;
  } else if (order.status === 'Completed') {
    msg += `JazakAllah Khair for shopping with us! Please inspect your items and let us know if you need anything else.\n`;
  } else {
    msg += `We are processing your items. For questions, reply directly to this chat.\n`;
  }

  return msg;
}

/**
 * Polite Udhaar (Store Credit) Payment Reminder
 */
export function createUdhaarReminderMessage(
  storeName: string,
  customerName: string,
  outstandingBalance: number,
  storeDetails: { phone: string; address: string; bankDetails?: string }
): string {
  return `*Assalam-o-Alaikum ${customerName} Sahib/Sahiba,*

This is a polite account statement reminder from *${storeName}*.

According to our store credit ledger:
*Outstanding Balance Due:* Rs. ${outstandingBalance.toLocaleString()}

Kindly arrange payment at your earliest convenience when visiting the shop or through JazzCash/EasyPaisa/Raast.

*Shop Address:* ${storeDetails.address}
*Contact:* ${storeDetails.phone}

_JazakAllah Khair for your continued trust and patronage._`;
}
