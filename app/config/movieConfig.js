import axios from 'axios';


const apiKey = 'a312a76fa3a48f167614d0dca3a49886';
const language = 'vi-VN';

export const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3', 
  params: {
    api_key: apiKey,
    language: language,
  },
});