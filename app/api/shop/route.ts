// app/api/shop/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "creatine";

  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "Missing RapidAPI Key" },
      { status: 500 }
    );
  }

  const url = `https://walmart2.p.rapidapi.com/searchV2?query=${encodeURIComponent(
    query
  )}&page=1`;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": "walmart2.p.rapidapi.com",
    },
    cache: "no-store",
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return NextResponse.json(
        { error: `API Error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const products =
      data.data?.searchItems?.map((item: any) => ({
        name: item.title,
        image: item.imageUrl,
        price: item.primaryOffer?.offerPrice || "$--",
        rating: item.averageRating || 0,
        short_description: item.shortDescription,
        category: item.categoryPath?.[0] || "Supplements",
      })) || [];

    return NextResponse.json({ products });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
