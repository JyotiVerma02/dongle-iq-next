export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const body = await req.json();

  return Response.json({
    success: true,
    message: "Application submitted",
  });
}