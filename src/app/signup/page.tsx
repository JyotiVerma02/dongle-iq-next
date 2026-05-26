import { redirect } from "next/navigation";

type SignupRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupRedirect({
  searchParams,
}: SignupRedirectProps) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => nextParams.append(key, entry));
      continue;
    }

    if (value) {
      nextParams.set(key, value);
    }
  }

  const query = nextParams.toString();
  redirect(query ? `/register?${query}` : "/register");
}
