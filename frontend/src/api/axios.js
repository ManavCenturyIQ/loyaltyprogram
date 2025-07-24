import axios from 'axios';
let baseURL = 'https://loyaltyprogram.century.ae/api/scan';
console.log(window.location);
if(window.location.host === "localhost:5173") {
  baseURL = "http://localhost:7000/scan";
}

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
