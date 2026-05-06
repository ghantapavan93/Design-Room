

async function test() {
    try {
        const query = `
          query Design($id: ID!) {
            design(id: $id) {
              id
              recentEvents(limit: 30) {
                id
              }
            }
          }
        `;
        
        const res = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { id: "1" } })
        });
        
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
