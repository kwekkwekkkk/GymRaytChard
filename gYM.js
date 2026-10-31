
let isSignUp = true;
let selectedPlan = "";

// OPEN SIGN UP POPUP
function joinGym() {
    isSignUp = true;
    document.getElementById("authPopup").style.display = "flex";
    showForm();
}

// CLOSE POPUP
function closePopup() {
    document.getElementById("authPopup").style.display = "none";
    document.getElementById("authForm").reset();

    selectedPlan = "";
    document.getElementById("message").textContent = "";

    isSignUp = true;
    showForm();
}

// SWITCH BETWEEN SIGN UP AND LOG IN
function switchForm(event) {
    event.preventDefault();
    isSignUp = !isSignUp;
    showForm();
}

// DISPLAY FORM
function showForm() {
    const title = document.getElementById("formTitle");
    const description = document.getElementById("formDescription");
    const fullName = document.getElementById("fullName");
    const password = document.getElementById("password");
    const submitBtn = document.getElementById("submitBtn");
    const switchText = document.getElementById("switchText");
    const message = document.getElementById("message");
    const planText = document.getElementById("selectedPlanText");
    const paymentGroup = document.getElementById("paymentGroup");
    const paymentMethod = document.getElementById("paymentMethod");
    const membershipSelector = document.getElementById("membershipSelector");

    title.textContent = isSignUp ? "SIGN UP" : "LOG IN";
    description.textContent = isSignUp
        ? (selectedPlan ? "Complete your details to join GYMBUDOL." : "Choose a membership plan to get started.")
        : "Welcome back to GYMBUDOL!";

    membershipSelector.style.display = isSignUp ? "flex" : "none";
    planText.style.display = isSignUp ? "block" : "none";
    paymentGroup.style.display = isSignUp ? "flex" : "none";
    fullName.style.display = isSignUp ? "block" : "none";

    planText.textContent = selectedPlan
        ? "Selected Membership: " + selectedPlan
        : "Please select a membership above.";

    fullName.required = isSignUp;
    paymentMethod.required = isSignUp;

    password.autocomplete = isSignUp ? "new-password" : "current-password";

    submitBtn.textContent = isSignUp ? "CREATE ACCOUNT" : "LOG IN";

    switchText.innerHTML = isSignUp
        ? 'Already have an account? <a href="#" onclick="switchForm(event)">Log In</a>'
        : 'Don\'t have an account? <a href="#" onclick="switchForm(event)">Sign Up</a>';

    document.querySelectorAll(".popup-plan").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.plan === selectedPlan && selectedPlan !== ""
        );
    });

    message.textContent = "";
}

// SELECT MEMBERSHIP PLAN
function selectPlan(planName) {
    const plans = ["Basic", "Standard", "Premium"];

    if (!plans.includes(planName)) return;

    selectedPlan = planName;
    isSignUp = true;

    document.getElementById("authPopup").style.display = "flex";
    showForm();
}

// GET SAVED ACCOUNTS
function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem("gymAccounts")) || [];
    } catch {
        return [];
    }
}

// REGISTER OR LOG IN
document.getElementById("authForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const message = document.getElementById("message");

    let accounts = getAccounts();

    // SIGN UP
    if (isSignUp) {

        if (!selectedPlan) {
            message.textContent = "Please select a membership plan above.";
            return;
        }

        if (!paymentMethod) {
            message.textContent = "Please select a payment method.";
            return;
        }

        if (accounts.some(account => account.email === email)) {
            message.textContent = "This email already has an account. Please log in.";
            return;
        }

        const account = {
            name,
            email,
            password,
            plan: selectedPlan,
            paymentMethod,

            paymentStatus:
                paymentMethod === "Cash at Gym" ? "Pay at Gym" :
                paymentMethod === "Card Demo" ? "Demo Only" :
                "Not Verified",

            memberSince: new Date().toISOString()
        };

        accounts.push(account);

        try {
            localStorage.setItem("gymAccounts", JSON.stringify(accounts));
            sessionStorage.setItem("gymUserEmail", email);
            window.location.href = "dashboard.html";
        } catch {
            message.textContent = "Unable to save your account. Please check your browser storage.";
        }

    } else {

        // LOG IN
        const account = accounts.find(
            account => account.email === email && account.password === password
        );

        if (!account) {
            message.textContent = "Incorrect email or password.";
            return;
        }

        sessionStorage.setItem("gymUserEmail", email);
        window.location.href = "dashboard.html";
    }
});

// CONTACT BUTTON
function contactGym() {
    document.getElementById("contact").scrollIntoView({
        behavior: "smooth"
    });
}

// CLOSE POPUP WHEN CLICKING OUTSIDE
document.getElementById("authPopup").addEventListener("click", function(event) {
    if (event.target === this) closePopup();
});

// CLOSE POPUP USING ESCAPE KEY
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") closePopup();
});
