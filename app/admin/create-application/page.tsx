import { redirect } from "next/navigation";

export default function AdminCreateApplicationRedirect() {
  redirect("/admin/dashboard");
}
