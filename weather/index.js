//initializing variable
const url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apikey = "750bc2287ea683ec1b0c089a33ac40a2";
const input = document.getElementById("cityInput");
const submitbtn = document.getElementById("searchBtn");
const forecastBody = document.getElementById("forecastBody");
const forecastCity = document.getElementById("forecastCity");
const recentList = document.getElementById("recentCities");
//Getting current Weather of a place
async function getWeather(city) {
  try {
    const response = await fetch(url + city + `&appid=${apikey}`);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    console.log(data);
    const utc = data.dt;
    const offset = data.timezone;
    const formattedTime = getLocalTime(utc,offset)
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".weather").innerHTML = data.weather[0].main;
    document.querySelector(".tempe").innerHTML = Math.round(data.main.temp);
    document.querySelector(".feeling").innerHTML =Math.round(data.main.feels_like) + "&#176C";
    document.querySelector(".humid").innerHTML =data.main.humidity
    document.querySelector(".press").innerHTML = data.main.pressure + " hPa";
    document.querySelector(".maxtemp").innerHTML =data.main.temp_max + "&#176C";
    document.querySelector(".mintemp").innerHTML = data.main.temp_min + "&#176C";
    document.querySelector(".sunup").innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    document.querySelector(".sundown").innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    document.querySelector(".time").innerHTML = formattedTime 
    document.querySelector(".winds").innerHTML = data.wind.speed + " km/h";
    document.querySelector(".windg").innerHTML = data.wind.deg + "&#176";
    document.querySelector(".cloude").innerHTML = data.clouds.all + "%";
  } catch (error) {
    console.error("Error:", error);
    alert("City not found! Please try again.");
  }
}
// Function to Calculate local Time of the place
function getLocalTime(dt, timezone) {
  const utcMillis = dt * 1000;
  const localMillis = utcMillis + timezone * 1000;
  const localDate = new Date(localMillis);
  const hours = localDate.getUTCHours().toString().padStart(2, "0");
  const minutes = localDate.getUTCMinutes().toString().padStart(2, "0");
  const ampm= hours >= 12 ? "PM" : "AM";
  const hr = hours % 12 || 12;
  return `${hr}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}
//for recent cities
let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

function addCity(city) {
  city = city.trim();
  if (!city) return;
  if (recentCities.includes(city)) {
    recentCities = recentCities.filter(c => c !== city); // move to top
  }
  recentCities.unshift(city);
  if (recentCities.length > 5) recentCities.pop();
  localStorage.setItem("recentCities", JSON.stringify(recentCities));
  renderRecentCities();
}
function renderRecentCities() {
  recentList.innerHTML = "";
  recentCities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => handleSearch(city));
    recentList.appendChild(li);
  });
}
//for forecast table
async function getCityForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}&appid=${apikey}`
    );
    const data = await res.json();
    if (data.cod !== "200") {
      forecastBody.innerHTML = `<tr><td colspan="10">Forecast not available for "${city}"</td></tr>`;
      return;
    }
    forecastCity.textContent = data.city.name;
    forecastBody.innerHTML = "";
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    daily.forEach(day => {
      const date = new Date(day.dt * 1000).toLocaleDateString();
      const weather = day.weather[0].main;
      const temp = Math.round(day.main.temp);
      const feels = Math.round(day.main.feels_like);
      const min =day.main.temp_min;
      const max =day.main.temp_max;
      const humid = day.main.humidity;
      const press = day.main.pressure;
      const wind = day.wind.speed;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${date}</td>
        <td>${weather}</td>
        <td>${temp}°C</td>
        <td>${feels}°C</td>
        <td>${min}°C</td>
        <td>${max}°C</td>
        <td>${humid}%</td>
        <td>${press} hPa</td>
        <td>${wind} km/h</td>
      `;
      forecastBody.appendChild(row);
    });
  } catch (err) {
    console.error("Forecast error:", err);
  }
}
// Map function
function updateMap(city) {
  const mapUrl = `https://www.google.com/maps?q=${city}&t=&z=11&ie=UTF8&iwloc=&output=embed`;
  document.getElementById("mapFrame").src = mapUrl;
}
//For input
submitbtn.addEventListener("click", () => {
  getWeather(input.value);
  updateMap(input.value);
  addCity(input.value);
  getCityForecast(input.value)
});
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  getWeather(input.value);
  updateMap(input.value);
  addCity(input.value);
  getCityForecast(input.value)
  }
});
mapFrame.addEventListener("load", () => {
  mapFrame.classList.add("loaded");
});
renderRecentCities();
if (recentCities[0]) handleSearch(recentCities[0]);