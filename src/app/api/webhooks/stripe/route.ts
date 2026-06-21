import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = event.data.object as any;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const status = mapStripeStatus(subscription.status as string);
      const periodEnd = subscription.current_period_end
        ? new Date((subscription.current_period_end as number) * 1000)
        : null;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          subscriptionStatus: status,
          subscriptionCurrentPeriodEnd: periodEnd,
          stripeSubscriptionId: subscription.id as string,
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const periodEnd = subscription.current_period_end
        ? new Date((subscription.current_period_end as number) * 1000)
        : null;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          subscriptionStatus: "CANCELED",
          subscriptionCurrentPeriodEnd: periodEnd,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(status: string) {
  const map: Record<string, string> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    incomplete: "INCOMPLETE",
    incomplete_expired: "CANCELED",
    trialing: "ACTIVE",
    unpaid: "PAST_DUE",
  };
  return (map[status] ?? "NONE") as "ACTIVE" | "CANCELED" | "PAST_DUE" | "INCOMPLETE" | "NONE";
}
