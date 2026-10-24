import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { reviews, stalls } from '../db/schema.ts';

export type CreateReviewData = {
  stallId: number;
  userId: number;
  rating: number;
  comment: string | null;
};

export class ReviewRepository {
  async findByStallAndUser(stallId: number, userId: number) {
    const db = await getDb();
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.stallId, stallId), eq(reviews.userId, userId)));

    return rows[0];
  }

  async create(input: CreateReviewData) {
    const db = await getDb();

    const result = await db.execute(sql`
      INSERT INTO REVIEWS (stall_id, user_id, rating, comment)
      OUTPUT INSERTED.id AS id
      VALUES (${input.stallId}, ${input.userId}, ${input.rating}, ${input.comment})
    `);

    const rows = result as unknown as { recordset?: { id: number }[] };
    const id = Number(rows.recordset?.[0]?.id);

    if (!id) return undefined;

    const created = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));

    return created[0];
  }

  async refreshStallSummary(stallId: number): Promise<void> {
    const db = await getDb();

    await db.execute(sql`
      UPDATE STALLS
      SET
        avg_rating = (
          SELECT AVG(CAST(rating AS FLOAT))
          FROM REVIEWS
          WHERE stall_id = ${stallId}
        ),
        review_count = (
          SELECT COUNT(*)
          FROM REVIEWS
          WHERE stall_id = ${stallId}
        )
      WHERE id = ${stallId}
    `);
  }
}
