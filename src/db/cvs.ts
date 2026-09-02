import { db } from './index.ts';
import { cvs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getUserCvs(userId: number) {
  try {
    return await db.select().from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.updatedAt));
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function saveCv(userId: number, title: string, data: any) {
  try {
    const result = await db.insert(cvs)
      .values({
        userId,
        title,
        data,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database insert failed:", error);
    throw new Error("Database insert failed. Please try again later.", { cause: error });
  }
}
