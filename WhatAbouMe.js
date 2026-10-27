const logoutLink = document.getElementById("logoutLink");

logoutLink.addEventListener("click", function (event) {
    event.preventDefault();

    const confirmLogout = confirm("Are you sure you want to log out?");

    if (confirmLogout) {
        sessionStorage.removeItem("gymUserEmail");
        window.location.href = "Gym.html";
    }
});