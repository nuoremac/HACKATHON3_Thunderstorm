import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Connecting to:", supabaseUrl);

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function test() {
  console.time("db-fetch");
  const { data, error } = await supabase.from("students").select("*").limit(1);
  console.timeEnd("db-fetch");
  if (error) console.error("Error:", error);
  else console.log("Success:", data);
}

test();
