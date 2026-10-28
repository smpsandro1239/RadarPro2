import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "active",
            plan: "pro",
          })
          .where(eq(users.stripeCustomerId, session.customer as string));
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.customer) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "canceled",
            plan: "free",
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string));
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await db
          .update(users)
          .set({ subscriptionStatus: "past_due" })
          .where(eq(users.stripeCustomerId, invoice.customer as string));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
