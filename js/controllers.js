if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !document.cookie.includes("darkmode=false")) {
    document.body.classList.add('darkmode');
    document.getElementById("dark-mode-toggle").checked = true;
}
else if (document.cookie.includes("darkmode=true")) {
    document.body.classList.add('darkmode');
    document.getElementById("dark-mode-toggle").checked = true;
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    if (newColorScheme === "dark" && !document.cookie.includes("darkmode=false")) {
        document.body.classList.add('darkmode');
        document.getElementById("dark-mode-toggle").checked = true;
    } else if (!document.cookie.includes("darkmode=true")) {
        document.body.classList.remove('darkmode');
        document.getElementById("dark-mode-toggle").checked = false;
    }
});
let settings = document.getElementById("settings");
let logo = document.getElementById("logo");
logo.addEventListener("click", function() {
    if (settings.classList.toString().includes("expanded")) {
        settings.classList.remove("expanded");
    } else {
        settings.classList.add("expanded");
    }
});
if (document.cookie.includes("monospace=true")) {
    document.body.classList.add('monospace');
    document.getElementById("monospace-toggle").checked = true;
}
if (document.cookie.includes("contrast=true")) {
    document.body.classList.add('contrast');
    document.getElementById("contrast-toggle").checked = true;
}
if (document.cookie.includes("nomotion=true")) {
    document.body.classList.add('nomotion');
    document.getElementById("nomotion-toggle").checked = true;
}
document.getElementById("dark-mode-toggle").addEventListener("change", function() {
    if (this.checked) {
        document.body.classList.add('darkmode');
        document.cookie = "darkmode=true; path=/; max-age=31536000"; // 1 year
    } else {
        document.body.classList.remove('darkmode');
        document.cookie = "darkmode=false; path=/; max-age=31536000";
    }
});
document.getElementById("monospace-toggle").addEventListener("change", function() {
    if (this.checked) {
        document.body.classList.add('monospace');
        document.cookie = "monospace=true; path=/; max-age=31536000"; // 1 year
    } else {
        document.body.classList.remove('monospace');
        document.cookie = "monospace=false; path=/; max-age=31536000";
    }
});
document.getElementById("contrast-toggle").addEventListener("change", function() {
    if (this.checked) {
        document.body.classList.add('contrast');
        document.cookie = "contrast=true; path=/; max-age=31536000"; // 1 year
    } else {
        document.body.classList.remove('contrast');
        document.cookie = "contrast=false; path=/; max-age=31536000";
    }
});
document.getElementById("nomotion-toggle").addEventListener("change", function() {
    if (this.checked) {
        document.body.classList.add('nomotion');
        document.cookie = "nomotion=true; path=/; max-age=31536000"; // 1 year
    } else {
        document.body.classList.remove('nomotion');
        document.cookie = "nomotion=false; path=/; max-age=31536000";
    }
});