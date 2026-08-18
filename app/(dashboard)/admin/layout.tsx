import { Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";

export default async function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(Role.ADMIN);
  return children;
}
