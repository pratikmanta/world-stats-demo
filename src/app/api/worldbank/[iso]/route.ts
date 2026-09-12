import { NextResponse } from "next/server";
import { fetchCountryIndicators } from "@/lib/worldbank";

// World Bank data is annual — cache responses for a full day.
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: { iso: string } }
) {
  const data = await fetchCountryIndicators(params.iso);
  return NextResponse.json(data);
}
