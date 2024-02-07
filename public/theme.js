// theme.js
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-theme', themeToggle.checked);
  // Обновляем текст метки переключателя
  themeLabel.textContent = themeToggle.checked ? 'Light Mode' : 'Dark Mode';
});

// Проверяем сохраненную пользователем тему в localStorage
document.addEventListener('DOMContentLoaded', () => {
  const isDarkTheme = localStorage.getItem('dark-theme') === 'true';
  themeToggle.checked = isDarkTheme;
  document.body.classList.toggle('dark-theme', isDarkTheme);
  themeLabel.textContent = isDarkTheme ? 'Light Mode' : 'Dark Mode';
});

// Сохраняем тему в localStorage при изменении
themeToggle.addEventListener('change', () => {
  localStorage.setItem('dark-theme', themeToggle.checked);
});
