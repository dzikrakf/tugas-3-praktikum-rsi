import { eq, sql } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

export type UserRole = 'admin' | 'owner' | 'customer';
export type UserRow = typeof users.$inferSelect;

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    const db = await getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return rows[0];
  }

  async findById(id: number): Promise<UserRow | undefined> {
    const db = await getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return rows[0];
  }

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<UserRow | undefined> {
    const db = await getDb();

    const result = await db.execute(sql`
      INSERT INTO USERS (name, email, password_hash, role)
      OUTPUT INSERTED.id AS id
      VALUES (
        ${input.name},
        ${input.email},
        ${input.passwordHash},
        ${input.role}
      )
    `);

    const rows = result as unknown as { recordset?: { id: number }[] };
    const id = Number(rows.recordset?.[0]?.id);

    if (!id) return undefined;

    return this.findById(id);
  }
}
