import { timestamp } from 'drizzle-orm/pg-core';

export const metadataTimestampColumns = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
};
