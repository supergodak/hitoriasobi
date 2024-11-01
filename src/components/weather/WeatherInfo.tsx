import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

interface WeatherInfoProps {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: React.ReactNode;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ latitude, longitude }) => {
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // OpenWeather APIを使用して天気情報を取得
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
        );
        
        if (!response.ok) throw new Error('天気情報の取得に失敗しました');
        
        const data = await response.json();
        
        const getWeatherIcon = (condition: string) => {
          switch (condition) {
            case 'Clear': return <Sun className="w-6 h-6 text-yellow-500" />;
            case 'Clouds': return <Cloud className="w-6 h-6 text-gray-500" />;
            case 'Rain': return <CloudRain className="w-6 h-6 text-blue-500" />;
            case 'Snow': return <CloudSnow className="w-6 h-6 text-blue-300" />;
            case 'Thunderstorm': return <CloudLightning className="w-6 h-6 text-purple-500" />;
            default: return <Cloud className="w-6 h-6 text-gray-500" />;
          }
        };

        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: getWeatherIcon(data.weather[0].main)
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('天気情報を取得できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center space-x-2 p-2 bg-white rounded-lg shadow">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="text-sm text-red-500 p-2">
        {error || '天気情報を取得できませんでした'}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow">
      {weather.icon}
      <span className="font-medium">
        {weather.temperature}°C
      </span>
      <span className="text-sm text-gray-600">
        {weather.condition}
      </span>
    </div>
  );
};

export default WeatherInfo;