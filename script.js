const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "250550545808c88caed8488e06b6b59a"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature <i class="fa-solid fa-temperature-half"></i>: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind <i class="fa-solid fa-wind"></i>: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity <i class="fa-solid fa-water"></i>: ${weatherItem.main.humidity}%</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                     <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <h6><i class="fa-solid fa-temperature-half"></i>: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6><i class="fa-solid fa-wind"></i>: ${weatherItem.wind.speed} M/S</h6>
                    <h6><i class="fa-solid fa-water"></i>: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

const recentCitiesSelect = document.getElementById('recentCities');
const localStorageKey = 'recentCities';
let recentCities = JSON.parse(localStorage.getItem(localStorageKey)) || [];

function updateDropdown() {
    recentCitiesSelect.innerHTML = '';
    if (recentCities.length > 0) {
        recentCitiesContainer.classList.remove('hidden');
        recentCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            recentCitiesSelect.appendChild(option);
        });
    } else {
        recentCitiesContainer.classList.add('hidden');
    }
}

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city && !recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem(localStorageKey, JSON.stringify(recentCities));
        updateDropdown();
    }


if (city) {
    updateWeatherData(city);
}
cityInput.value = '';
});

recentCitiesSelect.addEventListener('change', () => {
const selectedCity = recentCitiesSelect.value;
updateWeatherData(selectedCity);
});

// Initialize dropdown on page load
updateDropdown();













