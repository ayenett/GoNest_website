document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    /* -------------------------------------------------------------
       1. Navigation & Hamburger Menu
    -------------------------------------------------------------- */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.getElementById('navbar');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    document.querySelectorAll(".faq-question").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.parentElement;
            item.classList.toggle("active");
            // Refresh GSAP ScrollTrigger calculations after CSS transition finishes
            setTimeout(() => ScrollTrigger.refresh(), 400);
        });
    });

    /* -------------------------------------------------------------
       2. Image Sequence Canvas Logic utility
    -------------------------------------------------------------- */
    function setupCanvasSequence(canvasId, containerClass, frameCount, frameSrcFunc, pinDuration = "+=150%") {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const context = canvas.getContext("2d");

        // Set canvas resolution
        canvas.width = 1920;
        canvas.height = 1080;

        const frameObj = { frame: 0 };
        const images = [];
        let loadedFrames = 0;

        // Populate images
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = frameSrcFunc(i);
            images.push(img);
            img.onload = () => {
                loadedFrames++;
                if (i === 0) render(); // Render first frame immediately once loaded
            }
        }

        // Draw the image proportionally scale-to-cover
        function render() {
            if (!images[frameObj.frame]) return;
            const img = images[frameObj.frame];
            if (!img.complete) return;

            // Clear full canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate cover dimensions
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;

            if (imgRatio > canvasRatio) {
                drawWidth = canvas.height * imgRatio;
                offsetX = (canvas.width - drawWidth) / 2;
            } else {
                drawHeight = canvas.width / imgRatio;
                offsetY = (canvas.height - drawHeight) / 2;
            }

            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        // Set up ScrollTrigger GSAP
        gsap.to(frameObj, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: containerClass,
                start: "top top",
                end: pinDuration, // scroll this much to play through sequence
                scrub: 0.5,       // smooth scrubbing
                pin: true,        // pin the section while scrubbing
            },
            onUpdate: render // call our render function on every update
        });
    }

    /* -------------------------------------------------------------
       3. Initialize Canvas Sequences
    -------------------------------------------------------------- */
    // Hero Phone Sequence (26 frames)
    setupCanvasSequence(
        "hero-canvas",
        ".hero-pinned-container",
        25,
        (index) => `assets/phone-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`,
        "+=150%" // Makes the user scroll a bit more before it unpins
    );

    // Security Phone Sequence (21 frames)
    setupCanvasSequence(
        "security-canvas",
        ".security-pinned-container",
        21,
        (index) => `assets/Security-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`,
        "+=150%"
    );

    /* -------------------------------------------------------------
       4. GSAP Standard Layout Animations
    -------------------------------------------------------------- */

    // Animate Hero text to fade in right away independently of scroll
    gsap.fromTo(".gsap-hero-text",
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.2 }
    );

    // Fade up sections (features header, about header, footer)
    gsap.utils.toArray('.gsap-fade-up').forEach(elem => {
        gsap.fromTo(elem,
            { y: 40, autoAlpha: 0 },
            {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Fade in objects (about us content, phones)
    gsap.utils.toArray('.gsap-fade-in').forEach(elem => {
        gsap.fromTo(elem,
            { scale: 0.95, autoAlpha: 0 },
            {
                scale: 1,
                autoAlpha: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 80%",
                }
            }
        );
    });

    // Slide in features (Left & Right)
    gsap.utils.toArray('.gsap-slide-left').forEach(elem => {
        gsap.fromTo(elem.children,
            { x: -50, autoAlpha: 0 },
            {
                x: 0,
                autoAlpha: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 80%",
                }
            }
        );
    });

    gsap.utils.toArray('.gsap-slide-right').forEach(elem => {
        gsap.fromTo(elem.children,
            { x: 50, autoAlpha: 0 },
            {
                x: 0,
                autoAlpha: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 80%",
                }
            }
        );
    });

    /* -------------------------------------------------------------
       5. 3D Glassmorphism Mouse Tilt Effect for Security Section
    -------------------------------------------------------------- */
    const tiltCard = document.querySelector('.glass-tilt-card');
    const tiltContainer = document.querySelector('.security-pinned-container');

    if (tiltCard && tiltContainer) {
        tiltContainer.addEventListener('mousemove', (e) => {
            const rect = tiltContainer.getBoundingClientRect();
            // Get mouse position relative to container center (-1 to 1)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            // Adjust max tilt degrees
            const rotateX = y * -15;
            const rotateY = x * 15;

            tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Reset transform when mouse leaves
        tiltContainer.addEventListener('mouseleave', () => {
            tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            tiltCard.style.transition = `transform 0.5s ease-out`;
        });

        tiltContainer.addEventListener('mouseenter', () => {
            tiltCard.style.transition = `transform 0.1s ease-out`;
        });
    }
});
