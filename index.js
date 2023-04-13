const searchButton = document.getElementById("search-button")
const searchInput = document.querySelector(".search-input")
const input = document.getElementById("search-input")
const searchList = document.getElementById("resultsContainer")
const watchlistButton = document.getElementById("watchlist-button")
const modeToggle = document.querySelector('#mode-toggle');
const modeIcon = document.querySelector('#mode-icon');
const movieList = []


document.addEventListener("DOMContentLoaded", () => {
    const watchlist = document.getElementById("watchlist")
    watchlist && displayMovies()
})

// event listner to add dark mode to the page
if (modeIcon) {
    modeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains("dark-mode")) {
            modeIcon.src = "/images/day-mode.png";
        } else {
            modeIcon.src = "/images/night-mode-purple.png";
        }
    })
};


//check if the element exists before adding the event listener to the search button
if (searchButton) {
    //event listener to load movies
    searchButton.addEventListener("click", () => {
        loadMovies(input.value, renderMovies)
    })
}



// take the search term from the input field and run the renderMovies function
async function loadMovies(searchTerm, renderMovies) {
    const URL = `https://www.omdbapi.com/?s=${searchTerm}&page&apikey=a8acccd9`
    const response = await fetch(`${URL}`)
    const data = await response.json()

    //clear the search results container before every new search
    searchList.innerHTML = ""

    //if there is a result from the search, loop through the array and store the id in a const called imdbID at each index, then run the callback function renderMovies to get the rest of the data
    if (data.Search) {
        for (let i = 0; i < data.Search.length; i++) {
            const posterURL = data.Search[i].Poster
            if (!posterURL || posterURL == "N/A") {
                continue
            }
            // store each movie's ID as we loop through
            const imdbID = data.Search[i].imdbID
            await renderMovies(imdbID)
        }
    } else {
        searchList.innerHTML += `
        <div id="noResults">
            <img id="startExploringImage" src="/images/startExploring.png"/>
            <h3 id="startExploringText">Sorry, please try again</h3>
        </div>
        `
    }

    //clear the input field after every search
    input.value = ''
}



// using the imdbID from the loadMovies function, find all movies with that ID and inject the data into the page
async function renderMovies(imdbID) {
    const URL = `https://www.omdbapi.com/?i=${imdbID}&apikey=a8acccd9`
    const response = await fetch(`${URL}`)
    const data = await response.json()

    if (data) {
        document.getElementById("resultsContainer").innerHTML += `
            <div id="${imdbID}" class="data1">
                 <div id="thumbnail"><img src="${data.Poster}" class="thumbnail"/></div>
                 <div id="movieDataContainer" class="movieDataContainer">
            <div id="rowOne" class="row">
                <p id="movieTitle">${data.Title}</p>
                <p id="rank"><img src="/images/star.png"/>${data.imdbRating}</p>
            </div>
            <div id="rowTwo" class="row">
                <p>${data.Runtime}</p>
                <p>${data.Genre}</p>
                <button id="${imdbID}" class="addToWatchlist">
                    <img src="/images/add.png" id="watchlist-icon">Watchlist
                </button>
            </div>
            <div id="rowThree" class="row">
                <p class="plot">${data.Plot}</p>
            </div>
        </div>
        `
    }
    addToWatchlist()
}

function addToWatchlist() {
    // add an event listener to all dynamically created "add to watchlist" buttons
    const watchListButton = document.querySelectorAll(".addToWatchlist")

    watchListButton.forEach(button => {
        button.addEventListener("click", () => {

            // Get the existing watchlist from localStorage, or create a new one if it doesn't exist
            const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

            // Retrieve the movie's data from the DOM
            const movieData = document.getElementById(button.id)

            // Create a new movie object with the imdbID and data from the DOM
            const movie = {
                imdbID: button.id,
                title: movieData.querySelector("#movieTitle").textContent,
                poster: movieData.querySelector(".thumbnail").src,
                imdbRating: movieData.querySelector("#rank").textContent,
                runtime: movieData.querySelector("#rowTwo > p:first-of-type").textContent,
                genre: movieData.querySelector("#rowTwo > p:last-of-type").textContent,
                plot: movieData.querySelector(".plot").textContent,
            }

            //check if the movie is already in the watchlist by comparing the imdbID of new movies with ones already in the watchlist array
            const existingMovies = watchlist.some((m) => m.imdbID === movie.imdbID)

            // //add a class class called added 
            // document.body.classList.toggle("added")

            // Update the watchlist icon based on the "added" class
            const watchlistIcon = button.querySelector("#watchlist-icon")
            if (document.body.classList.contains("added")) {
                watchlistIcon.src = "/images/remove.png"
            }

            // Add the new movie to the watchlist if it doesn't exist and store it in localStorage
            if (!existingMovies) {
                watchlist.push(movie)
                localStorage.setItem("watchlist", JSON.stringify(watchlist))
            }
        })
    })
}

function displayMovies() {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    //clear all the movies in the Watchlist div 
    document.getElementById("watchlist").innerHTML = ""

    //now we loop through the watchlist array and display each movie on the page
    watchlist.forEach(movie => {

        if (movie) {
            document.getElementById("watchlist").innerHTML += `
            <div id="${movie.imdbID}" class="data1">
                 <div id="thumbnail"><img src="${movie.poster}" class="thumbnail"/></div>
                 <div id="movieDataContainer" class="movieDataContainer">
            <div id="rowOne" class="row">
                <p id="movieTitle">${movie.title}</p>
                <p id="rank"><img src="/images/star.png"/>${movie.imdbRating}</p>
            </div>
            <div id="rowTwo" class="row">
                <p>${movie.runtime}</p>
                <p>${movie.genre}</p>
                <button id="${movie.imdbID}" class="addToWatchlist">
                    <img src="/images/add.png" id="watchlist-icon">Watchlist
                </button>
            </div>
            <div id="rowThree" class="row">
                <p class="plot">${movie.plot}</p>
            </div>
        </div>
        `
        }
    })
}