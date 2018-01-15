/*jslint
    browser
*/

function toggle(elementId) {
    "use strict";
    const elementToToggle = document.getElementById(elementId);

    if (!elementToToggle) {
        return;
    }

    if (elementToToggle.style.display === "block") {
        elementToToggle.style.display = "none";
    } else {
        elementToToggle.style.display = "block";
    }
}
