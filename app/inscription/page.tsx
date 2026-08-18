import { redirect } from "next/navigation";

export default function InscriptionRedirect() {
  redirect("/login");
}
