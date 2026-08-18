import { Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";

export default async function TeacherGate({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(Role.TEACHER);
  return children;
}
