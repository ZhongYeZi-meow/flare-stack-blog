import { and, count, desc, eq } from "drizzle-orm";
import type { GuestbookStatus } from "@/lib/db/schema";
import { GuestbookTable, user } from "@/lib/db/schema";

export async function insertGuestbookEntry(
  db: DB,
  data: typeof GuestbookTable.$inferInsert,
) {
  const [entry] = await db.insert(GuestbookTable).values(data).returning();
  return entry;
}

export async function getPublicGuestbookEntries(
  db: DB,
  options: { offset?: number; limit?: number } = {},
) {
  const { offset = 0, limit = 20 } = options;

  return await db
    .select({
      id: GuestbookTable.id,
      content: GuestbookTable.content,
      status: GuestbookTable.status,
      createdAt: GuestbookTable.createdAt,
      userId: GuestbookTable.userId,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(GuestbookTable)
    .leftJoin(user, eq(GuestbookTable.userId, user.id))
    .where(eq(GuestbookTable.status, "published"))
    .orderBy(desc(GuestbookTable.createdAt))
    .limit(Math.min(limit, 100))
    .offset(offset);
}

export async function getPublicGuestbookCount(db: DB) {
  const result = await db
    .select({ count: count() })
    .from(GuestbookTable)
    .where(eq(GuestbookTable.status, "published"));
  return result[0].count;
}

export async function getAllGuestbookEntries(
  db: DB,
  options: { offset?: number; limit?: number; status?: GuestbookStatus } = {},
) {
  const { offset = 0, limit = 20, status } = options;
  const conditions = [];
  if (status) conditions.push(eq(GuestbookTable.status, status));

  return await db
    .select({
      id: GuestbookTable.id,
      content: GuestbookTable.content,
      status: GuestbookTable.status,
      createdAt: GuestbookTable.createdAt,
      userId: GuestbookTable.userId,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(GuestbookTable)
    .leftJoin(user, eq(GuestbookTable.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(GuestbookTable.createdAt))
    .limit(Math.min(limit, 100))
    .offset(offset);
}

export async function getAllGuestbookCount(
  db: DB,
  options: { status?: GuestbookStatus } = {},
) {
  const conditions = [];
  if (options.status)
    conditions.push(eq(GuestbookTable.status, options.status));

  const result = await db
    .select({ count: count() })
    .from(GuestbookTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0].count;
}

export async function updateGuestbookStatus(
  db: DB,
  id: number,
  status: GuestbookStatus,
) {
  const [entry] = await db
    .update(GuestbookTable)
    .set({ status })
    .where(eq(GuestbookTable.id, id))
    .returning();
  return entry;
}

export async function deleteGuestbookEntry(db: DB, id: number) {
  await db.delete(GuestbookTable).where(eq(GuestbookTable.id, id));
}
