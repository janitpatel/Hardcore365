const hardcorePlan = {
            Monday: [
                { name: "Push-ups", sets: 4, reps: 20 },
                { name: "Diamond Push-ups", sets: 3, reps: 15 },
                { name: "Pike Push-ups", sets: 3, reps: 15 },
                { name: "Chair Dips", sets: 3, reps: 15 },
                { name: "Plank Shoulder Taps", sets: 3, reps: 20 }
            ],
            Tuesday: [
                { name: "Squats", sets: 4, reps: 20 },
                { name: "Jump Squats", sets: 3, reps: 15 },
                { name: "Lunges", sets: 3, reps: 12 },
                { name: "Glute Bridges", sets: 3, reps: 20 },
                { name: "Calf Raises", sets: 4, reps: 20 }
            ],
            Wednesday: [
                { name: "Crunches", sets: 4, reps: 20 },
                { name: "Leg Raises", sets: 4, reps: 15 },
                { name: "Mountain Climbers", sets: 3, reps: 30, unit: "sec" },
                { name: "Plank", sets: 3, reps: 60, unit: "sec" },
                { name: "Russian Twists", sets: 3, reps: 20 }
            ],
            Thursday: [
                { name: "Lunges (each leg)", sets: 3, reps: 16 },
                { name: "Push-ups (wide grip)", sets: 3, reps: 15 },
                { name: "Glute Bridges", sets: 3, reps: 20 },
                { name: "Russian Twists", sets: 3, reps: 30, unit: "sec" },
                { name: "Superman Hold", sets: 3, reps: 25, unit: "sec" }
            ],
            Friday: [
                { name: "Incline Push-ups", sets: 3, reps: 15 },
                { name: "Wall Sit", sets: 3, reps: 40, unit: "sec" },
                { name: "Side Plank (each side)", sets: 3, reps: 25, unit: "sec" },
                { name: "Calf Raises", sets: 3, reps: 25 },
                { name: "Leg Raises", sets: 3, reps: 15 }
            ],
            Saturday: [
                { name: "Yoga/Stretching", sets: 1, reps: 20, unit: "min" },
                { name: "Light Walking", sets: 1, reps: 30, unit: "min" },
                { name: "Skipping Rope", sets: 1, reps: 20, unit: "min" }
            ],
            Sunday: [
                { name: "Rest & Recovery", sets: 1, reps: 1, unit: "day" }
            ]
        };

        const growth = 0.002;
        const level = 1; // 3X harder
        const deload = 0.8;
        const startDate = new Date("2025-08-30");

        let viewDate = new Date();

        function getDayNumber() {
            const diff = Math.floor((viewDate - startDate) / (1000 * 60 * 60 * 24));
            return diff >= 0 ? diff + 1 : 1;
        }

        function getWeekdayPlan(date) {
            const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
            return hardcorePlan[weekday];
        }

        function generateWorkout(day, date) {
            const plan = getWeekdayPlan(date);
            return plan.map(ex => {
                const multiplier = Math.pow(1 + growth, day - 1) * level;
                let reps = Math.round(ex.reps * multiplier);
                let sets = ex.sets;
                if (day % 56 === 0 && deload < 1) reps = Math.round(reps * deload);
                return { ...ex, sets, reps };
            });
        }

        function updateStreak() {
            let streakData = JSON.parse(localStorage.getItem("workoutStreak")) || { count: 0, lastDate: null };
            const today = new Date().toDateString();

            if (streakData.lastDate === today) {
                return streakData.count;
            }

            if (streakData.lastDate) {
                const last = new Date(streakData.lastDate);
                const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    streakData.count++;
                } else {
                    streakData.count = 1;
                }
            } else {
                streakData.count = 1;
            }

            streakData.lastDate = today;
            localStorage.setItem("workoutStreak", JSON.stringify(streakData));
            return streakData.count;
        }

        function render() {
            const currentDay = getDayNumber();
            const plan = generateWorkout(currentDay, viewDate);
            const table = document.getElementById("dayTable");
            table.innerHTML = "";

            let header = `<tr><th colspan="2">Day ${currentDay} - ${viewDate.toLocaleDateString("en-US", { weekday: "long" })} <br><small>${viewDate.toDateString()}</small></th></tr>`;
            table.insertAdjacentHTML("beforeend", header);

            plan.forEach(ex => {
                const row = `<tr><td>${ex.name}</td><td>${ex.sets} × ${ex.reps}${ex.unit ? " " + ex.unit : " reps"}</td></tr>`;
                table.insertAdjacentHTML("beforeend", row);
            });

            document.getElementById("summary").innerHTML = `
        <div class="kpi">Day<b>${currentDay}</b></div>
        <div class="kpi">Growth<b>${(growth * 100).toFixed(2)}%</b></div>
        <div class="kpi">Level<b>${level}x</b></div>`;

            const streakCount = updateStreak();
            document.getElementById("streakDisplay").innerText = `🔥 Streak: ${streakCount} Days`;
        }

        document.getElementById("btnPrev").addEventListener("click", () => { viewDate.setDate(viewDate.getDate() - 1); render(); });
        document.getElementById("btnNext").addEventListener("click", () => { viewDate.setDate(viewDate.getDate() + 1); render(); });
        document.getElementById("btnDownload").addEventListener("click", () => {
            const table = document.getElementById("dayTable").innerText;
            const blob = new Blob([table], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Workout_Day${getDayNumber()}.txt`;
            link.click();
        });

        render();
