import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const pollVotes = sqliteTable('poll_votes', {
  voterId: text('voter_id').primaryKey(),
  certificationId: text('certification_id').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, table => [index('poll_votes_certification_idx').on(table.certificationId)]);
