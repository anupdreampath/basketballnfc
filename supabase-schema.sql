-- Run this in your Supabase SQL Editor (fresh setup):
-- https://supabase.com/dashboard/project/xhcbzpesbyfucnclkylm/sql/new
--
-- If your DB already has the base tables, run supabase-migration-presets.sql instead.

-- Required extension for overlap prevention in schedules
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS videos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  move_name      TEXT,
  difficulty     TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'pro')),
  device_type    TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  cloudinary_id  TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  thumbnail_url  TEXT,
  duration_secs  INTEGER,
  file_size_mb   NUMERIC(8, 2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT videos_move_name_difficulty_device_type_key UNIQUE (move_name, difficulty, device_type)
);

CREATE INDEX IF NOT EXISTS idx_videos_device_type ON videos(device_type);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_move_name ON videos(move_name);

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

CREATE TABLE IF NOT EXISTS schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id    UUID REFERENCES videos(id) ON DELETE CASCADE,
  preset_id   UUID REFERENCES presets(id) ON DELETE SET NULL,
  move_name   TEXT,
  device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  difficulty  TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'pro')),
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  label       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    device_type WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (is_active = true)
);

CREATE INDEX IF NOT EXISTS idx_schedules_device_active ON schedules(device_type, is_active);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON schedules(starts_at, ends_at);

CREATE TABLE IF NOT EXISTS settings (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduler_enabled               BOOLEAN NOT NULL DEFAULT true,
  override_move_name              TEXT,
  default_difficulty              TEXT CHECK (default_difficulty IN ('beginner', 'intermediate', 'pro')) DEFAULT 'pro',
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
  -- legacy per-device overrides kept for backward compat
  override_mobile_video_id        UUID REFERENCES videos(id) ON DELETE SET NULL,
  override_tablet_video_id        UUID REFERENCES videos(id) ON DELETE SET NULL,
  override_desktop_video_id       UUID REFERENCES videos(id) ON DELETE SET NULL,
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed exactly one settings row (only run once)
INSERT INTO settings (scheduler_enabled) VALUES (true);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- videos: anyone can read, only authenticated (admin) can write
CREATE POLICY "public read videos"
  ON videos FOR SELECT USING (true);

CREATE POLICY "admin insert videos"
  ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin delete videos"
  ON videos FOR DELETE USING (auth.role() = 'authenticated');

-- presets: anyone can read, only authenticated can write
CREATE POLICY "public read presets"
  ON presets FOR SELECT USING (true);

CREATE POLICY "admin all presets"
  ON presets FOR ALL USING (auth.role() = 'authenticated');

-- schedules: anyone can read, only authenticated can write
CREATE POLICY "public read schedules"
  ON schedules FOR SELECT USING (true);

CREATE POLICY "admin all schedules"
  ON schedules FOR ALL USING (auth.role() = 'authenticated');

-- settings: anyone can read, only authenticated can update
CREATE POLICY "public read settings"
  ON settings FOR SELECT USING (true);

CREATE POLICY "admin update settings"
  ON settings FOR UPDATE USING (auth.role() = 'authenticated');
