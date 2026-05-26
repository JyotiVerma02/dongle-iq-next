import { redis } from "@/lib/redis";

export async function GET() {
  try {
    await redis.set("name", "Jyoti");

    const value = await redis.get("name");

    return Response.json({
      success: true,
      data: value,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
        message: "Redis failed",
      },
      {
        status: 500,
      }
    );
  }
}