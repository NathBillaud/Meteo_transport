/*
On importe notre config.json car open meteo fonctionne avec latitude/longitude,
suppression cityInput

current_weather=true : données actuelles
hourly=... : données horaires pour humidité, vent
timezone=auto : fuseau horaire automatique
*/

import config from '../../config.json';

export default async function handler(req, res) {
  try {
    // Récupération de la ville configurée
    console.log('Config:', config);
    console.log('currentCity index:', config.currentCity);
    
    const currentCity = config.cities[config.currentCity];
    console.log('currentCity:', currentCity);
    
    const { latitude, longitude, name } = currentCity;
    console.log('Coordonnées:', { latitude, longitude, name });
    
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`;
    console.log('URL API:', apiUrl);
    
    const getWeatherData = await fetch(apiUrl);
    
    if (!getWeatherData.ok) {
      throw new Error(`API responded with status: ${getWeatherData.status}`);
    }
    
    const data = await getWeatherData.json();
    console.log('Données reçues:', data);

    // Convertir les timestamps ISO d'Open-Meteo en timestamps Unix
    const currentTimeUnix = Math.floor(new Date(data.current_weather.time).getTime() / 1000);
    const sunriseTimeUnix = currentTimeUnix + 6 * 3600; // approximation : lever 6h après minuit
    const sunsetTimeUnix = currentTimeUnix + 18 * 3600; // approximation : coucher 18h après minuit

    // Adapter les données Open-Meteo au format des composants
    const adaptedData = {
      name: name, // nom de la ville depuis config
      sys: { 
        country: "FR",
        sunrise: sunriseTimeUnix,
        sunset: sunsetTimeUnix
      },
      weather: [{
        description: "clear sky", // description par defaut
        icon: "01d" // icône par défaut
      }],

      main: {
        temp: data.current_weather.temperature,
        feels_like: data.current_weather.temperature, 
        humidity: data.hourly.relative_humidity_2m[0] || 50
      },
      wind: {
        speed: data.current_weather.windspeed,
        deg: data.current_weather.winddirection
      },
      
      // Timestamp Unix pour les composants existants
      dt: currentTimeUnix,
      timezone: 3600, // Europe/Paris = +1h = 3600 secondes
      
      // garder les données originales
      current_weather: data.current_weather,
      hourly: data.hourly
    };
    
    res.status(200).json(adaptedData);
    
  } catch (error) {
    console.error('Erreur dans l\'API:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des données météo',
      details: error.message 
    });
  }
}
