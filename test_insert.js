import fs from 'fs';

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
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function test() {
  console.log("Attempting insert...");
  const res = await fetch(`${url}/rest/v1/card_ratings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      card_id: 'test-card-123',
      total_score: 10,
      count: 1,
      average_score: 10
    })
  });
  console.log(res.status, res.statusText);
  const text = await res.text();
  console.log("Body:", text);
}

test();
