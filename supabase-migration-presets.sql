-- ─────────────────────────────────────────────
-- MIGRATION: Add presets table + missing columns
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhcbzpesbyfucnclkylm/sql/new
-- ─────────────────────────────────────────────

-- 1. Add missing columns to videos table
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS move_name  TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'pro'));

-- Backfill move_name from title where null
UPDATE videos SET move_name = title WHERE move_name IS NULL;

-- Unique constraint required for upsert on (move_name, difficulty, device_type)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'videos_move_name_difficulty_device_type_key'
  ) THEN
    ALTER TABLE videos ADD CONSTRAINT videos_move_name_difficulty_device_type_key
      UNIQUE (move_name, difficulty, device_type);
  END IF;
END $$;

-- 2. Add missing columns to settings table
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS override_move_name             TEXT,
  ADD COLUMN IF NOT EXISTS default_difficulty             TEXT CHECK (default_difficulty IN ('beginner', 'intermediate', 'pro')) DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS front_page_title               TEXT,
  ADD COLUMN IF NOT EXISTS move_description               TEXT,
  ADD COLUMN IF NOT EXISTS move_level                     TEXT,
  ADD COLUMN IF NOT EXISTS move_quote                     TEXT,
  ADD COLUMN IF NOT EXISTS slot_beginner_mobile_id        UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_beginner_tablet_id        UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_beginner_desktop_id       UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_intermediate_mobile_id    UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_intermediate_tablet_id    UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_intermediate_desktop_id   UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_pro_mobile_id             UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_pro_tablet_id             UUID REFERENCES videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_pro_desktop_id            UUID REFERENCES videos(id) ON DELETE SET NULL;

-- 3. Create presets table (must exist before schedules FK)
CREATE TABLE IF NOT EXISTS presets (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                            TEXT NOT NULL UNIQUE,
  override_move_name              TEXT,
  default_difficulty              TEXT CHECK (default_difficulty IN ('beginner', 'intermediate', 'pro')),
  front_page_title                TEXT,
  move_description                TEXT,
  move_level                      TEXT,
  move_quote                      TEXT,
  slot_beginner_mobile_id         UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_beginner_tablet_id         UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_beginner_desktop_id        UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_intermediate_mobile_id     UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_intermediate_tablet_id     UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_intermediate_desktop_id    UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_pro_mobile_id              UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_pro_tablet_id              UUID REFERENCES videos(id) ON DELETE SET NULL,
  slot_pro_desktop_id             UUID REFERENCES videos(id) ON DELETE SET NULL,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presets_name ON presets(name);

-- 4. RLS for presets
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'presets' AND policyname = 'public read presets'
  ) THEN
    CREATE POLICY "public read presets" ON presets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'presets' AND policyname = 'admin all presets'
  ) THEN
    CREATE POLICY "admin all presets" ON presets FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 5. Add missing columns to schedules table (after presets exists)
ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS preset_id  UUID REFERENCES presets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS move_name  TEXT;
