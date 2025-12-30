import type { WeatherData, DailyForecast } from '../types';

// SoCal locations with coordinates
const LOCATIONS = [
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { name: 'Ventura', lat: 34.2746, lon: -119.2290 },
  { name: 'El Cajon', lat: 32.7948, lon: -116.9625 },
  { name: 'Chula Vista', lat: 32.6401, lon: -117.0842 },
  { name: 'Santee', lat: 32.8384, lon: -116.9739 },
];

// Weather code to condition mapping
const weatherCodeToCondition = (code: number): { condition: string; icon: string } => {
  if (code === 0) return { condition: 'Clear', icon: 'clear' };
  if (code === 1) return { condition: 'Mainly Clear', icon: 'clear' };
  if (code === 2) return { condition: 'Partly Cloudy', icon: 'partly-cloudy' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloudy' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', icon: 'fog' };
  if (code >= 51 && code <= 55) return { condition: 'Drizzle', icon: 'rain' };
  if (code >= 56 && code <= 57) return { condition: 'Freezing Drizzle', icon: 'rain' };
  if (code >= 61 && code <= 65) return { condition: 'Rain', icon: 'rain' };
  if (code >= 66 && code <= 67) return { condition: 'Freezing Rain', icon: 'rain' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'snow' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', icon: 'rain' };
  if (code >= 85 && code <= 86) return { condition: 'Snow Showers', icon: 'snow' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', icon: 'thunderstorm' };
  return { condition: 'Unknown', icon: 'unknown' };
};

// Convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

// Get day name from date
const getDayName = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today';
  const date = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

export async function fetchWeatherData(): Promise<WeatherData[]> {
  const weatherData: WeatherData[] = [];

  for (const location of LOCATIONS) {
    try {
      // Fetch current weather and 7-day forecast
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America/Los_Angeles&forecast_days=7`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const { condition, icon } = weatherCodeToCondition(data.current.weather_code);

      // Build 7-day forecast
      const forecast: DailyForecast[] = data.daily.time.map((date: string, index: number) => {
        const { condition: dayCondition } = weatherCodeToCondition(data.daily.weather_code[index]);
        return {
          date,
          dayName: getDayName(date, index),
          high: celsiusToFahrenheit(data.daily.temperature_2m_max[index]),
          low: celsiusToFahrenheit(data.daily.temperature_2m_min[index]),
          condition: dayCondition,
          precipitationProbability: data.daily.precipitation_probability_max[index] || 0,
        };
      });

      weatherData.push({
        location: location.name,
        temperature: celsiusToFahrenheit(data.current.temperature_2m),
        windSpeed: Math.round(data.current.wind_speed_10m * 0.621371), // km/h to mph
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        precipitationProbability: data.current.precipitation_probability || 0,
        time: new Date().toISOString(),
        condition,
        icon,
        forecast,
      });
    } catch (error) {
      console.error(`Failed to fetch weather for ${location.name}:`, error);
      // Return fallback data for this location
      weatherData.push({
        location: location.name,
        temperature: 65,
        windSpeed: 8,
        weatherCode: 0,
        humidity: 55,
        precipitationProbability: 10,
        time: new Date().toISOString(),
        condition: 'Data Unavailable',
        icon: 'unknown',
        forecast: [],
      });
    }
  }

  return weatherData;
}
