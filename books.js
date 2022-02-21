var authors = [],
  isbn,
  isbns = [],
  newAuthor = [],
  newAuthors = [],
  search_item;

async function getBooks() {
  search_item = document.getElementById("search").value.replaceAll(" ", "+");

  document.getElementById("content").innerHTML = "";
  document.getElementById("authors").innerHTML = "";

  if (search_item) {
    document.createElement("authors");

    let books = await fetch(
      "https://www.googleapis.com/books/v1/volumes?q=inauthor:${" +
        search_item +
        "}&maxResults=10"
    ).then((response) => response.json());
    this.books = books;

    for (i in books.items) {
      isbn = books.items[i].volumeInfo.industryIdentifiers;
      for (var j = 0; j < isbn.length; j++) {
        if (
          isbn[j].type === "ISBN_10" &&
          books.items[i].volumeInfo.description
        ) {
          document
            .getElementById("content")
            .append(isbn[j].identifier.toString());
          isbns.push(isbn[j].identifier);

          if (books.items[i].volumeInfo.imageLinks)
            var src = books.items[i].volumeInfo.imageLinks.thumbnail.replace(
              "http://",
              "https://"
            );
          (img = document.createElement("img")),
            (div = document.createElement("div"));

          div.setAttribute("id", isbn[j].identifier.toString());

          img.id = isbn[j].identifier;

          img.src = src;
          document.getElementById("content").appendChild(div);
          document.getElementById(isbn[j].identifier.toString()).append(img);
        }
      }
    }
  }
  filtered_isbns = isbns.filter(Boolean);
  console.log(filtered_isbns);
  for (i in filtered_isbns) {
    await get_stuff(filtered_isbns[i]);
  }
  addAuthors();
}

async function get_stuff(isbn) {
  var parent = this.parentNode;
  console.log(isbn);

  var div = document.createElement("div");

  const response = await fetch(
    "https://uk4tq4pat9.execute-api.us-east-1.amazonaws.com/Prod/execution",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"book":"' + isbn + '"}',
    }
  ).then((response) => response.json());
  this.response = response;

  authors.push(response);

  div.append("ISBN:" + isbn.toString());
  document
    .getElementById(isbn.toString())
    .append("ISBN:" + isbn.toString() + JSON.stringify(response));
}

var input = document.getElementById("search");
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("content").innerHTML = "";
    document.getElementById("authors").innerHTML = "";

    getBooks();
  }
});
async function addAuthors() {
  newAuthor = authors.flat();
  newAuthors = newAuthor.filter(Boolean);
  
  unique = [...new Map(newAuthors.map((v) => [JSON.stringify(v), v])).values()].sort((a, b) => b[1] - a[1]);


  if (search_item) {
    document.getElementById("authors").append(JSON.stringify(unique));
  }
}

getBooks();
