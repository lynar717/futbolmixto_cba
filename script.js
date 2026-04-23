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

    let calendarData;
    try {
        const storedCal = localStorage.getItem('futbolMixtoCalendar');
        calendarData = storedCal ? JSON.parse(storedCal) : defaultCalendarData;
    } catch (e) {
        console.error("Error leyendo calendario local:", e);
        calendarData = defaultCalendarData;
    }
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
                let cursorStyle = '';
                let clickAction = '';
                
                if (isAdminMode) {
                    cursorStyle = 'cursor:pointer;';
                    clickAction = `onclick="toggleMatchStatus(${dayIndex}, ${matchIndex})"`;
                } else if (!match.full) {
                    cursorStyle = 'cursor:pointer;';
                    clickAction = `onclick="window.bookMatch('${dayData.day}', '${match.time}')"`;
                }

                let adminControlsMatch = '';
                if (isAdminMode) {
                    adminControlsMatch = `
                        <div style="margin-left:auto; display:flex; gap:10px;">
                            <i class="fas fa-edit" title="Editar Horario" style="color:#aaa;" onclick="event.stopPropagation(); window.editMatchSlot(${dayIndex}, ${matchIndex})"></i>
                            <i class="fas fa-trash" title="Eliminar Horario" style="color:#f44336;" onclick="event.stopPropagation(); window.removeMatchSlot(${dayIndex}, ${matchIndex})"></i>
                        </div>
                    `;
                }

                matchesHtml += `
                    <div class="match-slot ${statusClass}" style="${cursorStyle} ${isAdminMode ? 'display:flex; align-items:center;' : ''}" ${clickAction}>
                        <span class="match-time"><i class="far fa-clock"></i> ${match.time} hs</span>
                        <span class="match-status" ${isAdminMode ? 'style="margin-left:10px;"' : ''}>${statusText}</span>
                        ${adminControlsMatch}
                    </div>
                `;
            });

            let adminControlsDay = isAdminMode ? `
                <div style="display:flex; justify-content:center; gap:5px; margin-top:15px; flex-wrap:wrap;">
                    <button class="btn-primary-outline btn-sm" onclick="window.editDay(${dayIndex})"><i class="fas fa-edit"></i> Editar Día</button>
                    <button class="btn-primary-outline btn-sm" onclick="window.removeDay(${dayIndex})" style="color:#f44336; border-color:#f44336;"><i class="fas fa-trash"></i> Eliminar</button>
                    <button class="btn-primary-outline btn-sm" onclick="window.addMatchSlot(${dayIndex})"><i class="fas fa-plus"></i> Horario</button>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="dia-icon"><i class="fas ${dayData.icon}"></i></div>
                <h3>${dayData.day}</h3>
                <p>${dayData.desc}</p>
                <div class="matches-container">
                    ${matchesHtml}
                </div>
                ${adminControlsDay}
            `;
            calendarGrid.appendChild(card);
            observer.observe(card);
        });

        if (isAdminMode) {
            const addDayCard = document.createElement('div');
            // Adding 'visible' immediately so it doesn't need to be scrolled to appear in admin mode
            addDayCard.className = 'dia-card visible';
            addDayCard.style.display = 'flex';
            addDayCard.style.alignItems = 'center';
            addDayCard.style.justifyContent = 'center';
            addDayCard.style.cursor = 'pointer';
            addDayCard.style.border = '2px dashed var(--accent-purple)';
            addDayCard.style.minHeight = '250px';
            addDayCard.style.backgroundColor = 'rgba(157, 78, 221, 0.05)';
            addDayCard.onclick = window.addDay;
            addDayCard.innerHTML = `
                <div style="text-align:center;">
                    <i class="fas fa-plus-circle" style="color:var(--accent-purple); font-size:3rem; margin-bottom:15px;"></i>
                    <h3 style="color:var(--accent-purple); font-size:1.5rem;">Agregar Día</h3>
                </div>
            `;
            calendarGrid.appendChild(addDayCard);
        }
    }

    window.bookMatch = function(dayDataDay, matchTime) {
        if (isAdminMode) return;
        const targetString = `${dayDataDay} ${matchTime} hs`;
        if (confirm(`Elegiste ${targetString}. ¿Querés confirmar y autocompletar este horario en el formulario para anotarte?`)) {
            const daytimeInput = document.getElementById('daytime');
            if (daytimeInput) {
                daytimeInput.value = targetString;
            }
            const contactoSection = document.getElementById('contacto');
            if (contactoSection) {
                contactoSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    if (daytimeInput) daytimeInput.focus();
                }, 800);
            }
        }
    };

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

    window.editMatchSlot = function (dayIndex, matchIndex) {
        if (!isAdminMode) return;
        const time = prompt('Modificar horario (ej: 18:00):', calendarData[dayIndex].matches[matchIndex].time);
        if (time) {
            calendarData[dayIndex].matches[matchIndex].time = time;
            calendarData[dayIndex].matches.sort((a, b) => a.time.localeCompare(b.time));
            saveCalendarData();
            renderCalendar();
        }
    };

    window.removeMatchSlot = function (dayIndex, matchIndex) {
        if (!isAdminMode) return;
        if (confirm(`¿Eliminar horario de ${calendarData[dayIndex].matches[matchIndex].time} hs?`)) {
            calendarData[dayIndex].matches.splice(matchIndex, 1);
            saveCalendarData();
            renderCalendar();
        }
    };

    window.addDay = function () {
        if (!isAdminMode) return;
        const day = prompt('Ingrese el nombre del día (ej: MIÉRCOLES):');
        if (!day) return;
        const desc = prompt('Ingrese una breve descripción para el día:');
        calendarData.push({
            day: day.toUpperCase(),
            icon: 'fa-calendar-day',
            desc: desc || '',
            matches: []
        });
        saveCalendarData();
        renderCalendar();
    };

    window.editDay = function (dayIndex) {
        if (!isAdminMode) return;
        const day = prompt('Modificar nombre del día:', calendarData[dayIndex].day);
        if (day !== null && day.trim() !== '') {
            calendarData[dayIndex].day = day.toUpperCase();
        }
        
        const desc = prompt('Modificar descripción:', calendarData[dayIndex].desc);
        if (desc !== null) {
            calendarData[dayIndex].desc = desc;
        }
        
        saveCalendarData();
        renderCalendar();
    };

    window.removeDay = function (dayIndex) {
        if (!isAdminMode) return;
        if (confirm(`¿Estás seguro de eliminar el día ${calendarData[dayIndex].day} por completo?`)) {
            calendarData.splice(dayIndex, 1);
            saveCalendarData();
            renderCalendar();
        }
    };

    function saveCalendarData() {
        localStorage.setItem('futbolMixtoCalendar', JSON.stringify(calendarData));
    }

    const adminModal = document.getElementById('admin-modal');
    const pwdInput = document.getElementById('admin-password-input');
    const eyeIcon = document.getElementById('toggle-pwd-visibility');

    window.toggleAdminMode = function () {
        if (isAdminMode) {
            isAdminMode = false;
            updateAdminUI();
            alert('Modo edición desactivado.');
            return;
        }

        if (adminModal) {
            adminModal.classList.remove('hidden');
            pwdInput.value = '';
            pwdInput.type = 'password';
            if (eyeIcon) {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
            pwdInput.focus();
        }
    };

    function updateAdminUI() {
        const icon = document.getElementById('admin-calendar-toggle');
        if (icon) {
            icon.style.color = isAdminMode ? 'var(--accent-purple)' : '';
            icon.style.opacity = isAdminMode ? '1' : '0.2';
        }
        
        const waitlistDiv = document.getElementById('admin-waitlist-container');
        if (waitlistDiv) {
            waitlistDiv.style.display = isAdminMode ? 'block' : 'none';
        }

        renderCalendar();
        if (isAdminMode && window.renderWaitlist) {
            window.renderWaitlist();
        }
    }

    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            if (pwdInput.value === 'cata18') {
                isAdminMode = true;
                updateAdminUI();
                alert('Modo EDICIÓN activado.');
                adminModal.classList.add('hidden');
            } else {
                alert('Contraseña incorrecta');
                pwdInput.value = '';
                pwdInput.focus();
            }
        });
    }

    const adminCancelBtn = document.getElementById('admin-cancel-btn');
    if (adminCancelBtn) {
        adminCancelBtn.addEventListener('click', () => {
            adminModal.classList.add('hidden');
        });
    }

    if (eyeIcon) {
        eyeIcon.addEventListener('click', () => {
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                pwdInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });
    }

    // Inicializar
    renderCalendar();

    /* ==========================================================================
       Waitlist / Form Submission Logic
       ========================================================================== */
    const form = document.getElementById('waitlist-form');
    const formMsg = document.getElementById('form-msg');
    const submitBtn = form.querySelector('.submit-btn');

    let waitlistData = [];
    try {
        const storedWaitlist = localStorage.getItem('futbolMixtoWaitlist');
        if (storedWaitlist) waitlistData = JSON.parse(storedWaitlist);
    } catch (e) {
        console.error("Error leyendo lista de espera local:", e);
        waitlistData = [];
    }

    window.renderWaitlist = function() {
        const listDiv = document.getElementById('admin-waitlist-list');
        if (!listDiv) return;
        
        if (waitlistData.length === 0) {
            listDiv.innerHTML = '<p style="color:var(--text-muted);">La lista está vacía.</p>';
            return;
        }

        let html = '<ul style="list-style:none; padding:0; margin:0; text-align:left;">';
        waitlistData.forEach((user, index) => {
            html += `
                <li style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:1.1rem; color: #fff;">${user.nombre}</strong> <span style="color:var(--text-muted); font-size:0.8rem; margin-left:5px;">(${user.date})</span><br>
                        <i class="fab fa-whatsapp" style="color:#25D366; margin-right:5px; margin-top:5px;"></i> ${user.telefono} <br>
                        <span style="font-size:0.9rem; color:var(--accent-blue); display:inline-block; margin-top:3px; margin-right:10px;"><i class="far fa-clock"></i> ${user.daytime || 'Sin especificar'}</span>
                        ${user.pos ? `<span style="font-size:0.9rem; color:var(--accent-purple); display:inline-block; margin-top:3px;"><i class="fas fa-shoe-prints"></i> ${user.pos}</span>` : ''}
                    </div>
                    <button class="btn-primary-outline btn-sm" style="color:#f44336; border-color:#f44336; padding:8px 12px; margin-left:10px;" onclick="window.removeWaitlistUser(${index})" title="Eliminar"><i class="fas fa-trash"></i></button>
                </li>
            `;
        });
        html += '</ul>';
        listDiv.innerHTML = html;
    };

    window.addManualUser = function() {
        if (!isAdminMode) return;
        const nombre = prompt('Ingresá el nombre y apellido del jugador:');
        if (!nombre) return;
        const telefono = prompt('Ingresá su teléfono (opcional):') || '-';
        const daytime = prompt('Ingresá Día y Hora que quiere jugar (ej: Jueves 21)');
        const pos = prompt('Ingresá su posición (opcional):') || '-';
        const customDate = prompt('Ingrese la Fecha de Registro (ej: 25/10/2026). Deje en blanco para usar la fecha de hoy:');
        
        const finalDate = customDate ? customDate + ' (Manual)' : new Date().toLocaleDateString() + ' (Manual)';
        
        waitlistData.push({ nombre, telefono, pos, daytime: daytime || 'Sin especificar', date: finalDate });
        localStorage.setItem('futbolMixtoWaitlist', JSON.stringify(waitlistData));
        window.renderWaitlist();
    };

    window.removeWaitlistUser = function(index) {
        if (!confirm('¿Eliminar a este jugador de la lista?')) return;
        waitlistData.splice(index, 1);
        localStorage.setItem('futbolMixtoWaitlist', JSON.stringify(waitlistData));
        window.renderWaitlist();
    };

    window.clearWaitlist = function() {
        if (!confirm('¿Seguro que querés vaciar toda la lista? Esto no se puede deshacer.')) return;
        waitlistData = [];
        localStorage.setItem('futbolMixtoWaitlist', JSON.stringify(waitlistData));
        window.renderWaitlist();
    };

    window.downloadWaitlistCSV = function() {
        if (waitlistData.length === 0) {
            alert('La lista está vacía.');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Nombre,Telefono,DiaHora,Posicion,Fecha\n";
        waitlistData.forEach(row => {
            const rowStr = `"${row.nombre}","${row.telefono}","${row.daytime || ''}","${row.pos}","${row.date}"`;
            csvContent += rowStr + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "lista_espera_futbol_mixto.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('name').value;
            const daytime = document.getElementById('daytime').value;
            const telefono = document.getElementById('phone').value;
            const pos = document.getElementById('pos').value;

            // Basic simulation of loading text
            const btnOriginalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Guardar en LocalStorage
                waitlistData.push({ nombre, telefono, pos, daytime, date: new Date().toLocaleDateString() });
                localStorage.setItem('futbolMixtoWaitlist', JSON.stringify(waitlistData));
                
                if (isAdminMode && window.renderWaitlist) {
                    window.renderWaitlist();
                }

                form.reset();
                submitBtn.innerHTML = btnOriginalText;
                submitBtn.disabled = false;

                // Show success message
                formMsg.classList.remove('hidden');

                setTimeout(() => {
                    formMsg.classList.add('hidden');
                }, 5000);
            }, 1000);
        });
    }

});
