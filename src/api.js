import {UPDATE_TIME_SEC} from "./constants.js";

const fakeAPI = function () {
    const millisecondsToDate = (milliseconds, is24HoursMode = true) => {
        if (is24HoursMode) {
            return new Date(milliseconds).toString();
        }
    };

    const generateMock = (_minTemperature, _maxTemperature) => {
        const minTemperature = _minTemperature;
        const maxTemperature = _maxTemperature;
        const minHumidity = 0;
        const maxHumidity = 100;

        const periodsCount = 24 * (60 / (UPDATE_TIME_SEC / 60));
        const mockResponse = [];
        let startTime = Date.now() - 3600000 * 24;
        console.warn('periodsCount', periodsCount);
        for (let i = 0; i < periodsCount; i++) {
            mockResponse.push(
                {
                    date: millisecondsToDate(startTime),
                    temperature: Math.ceil(Math.random() * (maxTemperature - minTemperature) + minTemperature),
                    humidity: Math.ceil(Math.random() * (maxHumidity - minHumidity) + minHumidity),
                }
            );

            startTime += 60000 * 15;
        }
        return {
          minTemperature,
          maxTemperature,
          minHumidity,
          maxHumidity,
          data: mockResponse
        };
    };

    const mockFetch = (ms, mockData) => {
        return new Promise((resolve, reject)=> {
            setTimeout(()=>{
                resolve(mockData);
            }, ms)

        });
    };

    const getData = function (min = 0, max = 50) {
        const mockData = generateMock(min, max);
        return mockFetch(1000, mockData);
    };

    return {
        getData
    };
};


export default fakeAPI();