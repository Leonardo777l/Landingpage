document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll Animations (Reveal on Scroll)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 2. Navbar Background on Scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 3. WhatsApp Integration (Deprecated - using direct links in HTML)
  // const phoneNumber = "524431234567";
  // const baseMessage = "Hola Leo ...";
  // const ctaButtons = document.querySelectorAll('.claim-discount-btn, .claim-discount-global'); ...

  // 4. Sticky Discount Trigger
  // Show when user scrolls past the Pricing Section or reaches near bottom
  const stickyOffer = document.getElementById('sticky-offer');
  const closeOfferBtn = document.getElementById('close-offer');
  const pricingSection = document.getElementById('packages');

  let offerDismissed = false;

  // Use Observer for the Pricing Section to trigger the sticky bar AFTER the user has seen the prices
  const pricingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !offerDismissed) {
        // User scrolled PAST the pricing section (going down)
        stickyOffer.classList.add('visible');
        stickyOffer.classList.remove('hidden');
      } else if (entry.isIntersecting) {
        // Hide if user scrolls back up to the pricing section (optional, keeps UI clean)
        stickyOffer.classList.remove('visible');
      }
    });
  }, {
    threshold: 0
  });

  if (pricingSection) {
    pricingObserver.observe(pricingSection);
  }

  closeOfferBtn.addEventListener('click', () => {
    stickyOffer.classList.remove('visible');
    stickyOffer.classList.add('hidden');
    offerDismissed = true;
  });

  // 5. Parallax for Hero Image (Simple)
  const heroImg = document.getElementById('hero-img');
  window.addEventListener('scroll', () => {
    const value = window.scrollY;
    if (heroImg) {
      // Moves the image slower than scroll
      heroImg.style.transform = `translateY(${value * 0.5}px) scale(1.05)`;
      // Note: scale is to prevent white gaps if image moves down. 
      // But we have CSS animation on it too. Let's adjust to be subtle.
      heroImg.style.transform = `translateY(${value * 0.4}px)`;
    }
  });

  // 6. Video Playlist Logic
  // 6. Video Playlist Logic (Removed - Now using Instagram Embeds)
  // Logic removed as part of update to use simple Instagram embeds instead of custom player.

  // 7. Urgency Countdown Timer
  const timerDisplay = document.getElementById('timer');
  if (timerDisplay) {
    function updateTimer() {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow - now;

      if (diff <= 0) {
        timerDisplay.innerText = "00:00:00";
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      timerDisplay.innerText =
        (hours < 10 ? "0" + hours : hours) + ":" +
        (minutes < 10 ? "0" + minutes : minutes) + ":" +
        (seconds < 10 ? "0" + seconds : seconds);
    }

    setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
  }

});
