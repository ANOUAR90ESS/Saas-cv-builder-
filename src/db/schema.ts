import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'cvs' table with a foreign key to 'users'.
export const cvs = pgTable('cvs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull().default('Untitled CV'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships for the 'users' table.
export const usersRelations = relations(users, ({ many, one }) => ({
  cvs: many(cvs),
  subscriptionEntitlements: one(subscriptionEntitlements, {
    fields: [users.id],
    references: [subscriptionEntitlements.userId],
  }),
  aiCreditBalances: one(aiCreditBalances, {
    fields: [users.id],
    references: [aiCreditBalances.userId],
  }),
  paymentTransactions: many(paymentTransactions),
}));

export const subscriptionEntitlements = pgTable('subscription_entitlements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  plan: text('plan').notNull().default('FREE'), // FREE, PRO, CAREER
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, CANCELED, EXPIRED, PAST_DUE
  source: text('source'), // GOOGLE_PLAY, STRIPE
  platform: text('platform'), // ANDROID, WEB
  startedAt: timestamp('started_at'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: integer('cancel_at_period_end').default(0), // 0 false, 1 true
  externalCustomerId: text('external_customer_id'),
  externalSubscriptionId: text('external_subscription_id'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiCreditBalances = pgTable('ai_credit_balances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  creditsRemaining: integer('credits_remaining').notNull().default(10), // Free tier gets 10
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const paymentTransactions = pgTable('payment_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  externalTransactionId: text('external_transaction_id'),
  source: text('source').notNull(), // GOOGLE_PLAY, STRIPE
  amount: integer('amount'), // in cents
  currency: text('currency'),
  status: text('status').notNull(), // SUCCESS, PENDING, FAILED
  eventType: text('event_type'), // SUBSCRIPTION_STARTED, SUBSCRIPTION_RENEWED, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships for the 'cvs' table.
export const cvsRelations = relations(cvs, ({ one }) => ({
  author: one(users, {
    fields: [cvs.userId],
    references: [users.id],
  }),
}));
