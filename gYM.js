
let isSignUp = true;
let selectedPlan = "Basic";

function joinGym() {
    document.getElementById("authPopup").style.display = "flex";
    showForm();
}

function closePopup() {
    document.getElementById("authPopup").style.display = "none";
    document.getElementById("authForm").reset();
    document.getElementById("message").textContent = "";
}

function switchForm(event) {
    event.preventDefault();
    isSignUp = !isSignUp;
    showForm();
}

function showForm() {
    const title = document.getElementById("formTitle");
    const description = document.getElementById("formDescription");
    const fullName = document.getElementById("fullName");
    const submitBtn = document.getElementById("submitBtn");
    const switchText = document.getElementById("switchText");
    const message = document.getElementById("message");

    title.textContent = isSignUp ? "SIGN UP" : "LOG IN";

    description.textContent = isSignUp
        ? "Create your POWERGYM account."
        : "Welcome back to POWERGYM!";

    fullName.style.display = isSignUp ? "block" : "none";
    fullName.required = isSignUp;

    submitBtn.textContent = isSignUp
        ? "CREATE ACCOUNT"
        : "LOG IN";

    switchText.innerHTML = isSignUp
        ? 'Already have an account? <a href="#" onclick="switchForm(event)">Log In</a>'
        : 'Don\'t have an account? <a href="#" onclick="switchForm(event)">Sign Up</a>';

    message.textContent = "";
}

// Register or log in
document.getElementById("authForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    let accounts = JSON.parse(localStorage.getItem("gymAccounts") || "[]");

    if (isSignUp) {
        if (accounts.some(account => account.email === email)) {
            message.style.color = "#ff4500";
            message.textContent = "This email already has an account. Please log in.";
            return;
        }

        const account = {
            name: name,
            email: email,
            password: password,
            plan: selectedPlan,
            memberSince: new Date().toISOString()
        };

        accounts.push(account);
        localStorage.setItem("gymAccounts", JSON.stringify(accounts));

        sessionStorage.setItem("gymUserEmail", email);
        window.location.href = "dashboard.html";

    } else {
        const account = accounts.find(
            account =>
                account.email === email &&
                account.password === password
        );

        if (!account) {
            message.style.color = "#ff4500";
            message.textContent = "Incorrect email or password.";
            return;
        }

        sessionStorage.setItem("gymUserEmail", email);
        window.location.href = "dashboard.html";
    }
});

// Choose a membership plan
function selectPlan(planName) {
    selectedPlan = planName;
    joinGym();

    document.getElementById("formDescription").textContent =
        "Create your account to join the " + planName + " plan.";
}

// Contact button
function contactGym() {
    document.getElementById("contact").scrollIntoView({
        behavior: "smooth"
    });
}

// Close popup by clicking outside
document.getElementById("authPopup").addEventListener("click", function(event) {
    if (event.target === this) {
        closePopup();
    }
});
