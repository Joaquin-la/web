import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { cart } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    // 1. Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: cart.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Product",
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.max(
            50,
            Math.round(Number(item.price || 0) * 100)
          ),
        },
        quantity: item.quantity || 1,
      })),
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
    });

    // 2. Save order (pending)
    await supabase.from("orders").insert({
      stripe_session_id: session.id,
      status: "pending",
      amount: cart.reduce(
        (sum: number, item: any) =>
          sum + Number(item.price || 0) * (item.quantity || 1),
        0
      ),
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}