function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    // Получаем список выбранных файлов
    const files = fileInput.files;

    // Перебираем каждый файл и обрабатываем его
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Создаем объект FormData для отправки файла на сервер
        const formData = new FormData();
        formData.append('file', file);

        // Отправляем файл на сервер (здесь вы можете использовать AJAX или другие методы)
        // В данном примере просто добавляем имя файла в список на странице
        fileList.innerHTML += `<p>${file.name}</p>`;
    }

    // Опционально: очищаем поле ввода после загрузки
    fileInput.value = '';
}
