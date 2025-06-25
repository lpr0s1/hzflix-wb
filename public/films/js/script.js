// Instance du service TMDB
const tmdbService = new TMDBService();

// État local pour stocker les films
let movies = {
  trending: [],
  popular: [],
  continue: [], // Cette partie sera gérée localement avec localStorage
};

// Fonction pour créer une carte de film
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const posterPath = movie.poster_path || movie.backdrop_path;
  const imageUrl = tmdbService.getImageUrl(posterPath, CONFIG.POSTER_SIZE);

  card.innerHTML = `
        <img src="${imageUrl}" alt="${movie.title}" loading="lazy">
        <div class="movie-info">
            <h4>${movie.title}</h4>
            ${
              movie.progress
                ? `<div class="progress-bar"><div style="width: ${movie.progress}%"></div></div>`
                : ""
            }
            <div class="movie-overview">
                <p>${truncateText(movie.overview, 100)}</p>
            </div>
        </div>
    `;

  // Ajouter un gestionnaire d'événements pour afficher les détails
  card.addEventListener("click", () => showMovieDetails(movie.id));

  return card;
}

// Fonction pour extraire l'ID YouTube de l'URL
function getYoutubeEmbedUrl(trailerUrl) {
  if (!trailerUrl) return null;
  const videoId = trailerUrl.split("v=")[1];
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : null;
}

// Fonction pour générer les étoiles de notation
function generateStarRating(rating) {
  const starTotal = 5;
  const starPercentage = (rating / 10) * starTotal;
  const fullStars = Math.floor(starPercentage);
  const hasHalfStar = starPercentage - fullStars >= 0.5;
  const emptyStars = starTotal - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];

  // Étoiles pleines
  for (let i = 0; i < fullStars; i++) {
    stars.push('<span class="star full">★</span>');
  }

  // Demi-étoile
  if (hasHalfStar) {
    stars.push('<span class="star half">★</span>');
  }

  // Étoiles vides
  for (let i = 0; i < emptyStars; i++) {
    stars.push('<span class="star empty">★</span>');
  }

  return `
        <div class="star-rating" title="${rating.toFixed(1)}/10">
            <div class="stars">${stars.join("")}</div>
            <div class="rating-number">${rating.toFixed(1)}</div>
        </div>
    `;
}

// Fonction pour afficher les détails d'un film
async function showMovieDetails(movieId) {
  // D'abord essayer de trouver le film dans les films locaux
  const localMovies = await tmdbService.getLocalMovies();
  let movie = localMovies.find((m) => m.id === movieId);

  // Si le film n'est pas trouvé localement, essayer avec l'API TMDB
  if (!movie) {
    movie = await tmdbService.getMovieDetails(movieId);
  }

  if (!movie) return;

  // Pour les films locaux, utiliser les données par défaut
  const trailerUrl = movie.trailerUrl || null; // Les films locaux n'ont pas de bande-annonce pour l'instant
  const embedUrl = getYoutubeEmbedUrl(trailerUrl);

  // Pour les films locaux, pas besoin de charger les crédits et recommandations depuis TMDB
  let credits = null;
  let recommendations = [];

  // Si ce n'est pas un film local, charger les données TMDB
  if (!localMovies.find((m) => m.id === movieId)) {
    credits = await tmdbService.getMovieCredits(movieId);
    recommendations = await tmdbService.getMovieRecommendations(movieId);
  }

  const isInList = tmdbService.isInMyList(movieId);

  const modal = document.createElement("div");
  modal.className = "movie-modal";

  const formattedDate = formatDate(movie.release_date);

  // Préparer les éléments HTML pour les actions
  const playButtonHTML = `
    <button class="action-button play-button" data-movie-id="${movie.id}">
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
      Lecture
    </button>
  `;

  const listButtonHTML = `
    <button class="action-button list-button ${
      isInList ? "in-list" : ""
    }" data-movie-id="${movie.id}">
      <svg viewBox="0 0 24 24">
        <path d="${
          isInList
            ? "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            : "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
        }" fill="currentColor" />
      </svg>
      ${isInList ? "Dans ma liste" : "Ma Liste"}
    </button>
  `;

  modal.innerHTML = `
    <div class="modal-content">
      ${
        embedUrl
          ? `<div class="modal-video-container">
              <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
            </div>`
          : `<div class="modal-backdrop" style="background-image: url('${
              movie.backdrop_path
                ? tmdbService.getImageUrl(movie.backdrop_path)
                : "https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=" +
                  encodeURIComponent(movie.title)
            }')">
              <div class="backdrop-overlay"></div>
            </div>`
      }

      <div class="modal-info">
        <button class="modal-close">&times;</button>

        <div class="modal-header">
          <h2>${movie.title}</h2>
          
          <div class="movie-meta">
            <div class="rating-container">
              ${generateStarRating(movie.vote_average)}
            </div>
            <span class="meta-item">${formattedDate}</span>
            <span class="meta-item">${Math.floor(movie.runtime / 60)}h ${
    movie.runtime % 60
  }min</span>
            ${
              movie.genres
                ? `
                <div class="genres">
                  ${movie.genres
                    .map(
                      (genre) => `<span class="genre-tag">${genre.name}</span>`
                    )
                    .join("")}
                </div>
              `
                : ""
            }
          </div>
          
          <div class="modal-actions">
            ${playButtonHTML}
            ${listButtonHTML}
          </div>
        </div>

        <div class="modal-body">
          <p class="overview">${movie.overview}</p>

          ${
            credits && credits.cast
              ? `
              <div class="cast-section">
                <h3>Distribution</h3>
                <div class="cast-list">
                  ${credits.cast
                    .slice(0, 6)
                    .map(
                      (actor) => `
                      <div class="cast-member">
                        <div class="cast-photo" style="background-image: url('${tmdbService.getImageUrl(
                          actor.profile_path,
                          "w185"
                        )}')"></div>
                        <div class="cast-info">
                          <span class="actor-name">${actor.name}</span>
                          <span class="character-name">${actor.character}</span>
                        </div>
                      </div>
                    `
                    )
                    .join("")}
                </div>
              </div>
            `
              : ""
          }
          
          ${
            recommendations && recommendations.length > 0
              ? `
              <div class="recommendations-section">
                <h3>Titres similaires</h3>
                <div class="recommendations-list">
                  ${recommendations
                    .slice(0, 5)
                    .map(
                      (rec) => `
                      <div class="recommendation-item" data-movie-id="${
                        rec.id
                      }">
                        <div class="recommendation-poster" style="background-image: url('${tmdbService.getImageUrl(
                          rec.poster_path,
                          "w342"
                        )}')">
                          <div class="recommendation-info">
                            <span class="rec-title">${rec.title}</span>
                            <span class="rec-rating">${generateStarRating(
                              rec.vote_average
                            )}</span>
                          </div>
                        </div>
                      </div>
                    `
                    )
                    .join("")}
                </div>
              </div>
            `
              : ""
          }
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Gestionnaire de fermeture
  const closeModal = () => {
    modal.classList.add("closing");
    setTimeout(() => modal.remove(), 300);
  };

  modal.querySelector(".modal-close").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Gestionnaires d'événements pour les boutons
  const playButton = modal.querySelector(".play-button");
  if (playButton) {
    playButton.addEventListener("click", () => playMovie(movie));
  }

  const listButton = modal.querySelector(".list-button");
  if (listButton) {
    listButton.addEventListener("click", () => {
      const result = tmdbService.toggleMyList(movie);
      if (result.inList) {
        listButton.classList.add("in-list");
        listButton.innerHTML = `
          <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
          </svg>
          Dans ma liste
        `;
      } else {
        listButton.classList.remove("in-list");
        listButton.innerHTML = `
          <svg viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
          Ma Liste
        `;
      }
    });
  }

  // Gestionnaires d'événements pour les recommandations
  modal.querySelectorAll(".recommendation-item").forEach((item) => {
    const recId = parseInt(item.dataset.movieId);
    item.addEventListener("click", () => {
      closeModal();
      showMovieDetails(recId);
    });
  });

  // Animation d'ouverture
  requestAnimationFrame(() => {
    modal.classList.add("show");
  });
}

// Fonction pour remplir les rangées de films
async function populateMovieRows() {
  try {
    // Récupérer les films locaux
    const localMovies = await tmdbService.getLocalMovies();

    if (localMovies.length === 0) {
      console.warn("Aucun film local trouvé dans movies.json");
      return;
    }

    // Utiliser les films locaux pour toutes les sections
    movies.trending = localMovies;
    movies.popular = localMovies;

    // Remplir la section "Tendances actuelles"
    const trendingRow = document.querySelector(".trending .movie-row");
    trendingRow.innerHTML = "";
    localMovies.forEach((movie) => {
      trendingRow.appendChild(createMovieCard(movie));
    });

    // Remplir la section "Populaire sur HZFlix"
    const popularRow = document.querySelector(".popular .movie-row");
    popularRow.innerHTML = "";
    localMovies.forEach((movie) => {
      popularRow.appendChild(createMovieCard(movie));
    });

    // Charger les films "Continuer à regarder" avec la méthode dédiée
    const continueWatching = tmdbService.getContinueWatching();
    movies.continue = continueWatching;

    const continueWatchingSection =
      document.querySelector(".continue-watching");

    // Afficher ou masquer la section selon qu'il y a des films à continuer ou non
    if (continueWatching.length === 0) {
      // Option 1: Masquer complètement la section
      // continueWatchingSection.style.display = "none";

      // Option 2: Afficher un message
      continueWatchingSection.innerHTML = `
        <h3>Continuer à regarder</h3>
        <div class="empty-continue">
          <p>Vous n'avez pas de films en cours de visionnage.</p>
          <p>Les films que vous commencez à regarder apparaîtront ici.</p>
        </div>
      `;
    } else {
      // Afficher les films en cours de visionnage
      continueWatchingSection.innerHTML = `
        <h3>Continuer à regarder</h3>
        <div class="movie-row"></div>
      `;

      const continueRow = continueWatchingSection.querySelector(".movie-row");
      continueWatching.forEach((movie) => {
        continueRow.appendChild(createMovieCard(movie));
      });
    }

    // Mettre à jour le film à la une avec le premier film local
    if (localMovies.length > 0) {
      updateFeaturedMovie(localMovies[0]);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des films:", error);
  }
}

// Fonction pour mettre à jour le film à la une
function updateFeaturedMovie(movie) {
  const featuredContent = document.querySelector(".featured-content");
  const backdropUrl = tmdbService.getImageUrl(movie.backdrop_path);

  document.querySelector(
    ".hero"
  ).style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url('${backdropUrl}')`;
  featuredContent.querySelector("h2").textContent = movie.title;
  featuredContent.querySelector(".description").textContent = movie.overview;

  // Ajouter les gestionnaires d'événements pour les boutons
  const playButton = featuredContent.querySelector(".play-btn");
  const infoButton = featuredContent.querySelector(".info-btn");
  playButton.onclick = () => {
    playMovie(movie);
  };

  infoButton.onclick = () => {
    showMovieDetails(movie.id);
  };
}

// Effet de scroll pour le header
function handleHeaderScroll() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Fonction de recherche
async function handleSearch() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value.trim();

  if (!query) return;

  try {
    // Rechercher d'abord dans les films locaux
    const localMovies = await tmdbService.getLocalMovies();
    const localResults = localMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );

    // Créer une nouvelle section pour les résultats
    const mainElement = document.querySelector("main");
    let searchSection = document.querySelector(".search-results");

    if (!searchSection) {
      searchSection = document.createElement("section");
      searchSection.className = "search-results";
      mainElement.insertBefore(
        searchSection,
        mainElement.firstChild.nextSibling
      );
    }

    // Si on trouve des résultats locaux, les afficher en priorité
    if (localResults.length > 0) {
      searchSection.innerHTML = `
        <h3>Résultats de recherche pour "${query}" - Films Disponibles</h3>
        <div class="movie-row"></div>
      `;

      const movieRow = searchSection.querySelector(".movie-row");
      localResults.forEach((movie) => {
        movieRow.appendChild(createMovieCard(movie));
      });
    } else {
      // Si aucun résultat local, chercher dans TMDB (optionnel)
      const searchResults = await tmdbService.searchMovies(query);

      searchSection.innerHTML = `
        <h3>Résultats de recherche pour "${query}"</h3>
        <div class="movie-row"></div>
      `;

      const movieRow = searchSection.querySelector(".movie-row");

      // Vérifier si nous avons des résultats
      if (searchResults.length === 0) {
        movieRow.innerHTML =
          '<div class="no-results">Aucun résultat trouvé dans notre catalogue</div>';
      } else {
        searchResults.forEach((movie) => {
          movieRow.appendChild(createMovieCard(movie));
        });
      }
    }

    // Faire défiler jusqu'aux résultats
    searchSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
  }
}

// Gestion de la navigation
async function handleNavigation(section) {
  // Mettre à jour la classe active
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.remove("active");
  });
  document
    .querySelector(`.nav-links a[data-section="${section}"]`)
    .classList.add("active");

  // Vider les sections existantes sauf le hero pour l'accueil
  const main = document.querySelector("main");
  const hero = document.querySelector(".hero");
  const searchResults = document.querySelector(".search-results");

  if (searchResults) {
    searchResults.remove();
  }

  // Masquer toutes les sections existantes
  document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
    section.style.display = "none";
  });

  // Afficher/masquer le hero selon la section
  if (hero) {
    hero.style.display = section === "home" ? "flex" : "none";
  }

  try {
    switch (section) {
      case "home":
        // Afficher les sections d'accueil
        document
          .querySelectorAll(".trending, .popular, .continue-watching")
          .forEach((section) => {
            section.style.display = "block";
          });
        await populateMovieRows();
        break;
      case "series":
        // Créer et peupler la section séries
        let seriesSection = document.querySelector(".series-section");
        if (!seriesSection) {
          seriesSection = document.createElement("section");
          seriesSection.className = "series-section";
          main.appendChild(seriesSection);
        }
        seriesSection.innerHTML = `
                  <h3>Séries Populaires</h3>
                  <div class="movie-row popular-series"></div>
                  <h3>Séries les Mieux Notées</h3>
                  <div class="movie-row top-rated-series"></div>
              `;
        const popularSeriesRow = seriesSection.querySelector(
          ".movie-row.popular-series"
        );
        const topRatedSeriesRow = seriesSection.querySelector(
          ".movie-row.top-rated-series"
        );

        // Charger les séries populaires et les mieux notées en parallèle
        const [popularSeries, topRatedSeries] = await Promise.all([
          tmdbService.getPopularSeries(),
          tmdbService.getTopRatedSeries(),
        ]);

        // Afficher les séries populaires
        popularSeries.forEach((show) => {
          popularSeriesRow.appendChild(createMovieCard(show));
        });

        // Afficher les séries les mieux notées
        topRatedSeries.forEach((show) => {
          topRatedSeriesRow.appendChild(createMovieCard(show));
        });

        seriesSection.style.display = "block";
        break;
      case "movies":
        // Créer et peupler la section films avec les films locaux
        let moviesSection = document.querySelector(".movies-section");
        if (!moviesSection) {
          moviesSection = document.createElement("section");
          moviesSection.className = "movies-section";
          main.appendChild(moviesSection);
        }

        const localMovies = await tmdbService.getLocalMovies();

        moviesSection.innerHTML = `
          <h3>Films Disponibles</h3>
          <div class="movie-row local-movies"></div>
          ${
            localMovies.length > 1
              ? `
            <h3>Sélection du Moment</h3>
            <div class="movie-row featured-movies"></div>
          `
              : ""
          }
        `;

        const localMoviesRow = moviesSection.querySelector(
          ".movie-row.local-movies"
        );
        const featuredMoviesRow = moviesSection.querySelector(
          ".movie-row.featured-movies"
        );

        // Afficher tous les films locaux dans la première section
        localMovies.forEach((movie) => {
          localMoviesRow.appendChild(createMovieCard(movie));
        });

        // Si on a plusieurs films, dupliquer dans la section "Sélection du Moment"
        if (featuredMoviesRow && localMovies.length > 1) {
          localMovies.forEach((movie) => {
            featuredMoviesRow.appendChild(createMovieCard(movie));
          });
        }

        moviesSection.style.display = "block";
        break;

      case "mylist":
        // Créer et peupler la section Ma Liste
        let myListSection = document.querySelector(".mylist-section");
        if (!myListSection) {
          myListSection = document.createElement("section");
          myListSection.className = "mylist-section";
          main.appendChild(myListSection);
        }
        const myList = JSON.parse(localStorage.getItem("myList") || "[]");

        if (myList.length === 0) {
          // Afficher un message quand la liste est vide
          myListSection.innerHTML = `
            <h3>Ma Liste</h3>
            <div class="empty-list">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
              </svg>
              <h4>Votre liste est vide</h4>
              <p>Ajoutez des films et des séries à votre liste en cliquant sur le bouton "Ma Liste" pendant que vous parcourez le site.</p>
            </div>
          `;
        } else {
          // Afficher les films si la liste n'est pas vide
          myListSection.innerHTML = `
            <h3>Ma Liste</h3>
            <div class="movie-row"></div>
          `;
          const myListRow = myListSection.querySelector(".movie-row");
          myList.forEach((movie) => {
            myListRow.appendChild(createMovieCard(movie));
          });
        }

        myListSection.style.display = "block";
        break;
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la section:", error);
  }
}

// Ajouter les écouteurs d'événements pour la recherche
document.getElementById("searchButton").addEventListener("click", handleSearch);
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

// Fonction pour créer le lecteur vidéo
function createVideoPlayer(movieTitle, videoUrl, movie) {
  const modal = document.createElement("div");
  modal.className = "video-player-modal";

  modal.innerHTML = `
    <div class="video-container">
      <video class="video-player">
        <source src="${videoUrl}" type="video/mp4">
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
      <div class="loading-spinner"></div>
      <div class="video-title-overlay">
        <h2 class="video-title">${movieTitle}</h2>
      </div>
      <button class="video-close">&times;</button>
      <div class="video-controls">
        <div class="controls-wrapper">
          <button class="video-control-button play-pause">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
            </svg>
          </button>
          <div class="time-display">0:00 / 0:00</div>
          <div class="video-progress">
            <div class="video-progress-filled"></div>
          </div>
          <div class="volume-control">
            <button class="video-control-button volume">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M3,9V15H7L12,20V4L7,9H3Z"/>
              </svg>
            </button>
            <div class="volume-slider-container">
              <input type="range" class="volume-slider" min="0" max="100" value="100">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Sélectionner tous les éléments nécessaires
  const elements = {
    video: modal.querySelector(".video-player"),
    closeBtn: modal.querySelector(".video-close"),
    playPauseBtn: modal.querySelector(".play-pause"),
    loading: modal.querySelector(".loading-spinner"),
    progress: modal.querySelector(".video-progress-filled"),
    timeDisplay: modal.querySelector(".time-display"),
    progressBar: modal.querySelector(".video-progress"),
    volumeBtn: modal.querySelector(".volume"),
    volumeSlider: modal.querySelector(".volume-slider"),
  };
  // Configuration initiale du volume avec préférences sauvegardées
  const savedVolume =
    parseFloat(localStorage.getItem("videoPlayerVolume")) || 1;
  const isMuted = localStorage.getItem("videoPlayerMuted") === "true";
  let lastVolume = savedVolume;
  let videoLoaded = false;

  // Gestion du chargement de la vidéo
  elements.video.addEventListener("loadeddata", () => {
    videoLoaded = true;
    elements.loading.style.display = "none";
    playVideo(); // Démarrer la lecture automatiquement une fois chargée
  });

  // Définir la source de la vidéo après la configuration des événements
  elements.video.src = videoUrl;

  // Appliquer les paramètres sauvegardés
  elements.video.volume = savedVolume;
  elements.video.muted = isMuted;
  elements.volumeSlider.value = savedVolume * 100;

  // Fonctions de gestion du volume
  const saveVolumePreferences = () => {
    localStorage.setItem("videoPlayerVolume", elements.video.volume);
    localStorage.setItem("videoPlayerMuted", elements.video.muted);
  };

  const updateVolumeIcon = () => {
    const volume = elements.video.volume;
    let icon;
    if (elements.video.muted || volume === 0) {
      // Icône muet
      icon = `
        <path fill="currentColor" d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z"/>
      `;
    } else if (volume < 0.5) {
      // Volume bas
      icon = `
        <path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"/>
      `;
    } else {
      // Volume élevé
      icon = `
        <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12Z M3,9V15H7L12,20V4L7,9H3Z"/>
      `;
    }
    elements.volumeBtn.innerHTML = `<svg viewBox="0 0 24 24">${icon}</svg>`;
  };

  // Configuration des gestionnaires d'événements pour le volume
  elements.volumeBtn.onclick = () => {
    if (elements.video.muted || elements.video.volume === 0) {
      elements.video.muted = false;
      elements.video.volume = lastVolume;
      elements.volumeSlider.value = lastVolume * 100;
    } else {
      lastVolume = elements.video.volume;
      elements.video.volume = 0;
      elements.volumeSlider.value = 0;
    }
    updateVolumeIcon();
    saveVolumePreferences();
  };

  elements.volumeSlider.addEventListener("input", () => {
    const value = elements.volumeSlider.value / 100;
    elements.video.volume = value;
    elements.video.muted = value === 0;
    if (value > 0) {
      lastVolume = value;
    }
    updateVolumeIcon();
    saveVolumePreferences();
  });

  elements.video.addEventListener("volumechange", () => {
    updateVolumeIcon();
    saveVolumePreferences();
  });

  updateVolumeIcon();

  // Gestionnaires d'événements pour le lecteur vidéo
  const stopAndClosePlayer = () => {
    elements.video.pause();
    elements.video.currentTime = 0;
    elements.video.src = "";
    elements.video.load();
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.remove();
      document.removeEventListener("keydown", handleKeyPress);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      stopAndClosePlayer();
    }
  };

  document.addEventListener("keydown", handleKeyPress);
  elements.closeBtn.onclick = stopAndClosePlayer;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) stopAndClosePlayer();
  });
  // Gestion des erreurs de lecture
  let errorLogged = false;
  elements.video.addEventListener("error", (e) => {
    if (!errorLogged) {
      console.error("Erreur de lecture vidéo:", e.target.error);
      errorLogged = true;
      // Afficher un message à l'utilisateur
      const errorMessage = document.createElement("div");
      errorMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 8px;
        color: white;
        text-align: center;
        z-index: 12;
      `;
      errorMessage.textContent =
        "Désolé, une erreur est survenue lors de la lecture de la vidéo.";
      modal.querySelector(".video-container").appendChild(errorMessage);

      // Fermer automatiquement après 3 secondes
      setTimeout(() => {
        stopAndClosePlayer();
      }, 3000);
    }
  });

  // Fermer le modal si la vidéo est terminée
  elements.video.addEventListener("ended", stopAndClosePlayer);

  let isPlaying = false;
  const playVideo = () => {
    if (!videoLoaded) {
      elements.loading.style.display = "block";
      return;
    }
    elements.video.play().catch((error) => {
      console.warn("Erreur lors de la lecture:", error);
      elements.loading.style.display = "none";
    });
    isPlaying = true;
    elements.playPauseBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M6,19h4V5H6V19M14,5v14h4V5H14z"/>
      </svg>`;
  };

  const pauseVideo = () => {
    elements.video.pause();
    isPlaying = false;
    elements.playPauseBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
      </svg>`;
  };

  elements.playPauseBtn.onclick = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  // Gestion de la barre de progression
  elements.progressBar.addEventListener("click", (e) => {
    const rect = elements.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    elements.video.currentTime = pos * elements.video.duration;
  });

  let isDragging = false;

  elements.progressBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateProgress(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateProgress(e);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  const updateProgress = (e) => {
    const rect = elements.progressBar.getBoundingClientRect();
    const pos = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
    elements.video.currentTime = pos * elements.video.duration;
  };

  // Mettre à jour l'affichage du temps
  elements.video.addEventListener("timeupdate", () => {
    const currentTime = elements.video.currentTime;
    const duration = elements.video.duration;
    elements.timeDisplay.textContent = `${formatTime(
      currentTime
    )} / ${formatTime(duration)}`;
    const percentage = (currentTime / duration) * 100;
    elements.progress.style.width = `${percentage}%`;
  });

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
  };

  elements.video.ontimeupdate = updateTimeDisplay;

  // Mettre à jour l'affichage du temps et la barre de progression
  function updateTimeDisplay() {
    const currentTime = elements.video.currentTime;
    const duration = elements.video.duration;
    elements.timeDisplay.textContent = `${formatTime(
      currentTime
    )} / ${formatTime(duration)}`;
    const percentage = (currentTime / duration) * 100;
    elements.progress.style.width = `${percentage}%`;
  }
  // Gestion du clic sur la vidéo
  elements.video.addEventListener("click", (e) => {
    // Vérifier que c'est un vrai clic utilisateur
    if (e.isTrusted) {
      // Créer l'élément d'animation
      const clickAnimation = document.createElement("div");
      clickAnimation.className = "video-click-animation";

      // Ajouter l'icône appropriée avec une taille plus grande
      const icon = isPlaying
        ? '<svg viewBox="0 0 24 24" style="width: 80px; height: 80px;"><path fill="currentColor" d="M6,19h4V5H6V19M14,5v14h4V5H14z"/></svg>'
        : '<svg viewBox="0 0 24 24" style="width: 80px; height: 80px;"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>';

      clickAnimation.innerHTML = icon;

      // Positionner l'animation là où l'utilisateur a cliqué
      clickAnimation.style.left = `${e.clientX - 80}px`;
      clickAnimation.style.top = `${e.clientY - 80}px`;

      // Ajouter l'animation au conteneur
      modal.querySelector(".video-container").appendChild(clickAnimation);

      // Déclencher l'animation
      requestAnimationFrame(() => {
        clickAnimation.classList.add("show");
      });

      // Supprimer l'élément après l'animation
      setTimeout(() => {
        clickAnimation.remove();
      }, 800);

      togglePlayPause();
    }
  });

  // Lecture automatique sur mobile
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  // Sauvegarder la progression régulièrement
  let currentMovieData = null;

  // Récupérer les données du film associées à cette vidéo
  tmdbService
    .getMovieDetails(movie.id || movie)
    .then((movieData) => {
      currentMovieData = movieData;
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des détails du film:",
        error
      );
      // Si on ne peut pas obtenir les détails, utiliser les données de base
      currentMovieData =
        typeof movie === "object" ? movie : { id: movie, title: movieTitle };
    });

  // Suivre la progression de la vidéo
  elements.video.addEventListener("timeupdate", () => {
    if (!currentMovieData) return;

    const progress =
      (elements.video.currentTime / elements.video.duration) * 100;
    if (!isNaN(progress) && progress > 0 && progress < 98) {
      // Sauvegarder la progression toutes les 5 secondes
      if (Math.floor(elements.video.currentTime) % 5 === 0) {
        tmdbService.saveMovieProgress(currentMovieData, Math.round(progress));
      }
    }
  });

  // Sauvegarder la progression quand la vidéo est fermée
  const saveProgressOnExit = () => {
    if (currentMovieData && elements.video.duration > 0) {
      const progress =
        (elements.video.currentTime / elements.video.duration) * 100;
      if (!isNaN(progress) && progress > 0 && progress < 98) {
        tmdbService.saveMovieProgress(currentMovieData, Math.round(progress));
      }
    }
  };

  // Ajout de l'événement de sauvegarde à la fermeture
  modal
    .querySelector(".video-close")
    .addEventListener("click", saveProgressOnExit);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) saveProgressOnExit();
  });

  // Quand la vidéo est terminée (plus de 98% visionnée), la retirer de "continuer à regarder"
  elements.video.addEventListener("ended", () => {
    if (currentMovieData) {
      tmdbService.saveMovieProgress(currentMovieData, 100);
      // Rafraîchir la section "Continuer à regarder" si nécessaire
      const continueWatchingSection =
        document.querySelector(".continue-watching");
      if (
        continueWatchingSection &&
        continueWatchingSection.style.display !== "none"
      ) {
        populateMovieRows();
      }
    }
  });
}

// Fonction pour lire un film
async function playMovie(movie) {
  try {
    const loadingMessage = document.createElement("div");
    loadingMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 8px;
      color: white;
      text-align: center;
      z-index: 1000;
    `;
    loadingMessage.textContent = "Chargement de la vidéo...";
    document.body.appendChild(loadingMessage);

    const videoUrl = await tmdbService.getMovieVideoUrl(movie.id);
    loadingMessage.remove();

    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim() !== "") {
      createVideoPlayer(movie.title, videoUrl, movie);

      // Marquer que l'utilisateur a commencé à regarder ce film
      if (!movie.progress) {
        tmdbService.saveMovieProgress(movie, 0);
        // Rafraîchir la section "Continuer à regarder" si elle est visible
        const continueWatchingSection =
          document.querySelector(".continue-watching");
        if (
          continueWatchingSection &&
          continueWatchingSection.style.display !== "none"
        ) {
          setTimeout(() => populateMovieRows(), 500);
        }
      }
    } else {
      console.warn("Aucune URL de vidéo valide trouvée pour ce film.");
      const errorMessage = document.createElement("div");
      errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 8px;
        color: white;
        text-align: center;
        z-index: 1000;
      `;
      errorMessage.textContent =
        "Désolé, la vidéo n'est pas disponible pour le moment.";
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la vidéo:", error);
    const errorMessage = document.createElement("div");
    errorMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 8px;
      color: white;
      text-align: center;
      z-index: 1000;
    `;
    errorMessage.textContent =
      "Erreur lors du chargement de la vidéo. Veuillez réessayer plus tard.";
    document.body.appendChild(errorMessage);
    setTimeout(() => {
      errorMessage.remove();
    }, 3000);
  }
}

// Initialiser l'application
async function init() {
  handleHeaderScroll();
  await populateMovieRows();

  // Initialiser les écouteurs d'événements de recherche avec debounce
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  // Utiliser debounce pour éviter trop d'appels API pendant la frappe
  searchInput.addEventListener("input", debounce(handleSearch, 500));
  searchButton.addEventListener("click", handleSearch);

  // Écouteur d'événements pour la navigation
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      handleNavigation(section);
    });
  });
}

// Démarrer l'application
init();
