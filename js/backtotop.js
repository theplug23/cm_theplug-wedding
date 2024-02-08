document.addEventListener('DOMContentLoaded', function() {
    var backToTopButton = document.querySelector('.backtotop');
    var scrollThreshold = 500; 

    window.addEventListener('scroll', function() {
        if (window.pageYOffset < scrollThreshold) {
        backToTopButton.style.display = 'none';
        } else {
        backToTopButton.style.display = 'block';
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
    });
});