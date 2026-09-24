export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherInfo {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  uvi: number;
  visibility: number;
  weather: WeatherInfo;
}

export interface HourForecast {
  dt: number;
  temp: number;
  pop: number;
  weather: WeatherInfo;
}

export interface DayForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  min: number;
  max: number;
  pop: number;
  humidity: number;
  windSpeed: number;
  uvi: number;
  weather: WeatherInfo;
}

export interface WeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timezoneOffset: number;
  current: CurrentWeather;
  hourly: HourForecast[];
  daily: DayForecast[];
  fetchedAt: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export type ActiveTarget =
  | { type: "current" }
  | { type: "city"; city: City };
