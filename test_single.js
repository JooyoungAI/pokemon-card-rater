import { supabase } from './src/lib/supabase.js';

async function test() {
  console.log("Selecting missing card...");
  try {
    const { data, error } = await supabase
      .from('card_ratings')
      .select('*')
      .eq('card_id', 'missing-card-999')
      .single();
    
    console.log("Data:", data);
    console.log("Error:", error);
    
    if (error && error.code !== 'PGRST116') {
      console.log("Throwing error!");
      throw error;
    }
    
    console.log("Check passed, proceeding to insert...");
    
    const insertRes = await supabase.from('card_ratings').insert({
       card_id: 'missing-card-999',
       total_score: 5,
       count: 1,
       average_score: 5
    });
    console.log("Insert result:", insertRes);
    
  } catch (err) {
    console.log("Caught:", err);
  }
}

test();
