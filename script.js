// token for weather API
const TOKEN =
  "3313c6bdb99b777c0293f925f38c4669b7793554dff82e1a7ff000057b5a45d1";

const DaysOfWeek = {
  DIMANCHE: 0,
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
};

document.addEventListener("DOMContentLoaded", () => {
  // Selecting elements
  const codePostalInput = document.getElementById("code-postal");
  const communeSelect = document.getElementById("communeSelect");
  const validationButton = document.getElementById("validationButton");

  // Function for the API query for communes using the postal code
  async function fetchCommunesByCodePostal(codePostal) {
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${codePostal}`
      );
      const data = await response.json();
      console.table(data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la requête API:", error);
      throw error;
    }
  }

  const rangeInput = document.getElementById("large-range");
  const rangeValue = document.getElementById("range-value");

  // Update the span text when the range input changes
  rangeInput.addEventListener("input", function () {
    rangeValue.textContent = rangeInput.value;
  });

  // Function to display communes in drop-down list

  function displayCommunes(data) {
    communeSelect.innerHTML = "";
    if (data.length === 1) {
      const commune = data[0];
      communeSelect.innerHTML = `<option value="${commune.code}">${commune.nom}</option>`;
    } else if (data.length > 1) {
      data.forEach((commune) => {
        const option = document.createElement("option");
        option.value = commune.code;
        option.textContent = commune.nom;
        communeSelect.appendChild(option);
      });
    }
    communeSelect.style.display = "block";
    validationButton.style.display = "block";
  }

  //  Function for the weather API request using the code of the selected commune
  async function fetchMeteoByCommune(selectedCommune, days) {
    try {
      const response = await fetch(
        `https://api.meteo-concept.com/api/forecast/daily?token=${TOKEN}&insee=${selectedCommune}&days=${days}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la requête API:", error);
      throw error;
    }
  }

  //  Input event listener added to postal code field
  codePostalInput.addEventListener("input", async () => {
    const codePostal = codePostalInput.value;
    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    if (/^\d{5}$/.test(codePostal)) {
      try {
        const data = await fetchCommunesByCodePostal(codePostal);
        displayCommunes(data);
      } catch (error) {
        console.error(
          "Une erreur est survenue lors de la recherche de la commune :",
          error
        );
        throw error;
      }
    }
  });

  // Add “click” event listener to validation button
  validationButton.addEventListener("click", async () => {
    const selectedCommune = communeSelect.value;
    if (selectedCommune != null) {
      try {
        const data = await fetchMeteoByCommune(selectedCommune);
        createCard(data);
      } catch (error) {
        console.error("Erreur lors de la requête API meteoConcept:", error);
        throw error;
      }
    }
  });
});

function adjustMainHeight() {
  const mainElement = document.querySelector("main");
  const weatherCardsHeight =
    document.getElementById("weatherInformation").offsetHeight;
  mainElement.style.minHeight = `${weatherCardsHeight + 100}px`; // Add extra space as needed
}

function updateWeatherImage(weatherCode) {
  let weatherImage = document.createElement("img");

  // Logic to adjust the visible part of the image according to the weather code
  if (weatherCode <= 1) {
    weatherImage.src = "image/soleil.png";
  } else if (weatherCode <= 4) {
    weatherImage.src = "image/nuage.png"; 
  } else if (weatherCode <= 7) {
    weatherImage.src = "image/brouillard.png"; 
  } else if (
    weatherCode <= 16 ||
    (weatherCode >= 40 && weatherCode <= 48) ||
    (weatherCode >= 210 && weatherCode <= 212)
  ) {
    weatherImage.src = "image/pluie.png"; 
  } else if (
    weatherCode <= 32 ||
    (weatherCode >= 60 && weatherCode <= 78) ||
    (weatherCode >= 220 && weatherCode <= 232)
  ) {
    weatherImage.src = "image/neige.png"; 
  } else if (weatherCode <= 142) {
    weatherImage.src = "image/orage.png"; 
  } else {
    weatherImage.src = "image/grele.png"; 
  }

  weatherImage.alt = "Conditions météorologiques"; // Alternative text for image
  weatherImage.style.objectFit = "none"; // Prevents automatic resizing
  weatherImage.classList.add("w-full", "h-auto", "mt-4"); // Tailwind style classes
  weatherImage.id = "wImage";
  return weatherImage;
}

function createCard(data) {
  const rangeInput = document.getElementById("large-range");

  let submitContainer = document.createElement("div");
  submitContainer.classList.add("flex", "flex-wrap", "justify-center", "gap-4"); // Flex container to align cards

  // Loop through the forecast for each day, up to the number of days chosen by the user
  for (let i = 0; i < rangeInput.value; i++) {
    let weatherForecast = data.forecast[i]; // Access the forecast for the ith day

    // Create a container for the weather information
    let weatherContainer = document.createElement("div");
    weatherContainer.classList.add(
      "bg-white",
      "rounded-lg",
      "shadow-lg",
      "p-6",
      "mt-6",
      "w-full",
      "md:w-1/2",
      "lg:w-1/3"
    );
    weatherContainer.id = "card";
    console.log(weatherContainer.id);

    // Create new divs for weather data
    let weatherTmin = document.createElement("div");
    let weatherTmax = document.createElement("div");
    let weatherPrain = document.createElement("div");
    let weatherSunHours = document.createElement("div");
    let currentDate = document.createElement("div");
    let weatherImage = updateWeatherImage(weatherForecast.weather);
    weatherContainer.appendChild(currentDate);
    weatherContainer.appendChild(weatherImage);

    // Optionally display extra data for V2 functionality (e.g., latitude, longitude, etc.)
    if (document.getElementById("latitude").checked == true) {
      let weatherLatitude = document.createElement("div");
      weatherLatitude.textContent = `Latitude : ${weatherForecast.latitude}`;
      weatherLatitude.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      weatherContainer.appendChild(weatherLatitude);
    }
    if (document.getElementById("longitude").checked == true) {
      let weatherLongitude = document.createElement("div");
      weatherLongitude.textContent = `Longitude : ${weatherForecast.longitude}`;
      weatherLongitude.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      weatherContainer.appendChild(weatherLongitude);
    }
    if (document.getElementById("pluie").checked == true) {
      let weatherPluie = document.createElement("div");
      weatherPluie.textContent = `Cumul de pluie en mm : ${weatherForecast.rr10}`;
      weatherPluie.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      weatherContainer.appendChild(weatherPluie);
    }
    if (document.getElementById("ventMoyen").checked == true) {
      let weatherVentMoyen = document.createElement("div");
      weatherVentMoyen.textContent = `Vitesse moyenne du vent à 10m : ${weatherForecast.wind10m} km/h`;
      weatherVentMoyen.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      weatherContainer.appendChild(weatherVentMoyen);
    }
    if (document.getElementById("ventDirection").checked == true) {
      let weatherVentDirection = document.createElement("div");
      weatherVentDirection.textContent = `Direction du vent (0 à 360°) : ${weatherForecast.dirwind10m}°`;
      weatherVentDirection.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      weatherContainer.appendChild(weatherVentDirection);
    }

    // Add weather data to the divs
    let dateString = data.forecast[i].datetime;
    let date = new Date(dateString);
    const days = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    if (i == 0) {
      currentDate.textContent = "Aujourd'hui";
      currentDate.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
    } else if (i == 1) {
      currentDate.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      currentDate.textContent = "Demain";
    } else {
      currentDate.classList.add(
        "text-lg",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
      currentDate.textContent = days[date.getDay()];
    }
    weatherTmin.textContent = `Température minimale : ${weatherForecast.tmin}°C`;
    weatherTmax.textContent = `Température maximale : ${weatherForecast.tmax}°C`;
    weatherPrain.textContent = `Probabilité de pluie : ${weatherForecast.probarain}%`;
    weatherSunHours.textContent = `Ensoleillement journalier : ${displayHours(
      weatherForecast.sun_hours
    )}`;

    // Add Tailwind classes for styling
    weatherTmin.classList.add(
      "text-lg",
      "font-medium",
      "text-gray-700",
      "mb-2"
    );
    weatherTmax.classList.add(
      "text-lg",
      "font-medium",
      "text-gray-700",
      "mb-2"
    );
    weatherPrain.classList.add(
      "text-lg",
      "font-medium",
      "text-gray-700",
      "mb-2"
    );
    weatherSunHours.classList.add(
      "text-lg",
      "font-medium",
      "text-gray-700",
      "mb-2"
    );

    // Append the divs to the container

    weatherContainer.appendChild(weatherTmin);
    weatherContainer.appendChild(weatherTmax);
    weatherContainer.appendChild(weatherPrain);
    weatherContainer.appendChild(weatherSunHours);

    // Append the container to the weather section
    let weatherSection = document.getElementById("weatherInformation");
    let requestSection = document.getElementById("cityForm");

    weatherSection.appendChild(weatherContainer);

    // Handle the visibility of the sections
    requestSection.style.display = "none";
    weatherSection.style.display = "block";
  }

  // Add a back button to the form
  let weatherSection = document.getElementById("weatherInformation");

  let reloadButton = document.createElement("button");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.classList.add(
    "mt-4",
    "bg-blue-600",
    "hover:bg-blue-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded",
    "block",
    "mx-auto"
  );
  submitContainer.appendChild(reloadButton);
  weatherSection.appendChild(submitContainer);
  // Add a listener to the button
  reloadButton.addEventListener("click", function () {
    document.getElementById("code-postal").value = "";
    rangeInput.value = 0;
    rangeValue = 0;
    location.reload();
  });
  weatherSection.style.display = "block";
  adjustMainHeight();
}

// Function for managing the number of hours with display
function displayHours(sunHours) {
  return sunHours + (sunHours > 1 ? " heures" : " heure");
}
