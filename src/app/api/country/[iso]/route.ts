import { NextResponse } from "next/server";
import { fetchCompleteCountryData } from "@/lib/worldbank";

// Country data combines boundaries and World Bank indicators.
// Cache for a full day since this data doesn't change frequently.
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: { iso: string } }
) {
  
  const data = await fetchCompleteCountryData(params.iso);
  
  if (!data) {
    return NextResponse.json(
      { error: "Country not found or no boundaries available" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(data);
}