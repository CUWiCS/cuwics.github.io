// Custom JavaScript for CUWICS Website

$(document).ready(function() {
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 1000);
        }
    });

    // Add active class to navigation items based on current page
    var currentPage = window.location.pathname;
    $('.navbar-nav li a').each(function() {
        var link = $(this).attr('href');
        if (link === currentPage || (currentPage === '/' && link === '/')) {
            $(this).parent().addClass('active');
        }
    });

    // Initialize tooltips if Bootstrap is available
    if (typeof $.fn.tooltip !== 'undefined') {
        $('[data-toggle="tooltip"]').tooltip();
    }

    // Add loading animation for images
    $('img').on('load', function() {
        $(this).addClass('loaded');
    });

    // Smooth hover effects for cards
    $('.event-category-horizontal, .sponsor-card, .team-card, .subscription-card').hover(
        function() {
            $(this).addClass('hovered');
        },
        function() {
            $(this).removeClass('hovered');
        }
    );

    // Animate elements on scroll
    function animateOnScroll() {
        $('.event-category-horizontal, .sponsor-card, .team-card, .subscription-card').each(function() {
            var elementTop = $(this).offset().top;
            var elementBottom = elementTop + $(this).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();

            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('animate-in');
            }
        });
    }

    // Call on scroll and on page load
    $(window).on('scroll', animateOnScroll);
    animateOnScroll();

    // Newsletter subscription form handling (if exists)
    $('.newsletter-form').on('submit', function(e) {
        e.preventDefault();
        // Add newsletter subscription logic here
        console.log('Newsletter subscription submitted');
    });

    // Social media link tracking
    $('.social-links a').on('click', function() {
        var platform = $(this).find('i').attr('class').split(' ')[1];
        console.log('Social media link clicked:', platform);
        // Add analytics tracking here if needed
    });

    // PDF download tracking
    $('a[href*=".pdf"]').on('click', function() {
        var filename = $(this).attr('href').split('/').pop();
        console.log('PDF downloaded:', filename);
        // Add download tracking here if needed
    });

    // Mobile menu improvements
    $('.navbar-toggle').on('click', function() {
        $(this).toggleClass('active');
    });

    // Close mobile menu when clicking on a link
    $('.navbar-nav li a').on('click', function() {
        if ($(window).width() < 768) {
            $('.navbar-collapse').collapse('hide');
            $('.navbar-toggle').removeClass('active');
        }
    });

    // Add parallax effect to header backgrounds
    $(window).on('scroll', function() {
        var scrolled = $(window).scrollTop();
        $('.header-parallax').css('transform', 'translateY(' + (scrolled * 0.5) + 'px)');
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Utility functions
function debounce(func, wait, immediate) {
    var timeout;
    return function executedFunction() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    var inThrottle;
    return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
$(window).on('scroll', throttle(function() {
    // Scroll-based animations and effects
}, 16)); // ~60fps 