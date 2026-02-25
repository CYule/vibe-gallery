-- ============================================================
-- Vibe Gallery – Row Level Security Policies
-- Run after migrations: npx prisma db execute --file prisma/rls.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE "User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RevenueVerification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Like"                ENABLE ROW LEVEL SECURITY;

-- ── Public read (gallery is open to everyone) ───────────────

CREATE POLICY "public_read_projects"
  ON "Project" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_users"
  ON "User" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_likes"
  ON "Like" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_revenue_verifications"
  ON "RevenueVerification" FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── Authenticated write rules ────────────────────────────────

-- Users can create/update/delete their own projects
CREATE POLICY "auth_insert_projects"
  ON "Project" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "authorId");

CREATE POLICY "auth_update_projects"
  ON "Project" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "authorId");

CREATE POLICY "auth_delete_projects"
  ON "Project" FOR DELETE
  TO authenticated
  USING (auth.uid()::text = "authorId");

-- Users can manage their own profile row
CREATE POLICY "auth_insert_user"
  ON "User" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "auth_update_user"
  ON "User" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id);

-- Users can add/remove their own likes
CREATE POLICY "auth_insert_likes"
  ON "Like" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "auth_delete_likes"
  ON "Like" FOR DELETE
  TO authenticated
  USING (auth.uid()::text = "userId");

-- Users can add revenue verifications to their own projects
CREATE POLICY "auth_insert_revenue_verifications"
  ON "RevenueVerification" FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = (
      SELECT "authorId" FROM "Project" WHERE id = "projectId"
    )
  );
