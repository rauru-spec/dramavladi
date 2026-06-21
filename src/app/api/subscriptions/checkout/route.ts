import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, SUBSCRIPTION_PRICE_ID, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email!,
    session.user.name
  );

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/account?success=1`,
    cancel_url: `${appUrl}/subscribe`,
    locale: "es",
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
