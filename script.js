document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const icon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Change icon
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    /* ==========================================================================
       Scroll Animations with IntersectionObserver
       ========================================================================== */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Once visible, stop observing
            }
        });
    }, observerOptions);

    // === BASE DE DATOS LOCAL (CALENDARIO) ===
    const defaultCalendarData = [
        {
            day: 'LUNES',
            icon: 'fa-calendar-day',
            desc: 'Cerrá el lunes con toda la energía. Fútbol 5 mixto.',
            matches: [
                { time: '20:00', full: false },
                { time: '21:00', full: true }
            ]
        },
        {
            day: 'MARTES',
            icon: 'fa-calendar-check',
            desc: 'Despejá la cabeza a mitad de semana y mostrá tu nivel.',
            matches: [
                { time: '19:00', full: false },
                { time: '20:00', full: false }
            ]
        },
        {
            day: 'JUEVES',
            icon: 'fa-calendar-alt',
            desc: 'La previa del finde se vive en la cancha.',
            matches: [
                { time: '20:00', full: true },
                { time: '21:00', full: false }
            ]
        },
        {
            day: 'VIERNES',
            icon: 'fa-calendar-plus',
            desc: '¡El plato fuerte! Torneos relámpago y tercer tiempo.',
            matches: [
                { time: '21:00', full: false },
                { time: '22:00', full: false },
                { time: '23:00', full: true }
            ]
        }
    ];

    let calendarData = JSON.parse(localStorage.getItem('futbolMixtoCalendar')) || defaultCalendarData;
    let isAdminMode = false;

    const calendarGrid = document.getElementById('calendar-grid');
    const adminToggle = document.getElementById('admin-calendar-toggle');

    function renderCalendar() {
        if (!calendarGrid) return;
        calendarGrid.innerHTML = '';

        calendarData.forEach((dayData, dayIndex) => {
            const card = document.createElement('div');
            // Quitamos la clase 'visible' inicial para que la animación funcione.
            // La agregará el IntersectionObserver
            card.className = 'dia-card';
            card.style.setProperty('--delay', dayIndex + 1);

            let matchesHtml = '';
            dayData.matches.forEach((match, matchIndex) => {
                const statusClass = match.full ? 'status-full' : 'status-open';
                const statusText = match.full ? 'COMPLETO' : 'DISPONIBLE';
                const cursorStyle = isAdminMode ? 'cursor:pointer;' : '';
                const clickAction = isAdminMode ? `onclick="toggleMatchStatus(${dayIndex}, ${matchIndex})"` : '';

                matchesHtml += `
                    <div class="match-slot ${statusClass}" style="${cursorStyle}" ${clickAction}>
                        <span class="match-time"><i class="far fa-clock"></i> ${match.time} hs</span>
                        <span class="match-status">${statusText}</span>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="dia-icon"><i class="fas ${dayData.icon}"></i></div>
                <h3>${dayData.day}</h3>
                <p>${dayData.desc}</p>
                <div class="matches-container">
                    ${matchesHtml}
                </div>
                ${isAdminMode ? `<button class="btn-primary-outline btn-sm" onclick="addMatchSlot(${dayIndex})">+ Agregar Horario</button>` : ''}
            `;
            calendarGrid.appendChild(card);
            observer.observe(card);
        });
    }

    window.toggleMatchStatus = function (dayIndex, matchIndex) {
        if (!isAdminMode) return;
        calendarData[dayIndex].matches[matchIndex].full = !calendarData[dayIndex].matches[matchIndex].full;
        saveCalendarData();
        renderCalendar();
    };

    window.addMatchSlot = function (dayIndex) {
        if (!isAdminMode) return;
        const time = prompt('Ingrese el horario (ej: 18:00):');
        if (time) {
            calendarData[dayIndex].matches.push({ time: time, full: false });
            calendarData[dayIndex].matches.sort((a, b) => a.time.localeCompare(b.time));
            saveCalendarData();
            renderCalendar();
        }
    };

    function saveCalendarData() {
        localStorage.setItem('futbolMixtoCalendar', JSON.stringify(calendarData));
    }

    window.toggleAdminMode = function() {
        const pwd = prompt('Contraseña Admin (escribe "admin"):');
        const icon = document.getElementById('admin-calendar-toggle');
        if (pwd === 'admin') {
            isAdminMode = !isAdminMode;
            if(icon) {
                icon.style.color = isAdminMode ? 'var(--accent-purple)' : '';
                icon.style.opacity = isAdminMode ? '1' : '0.2';
            }
            alert(isAdminMode ? 'Modo EDICIÓN activado. Haz clic en los turnos para cambiar estado, o agrega horarios.' : 'Modo edición desactivado.');
            renderCalendar();
        } else if (pwd !== null) {
            alert('Contraseña incorrecta');
        }
    };

    // Inicializar
    renderCalendar();

    /* ==========================================================================
       Form Submission Simulation
       ========================================================================== */
    const form = document.getElementById('waitlist-form');
    const formMsg = document.getElementById('form-msg');
    const submitBtn = form.querySelector('.submit-btn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Basic simulation of loading text
            const btnOriginalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = btnOriginalText;
                submitBtn.disabled = false;

                // Show success message
                formMsg.classList.remove('hidden');

                // Hide message after 5 seconds
                setTimeout(() => {
                    formMsg.classList.add('hidden');
                }, 5000);
            }, 1500);
        });
    }

});
