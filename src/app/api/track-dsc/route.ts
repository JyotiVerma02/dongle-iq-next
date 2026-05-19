export async function POST(req: Request) {
  const { number } = await req.json();

  if (!number) {
    return Response.json({
      success: false,
      message: "Number required",
    });
  }

  return Response.json({
    success: true,
    status: Math.random() > 0.5 ? "approved" : "pending", // demo
  });
}