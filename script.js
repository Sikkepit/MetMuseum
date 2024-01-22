//Change this variable to change the number of artworks being displayed on the page
const imagesPerPage = 20;


// DOM elements
const searchField = document.getElementById('search-field');
const searchBar = document.getElementById('search-bar');
const magnifyingGlass = document.getElementById('magnifying-glass');
const container = document.getElementById('container');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById("overlay-content");
const overlayContentImage = document.getElementById("overlay-content-image");
const overlayContentH1 = document.getElementById("overlay-content-h1");
const overlayContentH2 = document.getElementById("overlay-content-h2");
const overlayContentP = document.getElementById("overlay-content-p");
const overlayContentMore = document.getElementById("overlay-content-more");
const overlayContentHiRes = document.getElementById("overlay-content-hi-res");
const closeButton = document.getElementById('close-button');

// API functions

async function getArt() {
    const query = searchField.value;
    if (searchField.value) {
        
        
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`);
        const data = await response.json();
        const imageIds = data.objectIDs;

        if(imageIds) {
            searchField.value = "";
            numberOfImages = imageIds.length < imagesPerPage ? imageIds.length : imagesPerPage;
            emptyContainer();
            for(let i=0;i<numberOfImages;i++)
            {
                getArtDetails(imageIds[i]);
            }
        }
        else throwError();
    }
}

async function getArtDetails(id) {
    const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
    
    const data = await response.json();
    if(data.primaryImageSmall) displayTile(data.title, data.primaryImageSmall, id);

}

async function showArt(id) {
    
    const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
    const data = await response.json(); 
    overlayContentImage.src = data.primaryImageSmall;
    checkIfLandscape(data.primaryImageSmall);

    overlayContentImage.setAttribute("alt", `Image of ${data.title} by ${data.artistDisplayName}`);
    overlayContentH1.innerHTML = shortenLongTitle(data.title) || "No Title";
    overlayContentH2.innerHTML = data.artistDisplayName || "Unknown Artist";
    let browseLink = data.artistDisplayName && "browseArtist('" + data.artistDisplayName + "')";
    overlayContentH2.setAttribute("onclick", browseLink);
    overlayContentP.innerHTML = data.medium + ". " + formatDate(data.objectBeginDate, data.objectEndDate);
    overlayContentMore.href = data.objectURL; 
    overlayContentHiRes.href = data.primaryImage;
    overlay.style.display = "flex";
    closeButton.classList.add('show-me');
}


// ERROR handling

function throwError () {

    searchBar.style.backgroundColor = "rgba(255, 99, 71, 0.8)";
    searchField.value = "No results";

    setTimeout(restoreAfterError, 1000);
}
    
function restoreAfterError() {
    searchBar.style.backgroundColor = "rgba(0, 0, 0, 0.5 )";
    searchField.value = "";
}

// Overview page functions

function displayTile(title, image, id){
    container.innerHTML += `<div class="card"><a href="javascript:;" onclick="showArt(${id})">
    <img src="${image}" alt="Image of an art piece titled '${title}'"></div>`;
}
function emptyContainer (){
    container.innerHTML = "";
}

// Detail page functions 

function formatDate (beginDate, endDate) {
    let date;

    if(beginDate === endDate) {
        date = endDate;
    }
    else if(endDate === 'undefined') {
        date = beginDate;
    }
    else if(beginDate === 'undefined') {
        date = "";
    }
    else {
        date = beginDate + " - " + endDate;
    }

    return date;
}

function checkIfLandscape(url) {
    let img = new Image();
    img.src = url;
    if (img.width > img.height) {
        overlayContent.classList.add("overlay-content-landscape");
        overlayContentImage.classList.add("overlay-content-image-landscape");
    }
    else {
        overlayContent.classList.remove("overlay-content-landscape");
        overlayContentImage.classList.remove("overlay-content-image-landscape");
    }
}

function shortenLongTitle(title) {
    if(title.length>80) {
        title = title.slice(0,80) +"...";
    }
    return title;
}

function closeOverlay () {
    overlay.style.display="none";
    closeButton.classList.remove('show-me');
}

// Initial functions

function browseArtist(artist) {
    emptyContainer ();
    searchField.value = artist;
    getArt();
    closeOverlay();
}

function startApp() {
    const artists = ["Lautrec", "Da Vinci", "Van Gogh", "Odilon Redon", "Edgar Degas"];
    const random = Math.floor(Math.random() * (artists.length-1));


    browseArtist(artists[random]);
    searchField.focus();
}

// Event Listeners

magnifyingGlass.addEventListener("click", getArt);
overlay.addEventListener("click", function () {
    closeOverlay();
}, false);
overlayContent.addEventListener("click", function (ev) {
    ev.stopPropagation();
}, false);


closeButton.addEventListener("click", function () {
    closeOverlay();
}, false);

searchField.addEventListener("keypress", (event) => {
    if (event.key ==="Enter") {
        event.preventDefault();
        getArt();
      }
});

// 

startApp();

