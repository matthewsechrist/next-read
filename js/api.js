function visitorCounter(){
    fetch("https://api.matthewsechrist.cloud/graphql", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/graphql',
      },
      body: JSON.stringify({
        query: `{visitor_counter{body}}`,
      }),
    })
    .then(response => response.text())
    .then((body) => {
      const obj = JSON.parse(body);
      document.getElementById("visitor_count").innerHTML=obj.data.visitor_counter.body;
    })
    .catch(function(error) {
      console.log(error); 
    });  
  }  
  
  visitorCounter();