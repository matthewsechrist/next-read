async function books() {
  const search_item = document
    .getElementById("search")
    .value.replaceAll(" ", "+");

  document.getElementById("content").innerHTML = "";
  if (search_item) {
    const response = await fetch(
      "https://www.googleapis.com/books/v1/volumes?q=${" +
        search_item +
        "}&maxResults=10",
      {
        method: "GET",
      }
    )
      .then((response) => response.text())
      .then((body) => {
        document.getElementById("content").value = "";
        var obj = JSON.parse(body);

        for (var i = 0; i < obj.items.length; i++) {
          var parent = this.parentNode;

          isbn = obj.items[i].volumeInfo.industryIdentifiers;

          for (var j = 0; j < isbn.length; j++) {
            if (isbn[j].type === "ISBN_10" && obj.items[i].volumeInfo.description) {

				var src = obj.items[i].volumeInfo.imageLinks.thumbnail,
				img = document.createElement("img"),
				div = document.createElement("div");

				div.setAttribute("id",isbn[j].identifier.toString());
	
              get_stuff(isbn[j].identifier);
              img.id = isbn[j].identifier;

			  img.src = src;
			  document.getElementById("content").appendChild(div);
			  document.getElementById(isbn[j].identifier.toString()).append(img);	
	
            }
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  } else document.getElementById("content").innerHTML = "";
}

async function get_stuff(isbn) {
  var parent = this.parentNode;

  var div = document.createElement("div");

  const response2 = await fetch(
    "https://uk4tq4pat9.execute-api.us-east-1.amazonaws.com/Prod/execution",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"book":"' + isbn + '"}',
    }
  )
    .then((response2) => response2.text())
    .then((body) => {
      var obj = JSON.parse(body);
      div.append("ISBN:" + isbn.toString() + JSON.stringify(obj.Payload));
      document.getElementById(isbn.toString()).append("ISBN:" + isbn.toString() + JSON.stringify(obj.Payload));
	  console.log(document.getElementById(isbn.toString()) === true)
    })
    .catch(function (error) {
      console.log(error);
    });
}

var input = document.getElementById("search");
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    books();
  }
});

//function clicked() {
//  //var parent = this.parentNode;
//  var div = document.createElement("div");
//  var text = document.createTextNode("texxxt");
//  div.appendChild(text);
//  document.getElementById("content").appendChild(div);
//  const response2 = await fetch(
//    "https://uk4tq4pat9.execute-api.us-east-1.amazonaws.com/Prod/execution",
//    {
//      method: "POST",
//      headers: { "Content-Type": "application/json" }, // this line is important, if this content-type is not set it wont work
//      body: '{"book":+"1469664976"}',
//    }
//  )
//    .then((response2) => response2.text())
//    .then((body) => {
//
//  	var obj = JSON.parse(body);
//  	console.log(obj);
//  	return obj;
//    }
//  )
//}

books();
