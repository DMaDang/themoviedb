import axios from 'axios';


const apiKey = 'e9e9d8da18ae29fc430845952232787c';
const language = 'vi-VN';

export const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3', 
  params: {
    api_key: apiKey,
    language: language,

  },
  headers: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzY4ZTM5ZWRlYzg0OWMxNjIyY2RkZGZiYTRhMzM2MSIsIm5iZiI6MTczMTcyMjMwNi4xNzkyODE3LCJzdWIiOiI2NzJlZWQ3ZDk0YzNiZGVkOTMxMjBjZmIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Odk4dwZP9JCiy9fkJ_ewVq1a-QNuouG9IpGsAPIc1YM',
    'Content-Type': 'application/json;charset=utf-8',
  },
});