// import { createServer } from "http";
// import { readFile } from "fs/promises";
// import path from "path";
// import https from "https";

// const API_KEY=`27cfc8d0c4b8df5f08069ec450b5cff7`;                          // from open weather
// const BASE_URL=`https://api.openweathermap.org/data/2.5/weather`;

// // Function to serve static files
// const serverForm = async (res, filePath, contentType) => {
//   try {
//     const data = await readFile(filePath, "utf-8");
//     res.writeHead(200, { "Content-Type": contentType });
//     res.end(data);
//   } catch (error) {
//     res.writeHead(404, { "Content-Type": "text/plain" });
//     res.end("File not Found");
//   }
// };

// // Function to get weather data
// const getWeather = (city) => {
//   return new Promise((resolve, reject) => {
//     const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
//     https
//       .get(url, (res) => {
//         let data = "";
//         res.on("data", (chunk) => (data += chunk));
//         res.on("end", () => {
//           if (res.statusCode === 200) {
//             resolve(JSON.parse(data));
//           } else {
//             reject(new Error("Failed to fetch weather data"));
//           }
//         });
//       })
//       .on("error", (err) => reject(err));
//   });
// };

// // Create the server
// const server = createServer(async (req, res) => {
//   const url = req.url;
//   const method = req.method;

//   if (method === "GET") {
//     if (url === "/") {
//       return serverForm(res, path.join("weather", "index.html"), "text/html");
//     } else if (url === "/style.css") {
//       return serverForm(res, path.join("weather", "style.css"), "text/css");
//     }
//   }

//   if (method === "POST" && url === "/find") {
//     let data = "";
//     req.on("data", (chunk) => (data += chunk));
//     req.on("end", async () => {
//       try {
//         const { cityName } = JSON.parse(data);

//         if (!cityName) {
//           res.writeHead(400, { "Content-Type": "application/json" });
//           return res.end(JSON.stringify({ error: "City name is required" }));
//         }

//         const weatherData = await getWeather(cityName);
//         const response = {
//           name: weatherData.name,
//           temp: weatherData.main.temp,
//           description: weatherData.weather[0].description,
//           windSpeed:weatherData.wind.speed,
//           humidity:weatherData.main.humidity
//         };

//         res.writeHead(200, { "Content-Type": "application/json" });
//         res.end(JSON.stringify(response));
//       } catch (error) {
//         res.writeHead(500, { "Content-Type": "application/json" });
//         res.end(JSON.stringify({ error: "Unable to fetch weather data" }));
//       }
//     });
//   }
// });

// server.listen(3000, () => console.log("Server running on port 3000"));

import https from "https";

const API_KEY = `27cfc8d0c4b8df5f08069ec450b5cff7`;
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather`;

const getWeather = (city) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error("Failed to fetch weather data"));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Vercel automatically parses JSON if the request header is set correctly.
      const { cityName } = req.body;
      if (!cityName) {
        return res.status(400).json({ error: "City name is required" });
      }
      const weatherData = await getWeather(cityName);
      const response = {
        name: weatherData.name,
        temp: weatherData.main.temp,
        description: weatherData.weather[0].description,
        windSpeed: weatherData.wind.speed,
        humidity: weatherData.main.humidity,
      };
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch weather data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

