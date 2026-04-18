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
        if(navLinks.classList.contains('active')) {
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

    // Observe "Días de juego" cards
    document.querySelectorAll('.dia-card').forEach(card => {
        observer.observe(card);
    });

    /* ==========================================================================
       Form Submission Simulation
       ========================================================================== */
    const form = document.getElementById('waitlist-form');
    const formMsg = document.getElementById('form-msg');
    const submitBtn = form.querySelector('.submit-btn');

    if(form) {
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
