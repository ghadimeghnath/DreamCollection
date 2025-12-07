const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

// Default changed to "Home" based on your Shiprocket Dashboard
const PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || "Home";

async function getShiprocketToken() {
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket credentials missing in .env");
  }

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  });
  
  if (!res.ok) {
      const err = await res.text();
      throw new Error(`Shiprocket Auth Failed: ${err}`);
  }

  const data = await res.json();
  return data.token;
}

export async function createShiprocketOrder(order) {
  try {
    const token = await getShiprocketToken();
    
    // Safely parse Date
    let orderDate = new Date().toISOString().split('T')[0];
    if (order.createdAt) {
        try { orderDate = new Date(order.createdAt).toISOString().split('T')[0]; } catch (e) {}
    }

    const payload = {
      order_id: order._id.toString(),
      order_date: orderDate + " 10:00",
      pickup_location: PICKUP_LOCATION,
      billing_customer_name: "Customer", 
      billing_last_name: "",
      billing_address: order.shippingAddress.street, 
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.zip,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: "customer@example.com",
      billing_phone: order.shippingAddress.phone || "9876543210", 
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.sku || item.productId,
        units: item.quantity,
        selling_price: item.price,
        discount: "",
        tax: "",
        hsn: ""
      })),
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.totalAmount,
      length: 10, breadth: 10, height: 10, weight: 0.5 
    };

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    return { error: error.message || "Failed to connect to courier service." };
  }
}

export async function generateAWB(shipmentId) {
    const token = await getShiprocketToken();
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ shipment_id: shipmentId })
    });
    return await response.json();
}

export async function generateLabel(shipmentId) {
    const token = await getShiprocketToken();
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ shipment_id: [shipmentId] })
    });
    return await response.json();
}

export async function cancelShipment(awbCode) {
    const token = await getShiprocketToken();
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awb", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ awbs: [awbCode] })
    });
    return await response.json();
}

// NEW: Get Live Tracking Status
export async function getTrackingStatus(awbCode) {
    const token = await getShiprocketToken();
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await response.json();
}