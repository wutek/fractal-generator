function toggle(elementId) {
    let elementToToggle = document.getElementById(elementId);

    if (elementToToggle.style.display === "block") {
        elementToToggle.style.display = "none";
    } else {
        elementToToggle.style.display = "block";
    }
}
