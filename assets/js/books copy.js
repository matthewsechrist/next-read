var authors = (isbns = flattened_authors = filtered_authors = []),
  isbn = (searched_author = "");
var map_of_authors = {};

const spinner = document.getElementById("spinner");

async function searchAuthor() {
  // Set searched_author variable to HTML search value
  searched_author = document.getElementById("search").value;

  // Reset all author varables and Null out  with each author search
  (authors = []), (isbns = []);

  document.getElementById("content").innerHTML =
    document.getElementById("associated_authors").innerHTML =
    document.getElementById("current_author").innerHTML =
      "";

  // If a valid author is searched, display the first 10 books for the searched author
  if (searched_author) {
    document
      .getElementById("current_author")
      .append("BOOKS BY " + searched_author.toUpperCase());

    document.createElement("associated_authors");

    let books = await fetch(
      'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
        searched_author +
        '"}&maxResults=10'
    ).then((response) => response.json());

    this.books = books;

    // Each book results must have a 10 digit ISBN and a book description. An array of ISBNs is created
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
          div.style.display = "inline-block";
          img.id = isbn[j].identifier;
          img.src = src;

          div.setAttribute("id", isbn[j].identifier.toString());

          // Add each book's image and title ina div appended to the content div
          document.getElementById("content").appendChild(div);
          document.getElementById(isbn[j].identifier.toString()).append(img);

          if (books.items[book].volumeInfo.title) {
            document
              .getElementById(isbn[j].identifier.toString())
              .append(books.items[book].volumeInfo.title);

            document.getElementById(isbn[j].identifier.toString());
          }
        }
      }
    }
  }

  // Remove any "falsy" ISBNs, including [], None, Null, false
  filtered_isbns = isbns.filter(Boolean);

  spinner.removeAttribute("hidden");

  // Pseudo-concurrently retrieve all potential authors mentioned in the book description
  // Using Promise.allSettled as opposed to Promise.all since I want to show as many potential
  // authors as possible, even if I can't return all of them
  await Promise.allSettled(
    filtered_isbns.map((stuff) => getMentionedAuthors(stuff))
  );

  addAuthors();

  spinner.setAttribute("hidden", "");
}

// This function passes in an ISBN, calls my API and returns all authors which are
// assigned to the authors array
async function getMentionedAuthors(isbn) {
  const response = await fetch("https://api.matthewsechrist.cloud/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"book":"' + isbn + '"}',
  }).then((response) => response.json());

  //spinner.setAttribute('hidden', '');

  this.response = response;

  authors.push(response);
}

// Call the searchAuthor() function from the Enter key, also the search button
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
  //div = document.createElement("div");

  // Step 1 of 3 - Flatten multiple author array results into one flat authors array
  flattened_authors = authors.flat();

  // Step 2 of 3 - Remove "false-ish" authors from the flattened_authors array
  filtered_authors = flattened_authors.filter(Boolean);

  //Step 3 of 5 - Remove authors with 0 books
  for (var i = filtered_authors.length - 1; i >= 0; --i) {
    if (filtered_authors[i].books === 0) {
      filtered_authors.splice(i, 1);
    }
  }

  // Step 4 of 5 - Create a map of authors which does not allow duplicates of authors,
  // and this maps the JSON returned in the format author:books
  map_of_authors = Object.assign(
    {},
    ...filtered_authors.map((x) => ({ [x.author]: x.books }))
  );

  // Step 5 of 5 - Create and sort the ordered_authors array in descending order, showing most prolific authors in top
  var ordered_authors = Object.keys(map_of_authors).map(function (key) {
    return [key, map_of_authors[key]];
  });

  ordered_authors.sort(function (first, second) {
    return second[1] - first[1];
  });

  // Only add the authors HTML div only after an author has been searched
  if (searched_author) {
    document.getElementById("associated_authors").append("MENTIONED AUTHORS:");

    for (author_index in ordered_authors) {
      // Remove the currently searched author
      if (
        ordered_authors[author_index][0].toLowerCase() ==
        searched_author.toLowerCase()
      ) {
        ordered_authors.splice(author_index, 1);
      }
console.log(ordered_authors);

      getFirst10Books(ordered_authors[author_index][0]);
    }
  }
}

// This functions add up to the first 10 books return for each mentioned author
async function getFirst10Books(fetched_author) {


  let authors_books = await fetch(
    'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
      fetched_author +
      '"}&maxResults=10'
  ).then((response) => response.json());

  this.authors_books = authors_books;

  author_div = document.createElement("div");
  fetched_author_div = document.createElement("div");

  author_div.style.display = "block";
  fetched_author_div.style.display = "block";

  author_div.setAttribute("id", fetched_author.replace(/\s+/g, ""));
  document.getElementById("associated_authors").appendChild(author_div);
  document.getElementById(fetched_author.replace(/\s+/g, "")).append(fetched_author.replace(/\s+/g, ""));


  for (var book in authors_books.items) {
    if (authors_books.items[book].volumeInfo.industryIdentifiers) {
      isbn = authors_books.items[book].volumeInfo.industryIdentifiers;

      for (j in isbn) {
        if (
          isbn[j].type === "ISBN_10" &&
          authors_books.items[book].volumeInfo.description
        ) {
          isbns.push(isbn[j].identifier);

          // Need to change from HTTP to HTTPS for the Google Books image link
          if (authors_books.items[book].volumeInfo.imageLinks) {
            var src = authors_books.items[
              book
            ].volumeInfo.imageLinks.thumbnail.replace("http://", "https://");
          }
          else var src = "";
          

          // Set HTML element values
          author_button = document.createElement("button");
          img = document.createElement("img");
          div = document.createElement("div");
          title_div = document.createElement("div");
          title_div.style.display = "block";
          div.style.display = "inline-block";
          img.id = isbn[j].identifier;
          img.src = src;

          div.setAttribute("id", isbn[j].identifier.toString());

          title_div.append(authors_books.items[book].volumeInfo.title);

          author_button.text_content = fetched_author.replace(/\s+/g, "");

          // Add HTML elements
          document
            .getElementById(fetched_author.replace(/\s+/g, ""))
            .appendChild(div);

            if(authors_books.items[book].volumeInfo.imageLinks){
          document.getElementById(isbn[j].identifier.toString()).append(img);
            }
            else document.getElementById(isbn[j].identifier.toString()).append("No image found");

          if (authors_books.items[book].volumeInfo.title) {
            document
              .getElementById(isbn[j].identifier.toString())
              .appendChild(title_div);
          }
        }
      }
    }
  }
}

searchAuthor();
