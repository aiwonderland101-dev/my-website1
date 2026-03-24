#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET;
const SUPABASE_PREFIX = process.env.SUPABASE_PREFIX ?? "";
const MOUNT_DIR = process.env.SUPABASE_MOUNT_DIR ?? "/home/theia/workspace/supabase";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_BUCKET) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_BUCKET");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function downloadOne(objectName) {
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).download(objectName);
  if (error) throw error;

  const filePath = path.join(MOUNT_DIR, objectName);
  await mkdir(path.dirname(filePath), { recursive: true });
  const arrayBuffer = await data.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));
}

async function run() {
  await mkdir(MOUNT_DIR, { recursive: true });

  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(SUPABASE_PREFIX, {
    limit: 1000,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) throw error;

  const files = (data ?? []).filter((entry) => entry.name && !entry.id?.includes("folder"));

  for (const file of files) {
    const objectName = SUPABASE_PREFIX ? `${SUPABASE_PREFIX}/${file.name}` : file.name;
    await downloadOne(objectName);
  }

  console.log(`Mounted ${files.length} object(s) from ${SUPABASE_BUCKET}/${SUPABASE_PREFIX} to ${MOUNT_DIR}`);
}

run().catch((error) => {
  console.error("supabase_mount failed", error);
  process.exit(1);
});
