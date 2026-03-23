import { fetchAllCards, fetchRareCards } from './src/lib/tcgdex.js';

async function test() {
  try {
    console.log("Fetching all cards...");
    let list = await fetchAllCards();
    list = list.filter(c => c.image);
    const listStr = JSON.stringify(list);
    console.log(`All cards size: ${(listStr.length / 1024 / 1024).toFixed(2)} MB`);

    console.log("Fetching rare cards...");
    let rList = await fetchRareCards();
    rList = rList.filter(c => c.image);
    const rListStr = JSON.stringify(rList);
    console.log(`Rare cards size: ${(rListStr.length / 1024 / 1024).toFixed(2)} MB`);
    
    console.log(`Total: ${((listStr.length + rListStr.length) / 1024 / 1024).toFixed(2)} MB`);
  } catch(e) {
    console.log("Error:", e);
  }
}
test();
