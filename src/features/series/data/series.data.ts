import { asc, count, eq } from "drizzle-orm";
import { PostsTable, SeriesTable } from "@/lib/db/schema";

export async function getAllSeries(db: DB) {
  return await db.select().from(SeriesTable).orderBy(asc(SeriesTable.title));
}

export async function getAllSeriesWithPostCount(db: DB) {
  return await db
    .select({
      id: SeriesTable.id,
      title: SeriesTable.title,
      slug: SeriesTable.slug,
      description: SeriesTable.description,
      createdAt: SeriesTable.createdAt,
      updatedAt: SeriesTable.updatedAt,
      postCount: count(PostsTable.id),
    })
    .from(SeriesTable)
    .leftJoin(PostsTable, eq(PostsTable.seriesId, SeriesTable.id))
    .groupBy(SeriesTable.id)
    .orderBy(asc(SeriesTable.title));
}

export async function getSeriesById(db: DB, id: number) {
  const [series] = await db
    .select()
    .from(SeriesTable)
    .where(eq(SeriesTable.id, id));
  return series ?? null;
}

export async function getSeriesWithPosts(db: DB, seriesId: number) {
  const [series] = await db
    .select()
    .from(SeriesTable)
    .where(eq(SeriesTable.id, seriesId));
  if (!series) return null;

  const posts = await db
    .select({
      id: PostsTable.id,
      title: PostsTable.title,
      slug: PostsTable.slug,
      seriesOrder: PostsTable.seriesOrder,
      status: PostsTable.status,
    })
    .from(PostsTable)
    .where(eq(PostsTable.seriesId, seriesId))
    .orderBy(asc(PostsTable.seriesOrder));

  return { ...series, posts };
}

export async function createSeries(
  db: DB,
  data: { title: string; slug: string; description?: string | null },
) {
  const [series] = await db.insert(SeriesTable).values(data).returning();
  return series;
}

export async function updateSeries(
  db: DB,
  id: number,
  data: { title?: string; slug?: string; description?: string | null },
) {
  await db.update(SeriesTable).set(data).where(eq(SeriesTable.id, id));
  return await getSeriesById(db, id);
}

export async function deleteSeries(db: DB, id: number) {
  await db
    .update(PostsTable)
    .set({ seriesId: null, seriesOrder: 0 })
    .where(eq(PostsTable.seriesId, id));
  await db.delete(SeriesTable).where(eq(SeriesTable.id, id));
}
