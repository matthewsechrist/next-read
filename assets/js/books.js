var searched_author = "";

const spinner = document.getElementById("spinner");

async function searchAuthor() {
  searched_author = document.getElementById("search").value;

  document.getElementById("mentioned_authors").innerHTML =
    document.getElementById("mentioned_authors_header").innerHTML =
    document.getElementById("error_message").innerHTML =
      "";
  document.getElementById("mentioned_authors").setAttribute("hidden", "");
  document
    .getElementById("mentioned_authors_header")
    .setAttribute("hidden", "");
  spinner.setAttribute("hidden", "");

  if (searched_author) {
    spinner.removeAttribute("hidden");

    let results = await fetch(
      "https://nextreadapi.matthewsechrist.cloud/new_next_read",
      {
        method: "POST",
        body: JSON.stringify({
          author: searched_author,
        }),
        headers: {
          "Content-type": "application/json",
        },
      }
    ).then((response) => response.json());

    if (results.authors) {

      for (var name in results.authors) {
        document.getElementById("mentioned_authors").removeAttribute("hidden");
        document
          .getElementById("mentioned_authors_header")
          .removeAttribute("hidden");

        mentioned_author_div = document.createElement("div");
        mentioned_author_p = document.createElement("p");
        mentioned_author_button = document.createElement("button");

        mentioned_author_button.className = "accordion";
        mentioned_author_div.className = "panel";

        mentioned_author_button.textContent = results.authors[name].author;

        mentioned_author_button.setAttribute(
          "id",
          results.authors[name].author + "_button"
        );
        mentioned_author_p.setAttribute(
          "id",
          results.authors[name].author + "_p"
        );
        mentioned_author_div.setAttribute("id", results.authors[name].author);

        document
          .getElementById("mentioned_authors")
          .appendChild(mentioned_author_button);
        document
          .getElementById("mentioned_authors")
          .appendChild(mentioned_author_div);
        document
          .getElementById(results.authors[name].author)
          .appendChild(mentioned_author_p);

        mentioned_author_button.addEventListener("click", function () {
          this.classList.toggle("active");

          var panel = this.nextElementSibling;

          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });

        for (var book_result in results.authors[name].book_results) {
          img = document.createElement("img");
          a = document.createElement("a");
          img.id = results.authors[name].book_results[book_result].title;
          img.src = results.authors[name].book_results[book_result].thumbnail.replace('http://','https://');
          href =
            "https://www.worldcat.org/isbn/" +
            results.authors[name].book_results[book_result].isbn;
          a.href = href;
          a.target = "_blank";

          a.appendChild(img);

          document
            .getElementById(results.authors[name].author + "_p")
            .append(a);
        }
      }
    } else {
      error_div = document.createElement("div");
      error_div.append(results.error + " for " + searched_author);
      document
        .getElementById("mentioned_authors")
        .appendChild(error_div);
      document.getElementById("mentioned_authors").removeAttribute("hidden");
      document.getElementById("error_message").removeAttribute("hidden");

    }
  }
  spinner.setAttribute("hidden", "");

  document
    .getElementById("mentioned_authors")
    .scrollIntoView({ behavior: "smooth", block: "center" });
}

var input = document.getElementById("search");
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();

    searchAuthor();
  }
});

var clicked = document.getElementById("search_button");
clicked.addEventListener("click", searchAuthor);

searchAuthor();
