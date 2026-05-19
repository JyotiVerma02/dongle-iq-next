export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId } = await req.json();

  return Response.json({
    success: true,
    message: "mTokens claimed",
    commission: 315,
  });
}