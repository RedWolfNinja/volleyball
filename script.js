// Переключение текста кнопки пользователя в зависимости от статуса входа
function toggleUserButtonText() {
    var userButton = document.getElementById("userButton");
    var username = "Юзер"; // Замени на имя пользователя, если он вошел
    userButton.textContent = username;
}

// Обработчик клика по кнопке пользователя
document.getElementById("userButton").addEventListener("click", function() {
    // Открыть/закрыть меню
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.classList.toggle("show");
});

// Загрузить данные о пользователе и обновить кнопку пользователя
window.addEventListener("load", function() {
    // Здесь можно выполнить запрос к серверу для получения информации о пользователе
    // Вместо этого используется фиктивная функция
    toggleUserButtonText();
});

// Обновить кнопку пользователя после успешного входа/регистрации
function updateUserButton() {
    toggleUserButtonText();
}

// Перенаправить на страницу профиля пользователя
function goToUserProfile() {
    // Здесь можно добавить переход на страницу профиля пользователя
    alert("Переход на страницу профиля пользователя");
}
