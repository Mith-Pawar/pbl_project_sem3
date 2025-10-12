// suggestion.js
gsap.from(".suggestions-list, .intro-text, h2, h3, h4", {
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.3,  
    ease: "power2.out"
});
document.querySelectorAll(".suggestions-list ul").forEach(list => {
    gsap.from(list.children, {
        opacity: 0,
        x: -20,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
    });
});
gsap.from("scrollTrigger", {
    opacity: 0,
    y: 20,
    duration: 1,
    stagger: 0.3,
    ease: "power2.out"
});
