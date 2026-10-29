
let isSignUp = true;
let selectedPlan = "";

// Open the popup when SIGN IN is clicked
function joinGym() {
    isSignUp = true;
    document.getElementById("authPopup").style.display = "flex";
    showForm();
}

// Close the popup
function closePopup() {
    document.getElementById("authPopup").style.display = "none";
    document.getElementById("authForm").reset();

    selectedPlan = "";
    document.getElementById("message").textContent = "";

    document.querySelectorAll(".popup-plan").forEach(button => {
        button.classList.remove("selected");
    });

    isSignUp = true;
    showForm();
}

// Switch between Sign Up and Log In
function switchForm(event) {
    event.preventDefault();
    isSignUp = !isSignUp;
    showForm();
}

// Display the appropriate form
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
    const membershipSelector =
        document.getElementById("membershipSelector");

    title.textContent = isSignUp ? "SIGN UP" : "LOG IN";

    if (isSignUp) {
        description.textContent = selectedPlan
            ? "Complete your details to join GYMBURAT."
            : "Choose a membership plan to get started.";

        membershipSelector.style.display = "flex";
        planText.style.display = "block";

        planText.textContent = selectedPlan
            ? "Selected Membership: " + selectedPlan
            : "Please select a membership above.";

        paymentGroup.style.display = "flex";
        paymentMethod.required = true;

        fullName.style.display = "block";
        fullName.required = true;
        fullName.autocomplete = "name";

        password.autocomplete = "new-password";
        submitBtn.textContent = "CREATE ACCOUNT";

        switchText.innerHTML =
            'Already have an account? ' +
            '<a href="#" onclick="switchForm(event)">Log In</a>';

    } else {
        description.textContent = "Welcome back to GYMBURAT!";

        membershipSelector.style.display = "none";
        planText.style.display = "none";

        paymentGroup.style.display = "none";
        paymentMethod.required = false;

        fullName.style.display = "none";
        fullName.required = false;

        password.autocomplete = "current-password";
        submitBtn.textContent = "LOG IN";

        switchText.innerHTML =
            'Don\'t have an account? ' +
            '<a href="#" onclick="switchForm(event)">Sign Up</a>';
    }

    // Highlight the selected membership plan
    document.querySelectorAll(".popup-plan").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.plan === selectedPlan && selectedPlan !== ""
        );
    });

    message.textContent = "";
}

// Select a membership plan
function selectPlan(planName) {
    const allowedPlans = ["Basic", "Standard", "Premium"];

    if (!allowedPlans.includes(planName)) {
        return;
    }

    selectedPlan = planName;
    isSignUp = true;

    document.getElementById("authPopup").style.display = "flex";

    showForm();
}

// Register an account or log in
document.getElementById("authForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value
            .trim()
            .toLowerCase();
        const password = document.getElementById("password").value;
        const paymentMethod =
            document.getElementById("paymentMethod").value;
        const message = document.getElementById("message");

        let accounts = [];

        try {
            accounts = JSON.parse(
                localStorage.getItem("gymAccounts") || "[]"
            );

            if (!Array.isArray(accounts)) {
                accounts = [];
            }
        } catch (error) {
            accounts = [];
        }

        // SIGN UP
        if (isSignUp) {

            // Check membership
            if (!selectedPlan) {
                message.style.color = "#ff4500";
                message.textContent =
                    "Please select a membership plan above.";
                return;
            }

            // Check payment method
            if (!paymentMethod) {
                message.style.color = "#ff4500";
                message.textContent =
                    "Please select a payment method.";
                return;
            }

            // Prevent duplicate accounts
            const existingAccount = accounts.some(
                account => account.email === email
            );

            if (existingAccount) {
                message.style.color = "#ff4500";
                message.textContent =
                    "This email already has an account. Please log in.";
                return;
            }

            // Create account
            const account = {
                name: name,
                email: email,
                password: password,
                plan: selectedPlan,
                paymentMethod: paymentMethod,

                paymentStatus:
                    paymentMethod === "Cash at Gym"
                        ? "Pay at Gym"
                        : paymentMethod === "Card Demo"
                            ? "Demo Only"
                            : "Not Verified",

                memberSince: new Date().toISOString()
            };

            accounts.push(account);

            try {
                localStorage.setItem(
                    "gymAccounts",
                    JSON.stringify(accounts)
                );

                sessionStorage.setItem("gymUserEmail", email);

                // Go to dashboard
                window.location.href = "dashboard.html";

            } catch (error) {
                message.style.color = "#ff4500";
                message.textContent =
                    "Unable to save your account. Please check your browser storage.";
            }

        } else {

            // LOG IN
            const account = accounts.find(
                account =>
                    account.email === email &&
                    account.password === password
            );

            if (!account) {
                message.style.color = "#ff4500";
                message.textContent =
                    "Incorrect email or password.";
                return;
            }

            try {
                sessionStorage.setItem("gymUserEmail", email);

                // Go to dashboard
                window.location.href = "dashboard.html";

            } catch (error) {
                message.style.color = "#ff4500";
                message.textContent =
                    "Unable to start your session. Please try again.";
            }
        }
    }
);

// Contact button
function contactGym() {
    document.getElementById("contact").scrollIntoView({
        behavior: "smooth"
    });
}

// Close popup when clicking outside it
document.getElementById("authPopup").addEventListener(
    "click",
    function(event) {
        if (event.target === this) {
            closePopup();
        }
    }
);

// Close popup using the Escape key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closePopup();
    }
});
