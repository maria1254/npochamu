document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('.submit-btn');
    submitButton.addEventListener('click', checkCommonFreeTime);
});

function generateTimetableForm() {
    const numStudents = document.getElementById('numStudents').value;
    const timetableFormsDiv = document.getElementById('timetable-forms');
    
    timetableFormsDiv.innerHTML = '';

 
    for (let i = 1; i <= numStudents; i++) {
        const form = document.createElement('form');
        form.id = `student${i}`;

        const h2 = document.createElement('h2');
        h2.textContent = `友達${i}の時間割`;
        form.appendChild(h2);


    const nameLabel = document.createElement('label');
    nameLabel.textContent = `名前:`;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = `例:きみまろ`;
    nameInput.id = `name${i}`;
    form.appendChild(nameLabel);
    form.appendChild(nameInput);

      

        const table = document.createElement('table');
        table.innerHTML = `
            <tr><th>曜日</th><th>1限</th><th>2限</th><th>3限</th><th>4限</th><th>5限</th></tr>
            <tr><td>月曜日</td><td><input type="checkbox" name="student${i}-mon-1"></td><td><input type="checkbox" name="student${i}-mon-2"></td><td><input type="checkbox" name="student${i}-mon-3"></td><td><input type="checkbox" name="student${i}-mon-4"></td><td><input type="checkbox" name="student${i}-mon-5"></td></tr>
            <tr><td>火曜日</td><td><input type="checkbox" name="student${i}-tue-1"></td><td><input type="checkbox" name="student${i}-tue-2"></td><td><input type="checkbox" name="student${i}-tue-3"></td><td><input type="checkbox" name="student${i}-tue-4"></td><td><input type="checkbox" name="student${i}-tue-5"></td></tr>
            <tr><td>水曜日</td><td><input type="checkbox" name="student${i}-wed-1"></td><td><input type="checkbox" name="student${i}-wed-2"></td><td><input type="checkbox" name="student${i}-wed-3"></td><td><input type="checkbox" name="student${i}-wed-4"></td><td><input type="checkbox" name="student${i}-wed-5"></td></tr>
            <tr><td>木曜日</td><td><input type="checkbox" name="student${i}-thu-1"></td><td><input type="checkbox" name="student${i}-thu-2"></td><td><input type="checkbox" name="student${i}-thu-3"></td><td><input type="checkbox" name="student${i}-thu-4"></td><td><input type="checkbox" name="student${i}-thu-5"></td></tr>
            <tr><td>金曜日</td><td><input type="checkbox" name="student${i}-fri-1"></td><td><input type="checkbox" name="student${i}-fri-2"></td><td><input type="checkbox" name="student${i}-fri-3"></td><td><input type="checkbox" name="student${i}-fri-4"></td><td><input type="checkbox" name="student${i}-fri-5"></td></tr>
        `;
        form.appendChild(table);
        timetableFormsDiv.appendChild(form);
    }
}

function checkCommonFreeTime() {
    const numStudents = document.getElementById('numStudents').value;
    const resultDiv = document.getElementById('result');

    let studentsTimetables = [];
    let studentsNames = [];

    // 生徒の名前と時間割を取得
    for (let i = 1; i <= numStudents; i++) {
        let studentTimetable = getTimetable(i);
        studentsTimetables.push(studentTimetable);
        let studentName = document.getElementById(`name${i}`).value;
        studentsNames.push(studentName);
    }

    let freeSlots = calculateCommonFreeSlots(studentsTimetables);

    if (Object.values(freeSlots).every(slots => slots.length === 0)) {
        resultDiv.innerHTML = `<h3>空きコマがないちゃむ</h3>`;
        suggestBestTime(studentsTimetables, studentsNames);
    } else {
        displayCommonFreeSlots(freeSlots);
    }
}

function getTimetable(studentNumber) {
    const form = document.getElementById(`student${studentNumber}`);
    const timetable = [];
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

    for (let i = 0; i < 5; i++) {
        let day = [];
        for (let j = 1; j <= 5; j++) {
            let input = form.querySelector(`[name="student${studentNumber}-${days[i]}-${j}"]`);
            day.push(input.checked ? 1 : 0);
        }
        timetable.push(day);
    }
    return timetable;
}

function calculateCommonFreeSlots(students) {
    let freeSlots = { mon: [], tue: [], wed: [], thu: [], fri: [] };

    for (let day = 0; day < 5; day++) {
        for (let period = 0; period < 5; period++) {
            let isFree = true;
            for (let student of students) {
                if (student[day][period] === 1) {
                    isFree = false;
                    break;
                }
            }
            if (isFree) {
                let dayName = ['mon', 'tue', 'wed', 'thu', 'fri'][day];
                freeSlots[dayName].push(period + 1);
            }
        }
    }
    return freeSlots;
}

function displayCommonFreeSlots(freeSlots) {
    const resultDiv = document.getElementById('result');
    let output = "<h3>んぽちゃむとあそべるじかん</h3>";

    output += "<table><thead><tr><th>曜日</th><th>空きコマ</th></tr></thead><tbody>";
    for (let day in freeSlots) {
        if (freeSlots[day].length > 0) {
            output += `<tr><td><strong>${capitalizeFirstLetter(day)}</strong></td><td>${freeSlots[day].join(', ')}</td></tr>`;
        }
    }
    output += "</tbody></table>";
    resultDiv.innerHTML = output;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function suggestBestTime(students, names) {
    let days = ['mon', 'tue', 'wed', 'thu', 'fri'];
    let dayCounts = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };

    let unavailableStudents = [];

    for (let i = 0; i < students.length; i++) {
        let student = students[i];
        let name = names[i];
        let unavailableDays = [];

        for (let day = 0; day < 5; day++) {
            if (student[day].includes(1)) {
                unavailableDays.push(days[day]);
                dayCounts[days[day]]++;
            }
        }

        if (unavailableDays.length > 0) {
            unavailableStudents.push(`${name} (${unavailableDays.join(', ')})`);
        }
    }

    let sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);

    let result = `<h3>最も多くの人が集まれる日（順番）:</h3><ul>`;
    for (let [day, count] of sortedDays) {
        result += `<li>${capitalizeFirstLetter(day)}: ${count} 人が授業あり</li>`;
    }
    result += `</ul>`;

    if (unavailableStudents.length > 0) {
        result += `<h3>授業のある時間帯:</h3><ul>`;
        unavailableStudents.forEach(student => {
            result += `<li>${student}</li>`;
        });
        result += `</ul>`;
    }

    document.getElementById('result').innerHTML += result;
}
