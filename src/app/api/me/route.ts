import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }

  // OPTIONAL: validate token from DB/session
  // const user = await getUserFromSession(token);

  return NextResponse.json(
    { user: { token } }, // replace with real user later
    { status: 200 }
  );
}