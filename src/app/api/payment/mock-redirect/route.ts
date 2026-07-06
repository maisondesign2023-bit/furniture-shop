import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => params.set(key, String(value)));
  const url = new URL("/checkout/mock-payment", request.url);
  url.search = params.toString();
  return NextResponse.redirect(url, 303);
}
