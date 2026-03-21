import fs from 'fs';

// Manually parse .env because process.env won't have VITE_ vars natively without dotenv
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json'
};

async function test() {
  console.log("Fetching card_ratings...");
  const res = await fetch(`${url}/rest/v1/card_ratings?select=*`, { headers });
  console.log(res.status, res.statusText);
  const text = await res.text();
  console.log("Body:", text);
}

test();
