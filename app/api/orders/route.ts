import { NextResponse } from "next/server";

const PAYPAL_BASE =
  "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}
export async function POST(req: Request) {
  const { cart } = await req.json();

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: total.toFixed(2),
          },
        },
      ],
    }),
  });

  const order = await res.json();

  return NextResponse.json({ orderID: order.id });
}
export async function PUT(req: Request) {
  const { orderID, cart, shipping } = await req.json();
  console.log("ORDER ID:", orderID);
  console.log("SHIPPING:", shipping);
  console.log("CART:", cart);

  validateShipping(shipping);

  const token = await getAccessToken();

  // Capture the PayPal payment
  const res = await fetch(
  `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: "return=representation",
    },
  }
);

  const capture = await res.json();
  if (!res.ok) {
  return NextResponse.json(capture, { status: res.status });
}
  console.log("Capture status:", res.status);
  console.log(JSON.stringify(capture, null, 2));
  // Create Supabase client
  const { createClient } = await import("@supabase/supabase-js");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Save order to database
  const { error } = await supabase.from("orders").insert([
    {
      paypal_order_id: orderID,

      total:
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,

      status: "paid",

      items: cart,

      first_name: shipping.firstName,
      last_name: shipping.lastName,
      email: shipping.email,
      address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip,
      country: shipping.country,

      paypal_capture_id:
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.id,

      payer_id: capture.payer?.payer_id,

      payer_name:
        `${capture.payer?.name?.given_name ?? ""} ${capture.payer?.name?.surname ?? ""}`.trim(),

      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
        details: error,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    success: true,
  });
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateShipping(shipping: any) {
  if (!shipping) throw new Error("Missing shipping");

  if (!shipping.firstName) throw new Error("Missing first name");
  if (!shipping.lastName) throw new Error("Missing last name");
  if (!shipping.address) throw new Error("Missing address");
  if (!shipping.city) throw new Error("Missing city");

  if (!emailRegex.test(shipping.email)) {
    throw new Error("Invalid email");
  }
}