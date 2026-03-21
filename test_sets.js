import { fetchCardsBySets } from './src/lib/tcgdex.js';

async function test() {
  console.log("Starting fetch...");
  const cards = await fetchCardsBySets(['base1', 'xy1']);
  console.log("Done fetching!");
  console.log(`Received ${cards.length} cards.`);
  if (cards.length > 0) {
    console.log(cards[0]);
  }
}
test();
