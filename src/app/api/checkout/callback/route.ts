import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  const target = new URL("/checkout/success", request.url);
  if (paymentId) {
    target.searchParams.set("payment_id", paymentId);
  }

  return NextResponse.redirect(target);
}
