let changeColor = document.getElementById("changeColor");
changeColor.onclick = function (element) {
    console.log("clicked button");
};
chrome.storage.sync.get("team", function (data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute("value", "BD");
});