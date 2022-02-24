var authors = [],
  isbns = [],
  flattened_authors = [],
  filtered_authors = [],
  ordered_authors = [],
  dictionary_authors = {},
  isbn = "",
  searched_author = "";

async function searchAuthor() {
  // Set searched_author variable to searched valued
  searched_author = document.getElementById("search").value;

  (authors = []), (isbns = []);

  // Null out HTML elements for book content and authors
  document.getElementById("content").innerHTML = "";
  document.getElementById("associated_authors").innerHTML = "";
  document.getElementById("current_author").innerHTML = "";


  // If a valid author is searched, pull the first 10 books for the searched author
  if (searched_author) {
    document
    .getElementById("current_author")
    .append("BOOKS BY "+searched_author.toUpperCase());

    document.createElement("associated_authors");

    let books = await fetch(
      'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
        searched_author +
        '"}&maxResults=10'
    ).then((response) => response.json());

    this.books = books;

    // Each book results must have a 10 digint ISBN and a book description. An array of ISBNs is created
    // for further processing in the getMentionedAuthors() function
    for (var book in books.items) {
      isbn = books.items[book].volumeInfo.industryIdentifiers;

      for (var j = 0; j < isbn.length; j++) {
        if (
          isbn[j].type === "ISBN_10" &&
          books.items[book].volumeInfo.description
        ) {

          isbns.push(isbn[j].identifier);

          // Need to change from HTTP to HTTPS for the Google Books image link
          if (books.items[book].volumeInfo.imageLinks) {
            var src = books.items[book].volumeInfo.imageLinks.thumbnail.replace(
              "http://",
              "https://"
            );
          }

          // Set HTML element values
          img = document.createElement("img");
          div = document.createElement("div");
          img.id = isbn[j].identifier;
          img.src = src;

          div.setAttribute("id", isbn[j].identifier.toString());

          // Add HTML elements
          document.getElementById("content").appendChild(div);
          document.getElementById(isbn[j].identifier.toString()).append(img);
          if (books.items[book].volumeInfo.title){
          document.getElementById(isbn[j].identifier.toString()).append(books.items[book].volumeInfo.title);
          }
        }
      }
    }
  }

  // Remove any "falsy" ISBNs
  filtered_isbns = isbns.filter(Boolean);

  // Pseudo-concurrently retrieve all potential authors mentioned in the book description
  await Promise.allSettled(
    filtered_isbns.map((stuff) => getMentionedAuthors(stuff))
  );

  addAuthors();
}

async function getMentionedAuthors(isbn) {
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
if (books.items[book].volumeInfo.title){
  document
    .getElementById(isbn.toString())
    .append(books.items[book].volumeInfo.title);
}}

// Call the searchAuthor() function from the Enter key, also the "Click Me!" button
var input = document.getElementById("search");
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();

    searchAuthor();
  }
});

// This function adds the authors to HTML in order of number of books associated by author in descending order,
// mimicking a sort by relevancy
function addAuthors() {
  // Step 1 of 3 - Flatten multiple author arrays into one authors array
  flattened_authors = authors.flat();

  // Step 2 of 3 - Remove "falsy" authors from the flattened_authors array
  filtered_authors = flattened_authors.filter(Boolean);

  // Step 3 of 5 - Need to remove currently searched author name from the array

  // Step 4 of 5 - Create a dictionary of authors which does not allow duplicates of authors,
  // and this maps the JSON returned in the format author:books
  dictionary_authors = Object.assign(
    {},
    ...filtered_authors.map((x) => ({ [x.author]: x.books }))
  );

  // Step 5 of 5 - Create and sort the ordered_authors array in descending order, mimicking relevancy of authors found
  var ordered_authors = Object.keys(dictionary_authors).map(function (key) {
    return [key, dictionary_authors[key]];
  });
  ordered_authors.sort(function (first, second) {
    return second[1] - first[1];
  });

  // Only add the authors HTML div only after an author has been searched
  if (searched_author) {
    document
    .getElementById("associated_authors")
    .append("Here are the mentioned authors:");

    for (author_index in ordered_authors) {

      // Remove the currently searched author, no need to see duplicates
      if (
        ordered_authors[author_index][0].toLowerCase() == searched_author.toLowerCase()) {
          ordered_authors.splice(author_index, 1);
      }
  
      document
        .getElementById("associated_authors")
        .append(ordered_authors[author_index][0] + " has "+ ordered_authors[author_index][1].toString() + " associated books.");
    }
  }
}

searchAuthor();
