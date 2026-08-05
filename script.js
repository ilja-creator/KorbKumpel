const to_app = document.getElementById("app_btn");

to_app.addEventListener("click", (e) => {
    window.location.href = `/app/loading/?from=hp&action=load_app&target=/app/?con=true`;
});