import { Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";

export default async function StudentGate({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(Role.STUDENT);
  return children;
}
