const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// A minimal wrapper mimicking supabase-js for the few methods we use:
export const supabase = {
  from: (table) => ({
    select: (columns = '*') => {
      let queryUrl = `${supabaseUrl}/rest/v1/${table}?select=${columns}`;
      let isSingle = false;
      let orderClause = '';
      let limitClause = '';
      
      const chain = {
        eq: (col, val) => {
          queryUrl += `&${col}=eq.${val}`;
          return chain;
        },
        order: (col, { ascending }) => {
          orderClause = `&order=${col}.${ascending ? 'asc' : 'desc'}`;
          return chain;
        },
        limit: (n) => {
          limitClause = `&limit=${n}`;
          return chain;
        },
        single: () => {
          isSingle = true;
          return chain;
        },
        then: async (resolve, reject) => {
          try {
             // For single, Supabase JS usually requires headers { Accept: 'application/vnd.pgrst.object+json' }
             // But we can just fetch the array and return the first element.
             const res = await fetch(`${queryUrl}${orderClause}${limitClause}`, { method: 'GET', headers });
             if (!res.ok) {
                 const err = await res.json();
                 // If single and no rows, mock PGRST116
                 if (isSingle && err.code === undefined && res.status === 406) {
                    return resolve({ data: null, error: { code: 'PGRST116', message: 'No rows' }});
                 }
                 return resolve({ data: null, error: err });
             }
             const data = await res.json();
             
             if (isSingle) {
                if (data.length === 0) return resolve({ data: null, error: { code: 'PGRST116', message: 'No rows' }});
                return resolve({ data: data[0], error: null });
             }
             return resolve({ data, error: null });
          } catch (e) {
             reject(e);
          }
        }
      };
      
      // Make the chain awaitable natively
      chain[Symbol.asyncIterator] = async function* () {
         const result = await new Promise((res, rej) => chain.then(res, rej));
         yield result;
      };
      
      // Modern Promise integration
      const promiseObj = {
         then: chain.then,
         catch: (cb) => chain.then(d => d, cb)
      };
      
      Object.assign(chain, promiseObj);

      return chain;
    },
    
    insert: async (payload) => {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
           method: 'POST',
           headers,
           body: JSON.stringify(payload)
        });
        if (!res.ok) return { error: await res.json(), data: null };
        const data = await res.json();
        return { data: data[0] || data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    update: (payload) => {
       let eqCol, eqVal;
       const chain = {
          eq: async (col, val) => {
             eqCol = col;
             eqVal = val;
             try {
                const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${eqCol}=eq.${eqVal}`, {
                   method: 'PATCH',
                   headers,
                   body: JSON.stringify(payload)
                });
                if (!res.ok) return { error: await res.json(), data: null };
                const data = await res.json();
                return { data: data[0] || data, error: null };
             } catch (error) {
                return { data: null, error };
             }
          }
       };
       return chain;
    },
    
    upsert: async (payload, options = {}) => {
      // Very basic upsert using POST with Prefer header
      const upsertHeaders = { ...headers, 'Prefer': 'return=representation,resolution=merge-duplicates' };
      if (options.onConflict) {
         // Not strictly required for basic REST upserts if PK is set, but good practice
         upsertHeaders['on_conflict'] = options.onConflict;
      }
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
           method: 'POST',
           headers: upsertHeaders,
           body: JSON.stringify(payload)
        });
        if (!res.ok) return { error: await res.json(), data: null };
        const data = await res.json();
        return { data: data[0] || data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  })
};
