
const userEmail = sessionStorage.getItem("gymUserEmail");
const accounts = JSON.parse(localStorage.getItem("gymAccounts") || "[]");

const currentUser = accounts.find(account => account.email === userEmail);

let attendanceChart = null;
let attendanceView = "day";

// Check whether a member is logged in
if (!currentUser) {
    window.location.replace("Gym.html");
} else {
    loadDashboard();
}

// Get the current member's gym visits
function getVisits() {
    if (!currentUser) return [];

    const allVisits = JSON.parse(
        localStorage.getItem("gymVisits") || "{}"
    );

    return allVisits[currentUser.email] || [];
}

// Save gym visits
function saveVisits(visits) {
    const allVisits = JSON.parse(
        localStorage.getItem("gymVisits") || "{}"
    );

    allVisits[currentUser.email] = visits;

    localStorage.setItem("gymVisits", JSON.stringify(allVisits));
}

// Compare dates by calendar day
function sameDay(dateA, dateB) {
    return dateA.toDateString() === dateB.toDateString();
}

// Load member information
function loadDashboard() {
    document.getElementById("welcomeName").textContent =
        currentUser.name;

    document.getElementById("userAvatar").textContent =
        currentUser.name.charAt(0).toUpperCase();

    document.getElementById("profileName").textContent =
        currentUser.name;

    document.getElementById("profileEmail").textContent =
        currentUser.email;

    document.getElementById("profilePlan").textContent =
        currentUser.plan || "Basic";

    document.getElementById("memberSince").textContent =
        currentUser.memberSince
            ? new Date(currentUser.memberSince).toLocaleDateString()
            : "Today";

    updateStats();
    updateAttendanceChart();
}

// Update total, weekly, and monthly visits
function updateStats() {
    const visits = getVisits().map(date => new Date(date));
    const now = new Date();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekly = visits.filter(date =>
        !isNaN(date.getTime()) &&
        date >= weekStart &&
        date <= now
    );

    const monthly = visits.filter(date =>
        !isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );

    document.getElementById("totalVisits").textContent =
        visits.filter(date => !isNaN(date.getTime())).length;

    document.getElementById("weeklyVisits").textContent =
        weekly.length;

    document.getElementById("monthlyVisits").textContent =
        monthly.length;
}

// Record a gym visit
function recordVisit() {
    if (!currentUser) return;

    const visits = getVisits();

    visits.push(new Date().toISOString());

    saveVisits(visits);
    updateStats();
    updateAttendanceChart();

    alert("Gym visit recorded successfully!");
}

// Format a date for comparison
function getDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

// Change the chart between Day, Week, and Month
function changeAttendanceView(view, button) {
    attendanceView = view;

    document.querySelectorAll(".attendance-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    button.classList.add("active");

    updateAttendanceChart();
}

// Draw the attendance chart
function updateAttendanceChart() {
    const canvas = document.getElementById("attendanceChart");

    if (!canvas || !currentUser) return;

    const visits = getVisits()
        .map(date => new Date(date))
        .filter(date => !isNaN(date.getTime()));

    const today = new Date();
    const labels = [];
    const counts = [];

    if (attendanceView === "day") {
        // Show the last 18 days
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 17);

        for (let i = 0; i < 18; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            labels.push(
                sameDay(date, today)
                    ? "Today"
                    : String(date.getDate())
            );

            counts.push(
                visits.filter(visit => sameDay(visit, date)).length
            );
        }

        document.getElementById("attendancePeriodLabel").textContent =
            "Visits in the last 18 days";

    } else if (attendanceView === "week") {
        // Show the last 7 days
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            labels.push(
                date.toLocaleDateString("en-US", {
                    weekday: "short"
                })
            );

            counts.push(
                visits.filter(visit => sameDay(visit, date)).length
            );
        }

        document.getElementById("attendancePeriodLabel").textContent =
            "Visits this week";

    } else {
        // Show the last 12 months
        const firstMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 11,
            1
        );

        for (let i = 0; i < 12; i++) {
            const date = new Date(
                firstMonth.getFullYear(),
                firstMonth.getMonth() + i,
                1
            );

            labels.push(
                date.toLocaleDateString("en-US", {
                    month: "short"
                })
            );

            counts.push(
                visits.filter(visit =>
                    visit.getMonth() === date.getMonth() &&
                    visit.getFullYear() === date.getFullYear()
                ).length
            );
        }

        document.getElementById("attendancePeriodLabel").textContent =
            "Visits in the last 12 months";
    }

    const periodTotal = counts.reduce(
        (total, count) => total + count, 0
    );

    document.getElementById("attendanceTotal").textContent =
        `${visits.length} visits`;

    document.getElementById("attendancePeriodTotal").textContent =
        periodTotal;

    document.getElementById("chartVisitCount").textContent =
        periodTotal;

    document.getElementById("chartViewName").textContent =
        attendanceView.charAt(0).toUpperCase() +
        attendanceView.slice(1);

    // Destroy the previous chart before drawing a new one
    if (attendanceChart) {
        attendanceChart.destroy();
    }

    attendanceChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: labels,

            datasets: [{
                label: "Gym Visits",
                data: counts,
                backgroundColor: "#2ca653",
                hoverBackgroundColor: "#48d875",
                borderRadius: 20,
                borderSkipped: false,
                barPercentage: 0.65,
                categoryPercentage: 0.9
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#222",
                    titleColor: "#fff",
                    bodyColor: "#48d875",

                    callbacks: {
                        label: function(context) {
                            return context.raw + " gym visit(s)";
                        }
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#888",
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    },

                    border: {
                        display: false
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        color: "#888",
                        precision: 0,
                        stepSize: 1
                    },

                    grid: {
                        color: "#383838",
                        border: {
                            dash: [3, 4]
                        }
                    },

                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

// Log out and return to the first page
function logout(event) {
    if (event) {
        event.preventDefault();
    }

    sessionStorage.removeItem("gymUserEmail");

    window.location.replace("Gym.html");
}
