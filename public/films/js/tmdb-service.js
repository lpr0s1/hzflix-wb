// Service pour gérer les appels API TMDB
class TMDBService {
  constructor() {
    this.config = CONFIG;
    this.cache = {};
  }

  // Nouvelle méthode pour gérer le cache
  async fetchWithCache(
    url,
    cacheKey,
    cacheDuration = this.config.CACHE_DURATION
  ) {
    const now = Math.floor(Date.now() / 1000); // Temps actuel en secondes

    // Vérifier si nous avons une donnée en cache et si elle est encore valide
    if (this.cache[cacheKey] && now < this.cache[cacheKey].expiry) {
      return this.cache[cacheKey].data;
    }

    // Sinon, effectuer la requête
    try {
      const response = await fetch(url);
      const data = await response.json();

      // Mettre en cache avec une date d'expiration
      this.cache[cacheKey] = {
        data: data,
        expiry: now + cacheDuration,
      };

      return data;
    } catch (error) {
      console.error(`Erreur lors de la requête ${url}:`, error);
      throw error;
    }
  }

  // Récupérer les films tendance
  async getTrendingMovies() {
    try {
      const url = `${this.config.API_BASE_URL}/trending/movie/week?api_key=${this.config.API_KEY}&language=fr-FR`;
      const data = await this.fetchWithCache(url, "trending-movies");
      return data.results;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des films tendance:",
        error
      );
      return [];
    }
  }

  // Récupérer les films populaires
  async getPopularMovies() {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/movie/popular?api_key=${this.config.API_KEY}&language=fr-FR`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des films populaires:",
        error
      );
      return [];
    }
  }

  // Récupérer les détails d'un film
  async getMovieDetails(movieId) {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/movie/${movieId}?api_key=${this.config.API_KEY}&language=fr-FR&append_to_response=videos`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du film:",
        error
      );
      return null;
    }
  }

  // Obtenir l'URL complète d'une image
  getImageUrl(path, size = "original") {
    if (!path) return "assets/placeholder.jpg";
    return `${this.config.IMAGE_BASE_URL}/${size}${path}`;
  }

  // Obtenir l'URL de la bande-annonce YouTube
  getTrailerUrl(videos) {
    if (!videos || !videos.results) return null;
    const trailer = videos.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  }

  // Rechercher des films
  async searchMovies(query) {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/search/movie?api_key=${
          this.config.API_KEY
        }&language=${this.config.LANGUAGE}&query=${encodeURIComponent(query)}&${
          this.config.DEFAULT_PARAMS
        }`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Erreur lors de la recherche de films:", error);
      return [];
    }
  }

  // Obtenir les recommandations pour un film
  async getMovieRecommendations(movieId) {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/movie/${movieId}/recommendations?api_key=${this.config.API_KEY}&language=${this.config.LANGUAGE}&${this.config.DEFAULT_PARAMS}`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des recommandations:",
        error
      );
      return [];
    }
  }

  // Obtenir le casting d'un film
  async getMovieCredits(movieId) {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/movie/${movieId}/credits?api_key=${this.config.API_KEY}&language=${this.config.LANGUAGE}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération du casting:", error);
      return null;
    }
  }

  // Fonction helper pour lire depuis localStorage avec gestion d'erreurs
  _getFromLocalStorage(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(
        `Erreur lors de la lecture de ${key} dans localStorage:`,
        error
      );
      return defaultValue;
    }
  }

  // Fonction helper pour écrire dans localStorage avec gestion d'erreurs
  _setLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(
        `Erreur lors de l'écriture de ${key} dans localStorage:`,
        error
      );
    }
  }
  // Sauvegarder la progression d'un film
  saveMovieProgress(movie, progress) {
    try {
      let continueWatching = this._getFromLocalStorage("continueWatching");
      const existingIndex = continueWatching.findIndex(
        (m) => m.id === movie.id
      );

      // Si un film est terminé (progress >= 98), le retirer de "continuer à regarder"
      if (progress >= 98) {
        if (existingIndex !== -1) {
          continueWatching.splice(existingIndex, 1);
        }
      } else {
        const movieWithProgress = {
          ...movie,
          progress: progress,
          lastWatched: Date.now(), // Ajout d'un timestamp pour trier par date récente
        };

        if (existingIndex !== -1) {
          continueWatching[existingIndex] = movieWithProgress;
        } else {
          continueWatching.unshift(movieWithProgress);
          // Garder seulement les 10 derniers films
          continueWatching = continueWatching.slice(0, 10);
        }
      }

      this._setLocalStorage("continueWatching", continueWatching);
      return continueWatching;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la progression:", error);
      return [];
    }
  }

  // Gestion de Ma Liste
  toggleMyList(movie) {
    try {
      const myList = this._getFromLocalStorage("myList");
      const existingIndex = myList.findIndex((m) => m.id === movie.id);

      if (existingIndex !== -1) {
        // Retirer de la liste
        myList.splice(existingIndex, 1);
        this._setLocalStorage("myList", myList);
        return { inList: false, list: myList };
      } else {
        // Ajouter à la liste
        myList.unshift(movie);
        this._setLocalStorage("myList", myList);
        return { inList: true, list: myList };
      }
    } catch (error) {
      console.error("Erreur lors de la gestion de Ma Liste:", error);
      return { inList: false, list: [] };
    }
  }

  // Vérifier si un film est dans Ma Liste
  isInMyList(movieId) {
    const myList = this._getFromLocalStorage("myList");
    return myList.some((m) => m.id === movieId);
  }

  // Récupérer les films à continuer
  getContinueWatching() {
    return this._getFromLocalStorage("continueWatching").sort(
      (a, b) => (b.lastWatched || 0) - (a.lastWatched || 0)
    );
  }

  // Récupérer Ma Liste
  getMyList() {
    return this._getFromLocalStorage("myList");
  }

  // Obtenir les genres de films
  async getMovieGenres() {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/genre/movie/list?api_key=${this.config.API_KEY}&language=${this.config.LANGUAGE}`
      );
      const data = await response.json();
      return data.genres;
    } catch (error) {
      console.error("Erreur lors de la récupération des genres:", error);
      return [];
    }
  }

  // Obtenir les séries populaires
  async getPopularSeries() {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/tv/popular?api_key=${this.config.API_KEY}&language=${this.config.LANGUAGE}&${this.config.DEFAULT_PARAMS}`
      );
      const data = await response.json();
      // Adapter le format des séries pour correspondre au format des films
      return data.results.map((show) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
      }));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des séries populaires:",
        error
      );
      return [];
    }
  } // Obtenir l'URL de la vidéo d'un film depuis notre fichier JSON local
  async getMovieVideoUrl(movieId) {
    try {
      const response = await fetch("/assets/movies.json");
      if (!response.ok) {
        throw new Error("Impossible de charger le fichier movies.json");
      }
      const data = await response.json();

      // Chercher le film spécifique par ID
      const movie = data.movies.find((m) => m.id === movieId);
      if (movie && movie.videoUrl) {
        return movie.videoUrl;
      }

      // Fallback: retourner la première vidéo disponible si l'ID n'est pas trouvé
      if (data.movies && data.movies.length > 0) {
        return data.movies[0].videoUrl;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors du chargement de la vidéo:", error);
      return null;
    }
  }
  // Obtenir les films les mieux notés
  async getTopRatedMovies() {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/movie/top_rated?api_key=${this.config.API_KEY}&language=${this.config.LANGUAGE}&${this.config.DEFAULT_PARAMS}`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des films les mieux notés:",
        error
      );
      return [];
    }
  }

  // Obtenir les séries les mieux notées
  async getTopRatedSeries() {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/tv/top_rated?api_key=${this.config.API_KEY}&language=${this.config.LANGUAGE}&${this.config.DEFAULT_PARAMS}`
      );
      const data = await response.json();
      // Adapter le format des séries pour correspondre au format des films
      return data.results.map((show) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
      }));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des séries les mieux notées:",
        error
      );
      return [];
    }
  }
  // Nouvelle méthode pour charger les films locaux
  async getLocalMovies() {
    try {
      const response = await fetch("/assets/movies.json");
      if (!response.ok) {
        throw new Error("Impossible de charger le fichier movies.json");
      }
      const data = await response.json();

      // Pour chaque film local, rechercher ses informations via TMDB
      const moviesWithDetails = await Promise.all(
        data.movies.map(async (localMovie) => {
          try {
            // Rechercher le film par titre sur TMDB
            const searchResults = await this.searchMovies(localMovie.title);

            if (searchResults && searchResults.length > 0) {
              // Prendre le premier résultat qui correspond le mieux
              const tmdbMovie = searchResults[0];

              // Récupérer les détails complets du film
              const movieDetails = await this.getMovieDetails(tmdbMovie.id);

              if (movieDetails) {
                // Combiner les données TMDB avec l'URL vidéo locale
                return {
                  ...movieDetails,
                  // Créer un ID unique pour le film local
                  id: `local-${tmdbMovie.id}`,
                  originalTmdbId: tmdbMovie.id,
                  videoUrl: localMovie.videoUrl,
                  // Marquer comme film local
                  isLocal: true,
                };
              }
            }

            // Si aucun résultat TMDB trouvé, créer une entrée basique
            return {
              id: `local-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              title: localMovie.title,
              videoUrl: localMovie.videoUrl,
              overview: `${localMovie.title} - Film disponible en streaming sur HZFlix`,
              poster_path: null,
              backdrop_path: null,
              release_date: "2024",
              vote_average: 8.0,
              runtime: 120,
              genres: [
                { id: 28, name: "Action" },
                { id: 12, name: "Aventure" },
              ],
              isLocal: true,
            };
          } catch (error) {
            console.error(
              `Erreur lors de la recherche de "${localMovie.title}":`,
              error
            );

            // Retourner une entrée basique en cas d'erreur
            return {
              id: `local-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              title: localMovie.title,
              videoUrl: localMovie.videoUrl,
              overview: `${localMovie.title} - Film disponible en streaming sur HZFlix`,
              poster_path: null,
              backdrop_path: null,
              release_date: "2024",
              vote_average: 8.0,
              runtime: 120,
              genres: [
                { id: 28, name: "Action" },
                { id: 12, name: "Aventure" },
              ],
              isLocal: true,
            };
          }
        })
      );

      return moviesWithDetails.filter((movie) => movie !== null);
    } catch (error) {
      console.error("Erreur lors du chargement des films locaux:", error);
      return [];
    }
  }
}
