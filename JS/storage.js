//  Save and retrieve data from localStorage
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function getFromStorage(key, fallback = []) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}