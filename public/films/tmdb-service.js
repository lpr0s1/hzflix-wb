// Service pour gérer les appels API TMDB
class TMDBService {
  constructor() {
    this.config = CONFIG;
  }

  // Récupérer les films tendance
  async getTrendingMovies() {
    try {
      const response = await fetch(
        `${this.config.API_BASE_URL}/trending/movie/week?api_key=${this.config.API_KEY}&language=fr-FR`
      );
      const data = await response.json();
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

  // Sauvegarder la progression d'un film
  saveMovieProgress(movie, progress) {
    try {
      let continueWatching = JSON.parse(
        localStorage.getItem("continueWatching") || "[]"
      );
      const existingIndex = continueWatching.findIndex(
        (m) => m.id === movie.id
      );

      const movieWithProgress = {
        ...movie,
        progress: progress,
      };

      if (existingIndex !== -1) {
        continueWatching[existingIndex] = movieWithProgress;
      } else {
        continueWatching.unshift(movieWithProgress);
        // Garder seulement les 10 derniers films
        continueWatching = continueWatching.slice(0, 10);
      }

      localStorage.setItem(
        "continueWatching",
        JSON.stringify(continueWatching)
      );
      return continueWatching;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la progression:", error);
      return [];
    }
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
  }
  // Obtenir l'URL de la vidéo d'un film depuis notre fichier JSON local
  async getMovieVideoUrl(movieId) {
    try {
      const response = await fetch("assets/movies.json");
      if (!response.ok) {
        throw new Error("Impossible de charger le fichier movies.json");
      }
      const data = await response.json();

      // Rechercher le film correspondant dans notre liste
      const movie = data.movies.find(
        (m) => m.tmdbId === movieId || m.id === movieId
      );
      if (movie && movie.videoUrl) {
        return movie.videoUrl;
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

  // Ajouter/Retirer un film de la liste personnelle
  toggleMyList(movie) {
    try {
      let myList = JSON.parse(localStorage.getItem("myList") || "[]");
      const index = myList.findIndex((m) => m.id === movie.id);

      if (index === -1) {
        // Ajouter le film
        myList.push(movie);
        this.showSuccessPopup("Film ajouté à votre liste !");
      } else {
        // Retirer le film
        myList.splice(index, 1);
        this.showSuccessPopup("Film retiré de votre liste");
      }

      localStorage.setItem("myList", JSON.stringify(myList));

      // Mettre à jour l'interface si nous sommes sur la page "Ma Liste"
      const myListSection = document.querySelector(".mylist-section");
      if (myListSection && myListSection.style.display === "block") {
        const myListRow = myListSection.querySelector(".movie-row");
        if (myList.length === 0) {
          myListRow.innerHTML = `
            <div class="empty-list">
              <p>Aucun film dans la liste</p>
              <p class="empty-list-subtitle">Cliquez sur "+ Ma Liste" sur un film pour l'ajouter ici</p>
            </div>
          `;
        } else {
          myListRow.innerHTML = "";
          myList.forEach((movie) => {
            const card = createMovieCard(movie);
            myListRow.appendChild(card);
          });
        }
      }

      return myList;
    } catch (error) {
      console.error("Erreur lors de la modification de Ma Liste:", error);
      return [];
    }
  }

  // Afficher une popup de succès
  showSuccessPopup(message) {
    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 15px;">✓</div>
      ${message}
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.animation = "none";
      popup.style.opacity = "0";
      popup.style.transform = "translate(-50%, -50%) scale(0)";
      setTimeout(() => popup.remove(), 300);
    }, 2000);
  }

  // Vérifier si un film est dans la liste personnelle
  isInMyList(movieId) {
    try {
      const myList = JSON.parse(localStorage.getItem("myList") || "[]");
      return myList.some((movie) => movie.id === movieId);
    } catch (error) {
      console.error("Erreur lors de la vérification de Ma Liste:", error);
      return false;
    }
  }
}
