document.getElementById("on_off").addEventListener("click", () => {
  // Toggle visibility for your elements
  document.querySelector("main").classList.toggle("hidden");
  document.getElementById("section2").classList.toggle("hidden");

  // Toggle gray backgrounds
  document.querySelector("header").classList.toggle("gray");
  document.querySelector(".spacer_1").classList.toggle("gray");
  document.querySelectorAll(".transition").forEach(el => el.classList.toggle("gray"));

  // Toggle the button "active" state
  document.querySelector("#on_off button").classList.toggle("active");
});
