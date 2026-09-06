import { getCitizenSession } from "@/lib/auth/citizen";
import { getPublicContent } from "@/lib/data/public";

export async function GET() {
  const [citizen, { siteName }] = await Promise.all([
    getCitizenSession(),
    getPublicContent(),
  ]);

  return Response.json(
    { citizen, siteName },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
