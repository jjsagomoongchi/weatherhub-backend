import { Injectable } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class WeatherService {
  async getWeather() {
    // console.log('weatherdata');
    const data = await axios.get(
      'https://api.openweathermap.org/data/3.0/onecall?lat=35.16&lon=128.04&exclude=minutely,alerts&lang=kr&appid=c89fd2d9cf72acb5bda63bb6732a605d',
    );

    this.getSunrise(data);
    this.getSunset(data);
    this.getRain(data);
    this.getClouds(data);
    this.getClear(data);
  }

  private getSunrise(data) {
    const axiosSunrise = data.data.current.sunrise;

    const dateSunrise = new Date(Number(axiosSunrise) * 1000);

    // 일출, 7시 -> 7.0, 7시 30분 -> 7.5, 7시 59분 -> 8.0
    let hourSunrise = dateSunrise.getHours();
    let minuteSunrise = dateSunrise.getMinutes();

    if (minuteSunrise >= 0 && minuteSunrise < 15) {
      minuteSunrise = 0;
    }

    if (minuteSunrise >= 15 && minuteSunrise <= 45) {
      minuteSunrise = 5;
    }

    if (minuteSunrise > 45 && minuteSunrise <= 59) {
      minuteSunrise = 0;
      hourSunrise = hourSunrise + 1;
    }

    const sunrise = hourSunrise + '.' + minuteSunrise;

    console.log('sunrise: ', sunrise);
  }

  private getSunset(data) {
    const axiosSunset = data.data.current.sunset;

    const dateSunset = new Date(Number(axiosSunset) * 1000);

    // 일몰, 19시 -> 19.0, 19시 30분 -> 19.5, 19시 59분 -> 20.0
    let hourSunset = dateSunset.getHours();
    let minuteSunset = dateSunset.getMinutes();

    if (minuteSunset >= 0 && minuteSunset < 15) {
      minuteSunset = 0;
    }

    if (minuteSunset >= 15 && minuteSunset <= 45) {
      minuteSunset = 5;
    }

    if (minuteSunset > 45 && minuteSunset <= 59) {
      minuteSunset = 0;
      hourSunset += 1;
    }

    const sunset = hourSunset + '.' + minuteSunset;

    console.log('sunset: ', sunset);
  }

  private getRain(data) {
    const rainData = [];
    let tmp = -1;

    const hourly = data.data.hourly;
    hourly.map((hour) => {
      const mainWeather = hour.weather[0].main;
      const dateRain = new Date(Number(hour.dt) * 1000);
      const hourRain = dateRain.getHours();

      if (mainWeather == 'Rain' && tmp < hourRain) {
        const rain = { time: hourRain, weather: mainWeather };
        rainData.push(rain);
      }

      tmp = hourRain;
    });

    console.log(rainData);
  }

  private getClouds(data) {
    const cloudsData = [];
    let tmp = -1;

    const hourly = data.data.hourly;
    hourly.map((hour) => {
      const mainWeather = hour.weather[0].main;
      const dateClouds = new Date(Number(hour.dt) * 1000);
      const hourClouds = dateClouds.getHours();

      if (mainWeather == 'Clouds' && tmp < hourClouds) {
        const clouds = { time: hourClouds, weather: mainWeather };
        cloudsData.push(clouds);
      }

      tmp = hourClouds;
    });

    console.log(cloudsData);
  }

  private getClear(data) {
    const clearData = [];
    let tmp = -1;

    const hourly = data.data.hourly;
    hourly.map((hour) => {
      const mainWeather = hour.weather[0].main;
      const dateClear = new Date(Number(hour.dt) * 1000);
      const hourClear = dateClear.getHours();

      if (mainWeather == 'Clear' && tmp < hourClear) {
        const clear = { time: hourClear, weather: mainWeather };
        clearData.push(clear);
      }

      tmp = hourClear;
    });

    console.log(clearData);
  }

  // @Cron('0 * * * * *')
  // async handleCron() {
  //   await this.getWeather();
  // }
  @Interval(1000)
  async handleInterval() {
    await this.getWeather();
  }
}
