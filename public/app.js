const contactForm = document.querySelector("#contactForm");
const contactResult = document.querySelector("#contactResult");
const submitButton = contactForm.querySelector('button[type="submit"]');
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = themeToggle.querySelector(".theme-label");
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    themeColor.setAttribute("content", isDark ? "#0c1220" : "#f7f8fb");
}

let savedTheme;
try {
    savedTheme = localStorage.getItem("portfolio-theme");
} catch (error) {
    console.warn("Could not read the saved theme preference.", error);
}

applyTheme(savedTheme === "dark" ? "dark" : "light");

themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";
    applyTheme(nextTheme);

    try {
        localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
        console.warn("Could not save the theme preference.", error);
    }
});

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    contactForm.setAttribute("aria-busy", "true");
    contactResult.classList.remove("is-error");
    contactResult.textContent = "Sending your message...";

    const formData = new FormData(contactForm);
    const name = formData.get("name").trim();

    try {
        const response = await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email: formData.get("email").trim(),
                message: formData.get("message").trim()
            })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to send your message.");
        }

        contactResult.textContent = `Thank you, ${name}! Your message was sent.`;
        contactForm.reset();
    } catch (error) {
        console.error("Contact form error:", error);
        contactResult.classList.add("is-error");
        contactResult.textContent = error instanceof TypeError
            ? "Can't reach the portfolio server. Start it with npm.cmd start, then open the portfolio from that server."
            : error instanceof Error
                ? error.message
                : "Your message could not be sent. Please try again.";
    } finally {
        submitButton.disabled = false;
        contactForm.removeAttribute("aria-busy");
    }
});

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navbar.classList.toggle("menu-open", !isOpen);
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        navbar.classList.remove("menu-open");
    });
});

const sections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            navLinks.forEach((link) => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${entry.target.id}`
                );
            });
        });
    }, { rootMargin: "-25% 0px -60% 0px" });

    sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelector("#currentYear").textContent = new Date().getFullYear();