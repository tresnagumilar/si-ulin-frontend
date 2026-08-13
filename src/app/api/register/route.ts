import { NextResponse } from "next/server";

const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
const BACKEND_URL = rawBackendUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const res = await fetch(`${BACKEND_URL}/api/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Backend server (Laravel http://localhost:8000) is unreachable or returned an HTML error response." },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
