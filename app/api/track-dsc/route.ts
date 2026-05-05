/* eslint-disable @typescript-eslint/no-unused-vars */
export async function POST(req: Request) {
  const { number } = await req.json();

  return Response.json({
    success: true,
    status: "pending",
  });
}