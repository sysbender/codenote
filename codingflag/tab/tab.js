let colorCodes = ["#f44336", "#4caf50", "#2196f3", "#ff5722"];

let tabButtons = document.querySelectorAll(
  ".tab-container .button-container button"
);

let tabPanels = document.querySelectorAll(".tab-container .tab-panel");

function showPanel(panelIndex, colorCode) {
  // button
  tabButtons.forEach(function (node) {
    node.style.backgroundColor = "";
    node.style.color = "";
  });

  tabButtons[panelIndex].style.backgroundColor = colorCode;
  tabButtons[panelIndex].style.color = "white";
  // panel

  tabPanels.forEach(function (node) {
    node.style.display = "none";
  });
  tabPanels[panelIndex].style.display = "block";
  tabPanels[panelIndex].style.backgroundColor = colorCode;
}

tabButtons.forEach(function (node, index) {
  node.addEventListener("click", function () {
    showPanel(index, colorCodes[index]);
  });
});

showPanel(0, colorCodes[0]);
