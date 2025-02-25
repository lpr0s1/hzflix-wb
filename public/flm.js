
        function toggleMenu() {
            document.getElementById('mobileMenu').style.transform = 'translateX(0)';
        }

        function closeMenu() {
            document.getElementById('mobileMenu').style.transform = 'translateX(-100%)';
        }

const liste = [
{name: "henry danger", ima: "https://m.media-amazon.com/images/M/MV5BNDg3ZjBjZmQtMmVlZC00MTJiLThjNDItZjJhMGFlYmYzZmM4XkEyXkFqcGc@._V1_FMjpg_UX780_.jpg", ur: "https://coflix.moe/film/henry-danger-the-movie/"},

{name: "the bayou", ima: "https://m.media-amazon.com/images/M/MV5BOGQ5MGVmOWYtN2Y0NS00MWM5LWI1MjItNTI5NDdkNmRiMzkzXkEyXkFqcGc@._V1_FMjpg_UY11858_.jpg", ur: "https://coflix.moe/film/the-bayou"},

{name: "redouane bougheraba - du panier à l'orange vélodrome", ima: "https://media.themoviedb.org/t/p/w220_and_h330_face/wd4kwLIFIXx7BEB6LqBPEm9Ga48.jpg", ur: "https://coflix.moe/film/redouane-bougheraba-du-panier-a-lorange-velodrome/"},


{name: "captain america - brave new world", ima: "https://m.media-amazon.com/images/M/MV5BNTNlNjZlNTUtMjc3YS00OWU1LTk5NDQtMWQ1MzNkOWU5YWYyXkEyXkFqcGc@._V1_FMjpg_UX1013_.jpg", ur: "https://coflix.moe/film/captain-america-brave-new-world-2025/"}


]





function populateDatalist() {
        const dv = document.getElementById("dt");
        dv.innerHTML = "";

        liste.forEach(mv => {
            let option = document.createElement("option");
            option.value = mv.name;
            dv.appendChild(option);
        });
    }

    populateDatalist()

               function searchMovies() {
    const inp = document.getElementById('searchInput').value.trim().toLowerCase();
    const resu = document.getElementById('searchResults');
const res = document.getElementById("errsr");

    const rech = liste.find(t => t.name === inp);
            
    if (rech) {
resu.style.opacity = "1";
resu.style.filter = "blur(0px)";
resu.style.transition = "all 0.4s ease";
        resu.innerHTML = "<a href='" + rech.ur + "'><img class='imgrech' src='" + rech.ima + "' alt='movie image'></a>";

      
res.innerHTML = "<p style='color: lightgreen'>Film trouvé !</p>";
      res.style.filter = "blur(0px)";

res.style.transform = "scale(1.3)";
    } else {
resu.style.opacity = "0";
resu.style.filter = "blur(10px)";
res.style.opacity = "1";
res.style.transition = "all 0.3s ease";
res.style.transform = "scale(1.0)";
        res.innerHTML = "<p style='color: red'>Aucun film trouvé.</p>";
    }
}

      
    
