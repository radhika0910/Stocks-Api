// Path: newApp.js
async function fetchStarWarsFilms() {
  const url = "https://swapi-graphql.netlify.app/.netlify/functions/index";
  const query = `
    query {
      allFilms {
        films {
          title
        }
      }
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("There was an error fetching the Star Wars film titles:", error);
  }
}

fetchStarWarsFilms();