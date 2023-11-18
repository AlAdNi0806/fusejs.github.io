
async function getPosts(){
    try {
        const res = await fetch("posts.json");
        if(!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        return data;
    } catch(error){
        console.log(error);
        return error.message;
    }
}

async function retrieveSearchResults(query) {
    const startTime = performance.now(); 
    const posts = await getPosts();
    const fuse = new Fuse(posts, {
        keys: ["title", "description", "tags"],
        includeScore: true,
        shouldSort: true,
        includeMatches: true,
        threshold: 0.3,
    });
    const searchResults = fuse.search(query);
    const endTime = performance.now(); 
    const elapsedTime = endTime - startTime; 

    return {
        results: searchResults,
        elapsedTime: elapsedTime,
    };
}

function generatePostHTML(post){
    return `
        <article>
            <h2><a href="${post.item.hre}" class="title">${post.item.title}</a></h2>
            <p class="description">${post.item.description}</p>
            <a class="ReadPost" href="${post.item.ref}">Read Post</a>
        </article>
    `
}

const form = document.querySelector("#search-form");
const searchResults = document.querySelector("#search-results");
const shortInfo = document.querySelector(".information")
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const query = formData.get("search");
    const { results, elapsedTime } = await retrieveSearchResults(query);

    const elapsedTimeInSeconds = elapsedTime / 1000; // Convert milliseconds to seconds

    console.log("Number of results:", results.length);
    console.log("Time taken to retrieve results:", elapsedTimeInSeconds, "seconds");

    shortInfo.innerHTML = `<p>${results.length} results (${elapsedTimeInSeconds})</p>`
    searchResults.innerHTML = results.length > 0 ? results.map(generatePostHTML).join("") 
    : `<div class="notFount"><p class='noResults'>Your search - <strong>${query}</strong> did not match any documents.</p><br><br><p>Suggestions:</p><br>
        <ul>
            <li>Make sure that all words are spelled correctly.</li>
            <li>Try different keywords.</li>
            <li>Try more general keywords.</li>
            <li>Try fewer keywords.</li>
        </ul></div>`;
});