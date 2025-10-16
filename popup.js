// on of func
document.getElementById("on_off").addEventListener("click", () => {
  
  document.querySelector("main").classList.toggle("hidden");
  document.getElementById("section2").classList.toggle("hidden");


  document.querySelector("header").classList.toggle("gray");
  document.querySelector(".spacer_1").classList.toggle("gray");
  document.querySelectorAll(".transition").forEach(el => el.classList.toggle("gray"));

  
  document.querySelector("#on_off button").classList.toggle("active");
});

// settigns open site
document.getElementById("settings_icon").addEventListener("click", () => {
    document.querySelector("main").classList.toggle("hidden");
    document.querySelector("header svg").classList.toggle("active");
    document.getElementById("section3").classList.toggle("hidden");

});

// settings buttons toggle studf
// ! whitelist button func todo
document.getElementById("whitelist_button").addEventListener("click", () => {
    document.querySelector("#whitelist_button").classList.toggle("active");
});

// ! popup button func todo
document.getElementById("automatic_popup_button").addEventListener("click", () => {
    document.querySelector("#automatic_popup_button").classList.toggle("active");
});

// ! report button func todo
document.getElementById("report_button").addEventListener("click", () => {
    document.querySelector("#report_button").classList.toggle("active");
});




