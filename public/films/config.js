// Configuration TMDB
const CONFIG = {
  API_KEY: "91ced4ce6622e9a719480bc7b9d0f0ab", // A remplacer par une approche plus sécurisée (backend ou variables d'environnement)
  API_BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  POSTER_SIZE: "w500",
  BACKDROP_SIZE: "original",
  LANGUAGE: "fr-FR",
  REGION: "FR",
  DEFAULT_PARAMS: "include_adult=false&include_video=true",

  // Paramètres de mise en cache (nouveau)
  CACHE_DURATION: 60 * 5, // 5 minutes en secondes
};
