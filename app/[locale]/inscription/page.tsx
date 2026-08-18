import { redirect } from "next/navigation";

export default function LocaleInscriptionRedirect() {
  redirect("/login");
}
