
// GET CURRENT USER
const userEmail = sessionStorage.getItem("gymUserEmail");
const accounts = JSON.parse(localStorage.getItem("gymAccounts") || "[]");
const currentUser = accounts.find(user => user.email === userEmail);

let attendanceChart = null;
let attendanceView = "day";

// CHECK LOGIN
if (!currentUser) {
    window.location.replace("Gym.html");
} else {
    loadDashboard();
}

// GET GYM VISITS
function getVisits() {
    const visits = JSON.parse(localStorage.getItem("gymVisits") || "{}");
    return currentUser ? visits[currentUser.email] || [] : [];
}

// SAVE GYM VISITS
function saveVisits(visits) {
    const allVisits = JSON.parse(localStorage.getItem("gymVisits") || "{}");

    allVisits[currentUser.email] = visits;

    localStorage.setItem("gymVisits", JSON.stringify(allVisits));
}

// CHECK IF DATES ARE THE SAME
function sameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

// LOAD DASHBOARD INFORMATION
function loadDashboard() {
    document.getElementById("welcomeName").textContent = currentUser.name;
    document.getElementById("userAvatar").textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById("profileName").textContent = currentUser.name;
    document.getElementById("profileEmail").textContent = currentUser.email;
    document.getElementById("profilePlan").textContent = currentUser.plan || "Basic";

    document.getElementById("memberSince").textContent =
        currentUser.memberSince
            ? new Date(currentUser.memberSince).toLocaleDateString()
            : "Today";

    updateStats();
    updateAttendanceChart();
}

// UPDATE VISIT STATISTICS
function updateStats() {
    const visits = getVisits()
        .map(date => new Date(date))
        .filter(date => !isNaN(date.getTime()));

    const today = new Date();

    const weekly = visits.filter(date => {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);

        return date >= start && date <= today;
    });

    const monthly = visits.filter(date =>
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );

    document.getElementById("totalVisits").textContent = visits.length;
    document.getElementById("weeklyVisits").textContent = weekly.length;
    document.getElementById("monthlyVisits").textContent = monthly.length;
}

// RECORD GYM VISIT
function recordVisit() {
    if (!currentUser) return;

    const visits = getVisits();
    visits.push(new Date().toISOString());

    saveVisits(visits);
    updateStats();
    updateAttendanceChart();

    alert("Gym visit recorded successfully!");
}

// CHANGE CHART VIEW
function changeAttendanceView(view, button) {
    attendanceView = view;

    document.querySelectorAll(".attendance-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    button.classList.add("active");

    updateAttendanceChart();
}

// UPDATE ATTENDANCE CHART
function updateAttendanceChart() {
    const canvas = document.getElementById("attendanceChart");

    if (!canvas || !currentUser) return;

    const visits = getVisits()
        .map(date => new Date(date))
        .filter(date => !isNaN(date.getTime()));

    const today = new Date();
    const labels = [];
    const counts = [];

    let totalPeriods = 18;

    if (attendanceView === "day") {
        // LAST 18 DAYS
        for (let i = 17; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            labels.push(sameDay(date, today) ? "Today" : date.getDate());

            counts.push(visits.filter(visit => sameDay(visit, date)).length);
        }

        document.getElementById("attendancePeriodLabel").textContent =
            "Visits in the last 18 days";

    } else if (attendanceView === "week") {
        // LAST 7 DAYS
        totalPeriods = 7;

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            labels.push(date.toLocaleDateString("en-US", {
                weekday: "short"
            }));

            counts.push(visits.filter(visit => sameDay(visit, date)).length);
        }

        document.getElementById("attendancePeriodLabel").textContent =
            "Visits this week";

    } else {
        // LAST 12 MONTHS
        totalPeriods = 12;

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

            labels.push(date.toLocaleDateString("en-US", {
                month: "short"
            }));

            counts.push(visits.filter(visit =>
                visit.getMonth() === date.getMonth() &&
                visit.getFullYear() === date.getFullYear()
            ).length);
        }

        document.getElementById("attendancePeriodLabel").textContent =
            "Visits in the last 12 months";
    }

    // UPDATE TOTALS
    const periodTotal = counts.reduce((sum, count) => sum + count, 0);

    document.getElementById("attendanceTotal").textContent =
        visits.length + " visits";

    document.getElementById("attendancePeriodTotal").textContent = periodTotal;
    document.getElementById("chartVisitCount").textContent = periodTotal;

    document.getElementById("chartViewName").textContent =
        attendanceView.charAt(0).toUpperCase() + attendanceView.slice(1);

    // REMOVE OLD CHART
    if (attendanceChart) {
        attendanceChart.destroy();
    }

    // CREATE NEW CHART
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
                        label: context => context.raw + " gym visit(s)"
                    }
                }
            },

            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#888",
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    border: { display: false }
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
                        border: { dash: [3, 4] }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

// LOG OUT
function logout(event) {
    if (event) event.preventDefault();

    sessionStorage.removeItem("gymUserEmail");
    window.location.replace("Gym.html");
}
