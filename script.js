const questionContainer = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const submitButton = document.getElementById('submitBtn');
const resultContainer = document.getElementById('result');

// Функция для отображения блока
function showBlock(blockId) {
    document.getElementById(blockId).style.display = 'block';
}

// Функция для скрытия блока
function hideBlock(blockId) {
    document.getElementById(blockId).style.display = 'none';
}

let currentQuestion = 0;
let score = 0;
let questionsData = null;

// Загрузка вопросов из JSON файла
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questionsData = data;
        showQuestion(questionsData.questions[currentQuestion]);
    });

hideBlock('startSlide2');
hideBlock('qustionContainer');

showBlock('startSlide1');

setTimeout(() => {
    hideBlock('startSlide1');
    showBlock('startSlide2');
}, 5000);

setTimeout(() => {
    hideBlock('startSlide2');
    showBlock('qustionContainer');
}, 10000);

// Показать вопрос и варианты ответов
function showQuestion(question) {
    questionContainer.textContent = question.question;

    // Очистить предыдущие варианты ответов и картинки
    optionsContainer.innerHTML = '';

    // Добавить изображение
    const image = document.createElement('img');
    image.src = question.image;
    image.alt = "Question Image";
    optionsContainer.appendChild(image);

    if (question.orderedActions) {
        // Добавить поля ввода порядка для каждого действия
        question.orderedActions.forEach((action, index) => {
            const inputField = document.createElement('input');
            inputField.type = "number";
            inputField.classList.add('input-field');
            inputField.setAttribute('data-action-index', index);
            inputField.placeholder = "Порядок для " + action;

            const label = document.createElement('label');
            label.textContent = action;

            const container = document.createElement('div');
            container.appendChild(label);
            container.appendChild(inputField);

            optionsContainer.appendChild(container);
        });
    } else {
        // Добавить варианты ответов, если это не задание на установку действий в правильном порядке
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.value = option;
            checkbox.id = "option" + index;
            checkbox.classList.add('option-checkbox');
            checkbox.addEventListener('change', selectOption); // Добавляем обработчик события для изменения состояния чекбоксов

            const label = document.createElement('label');
            label.htmlFor = "option" + index;
            label.textContent = option;

            optionElement.appendChild(checkbox);
            optionElement.appendChild(label);

            optionsContainer.appendChild(optionElement);
        });
    }

    // Включаем кнопку submit при загрузке нового вопроса
    submitButton.disabled = false;
}

// Проверить порядок действий и их значения
function checkOrder(userOrder, correctOrder) {
    let correctCount = 0;
    for (let i = 0; i < userOrder.length; i++) {
        if (userOrder[i] === correctOrder[i]) {
            correctCount++;
            // Подсветить правильный ответ зеленым
            const inputField = document.querySelector(`.input-field[data-action-index="${i}"]`);
            inputField.classList.add('correct-answer');
        }
    }
    return correctCount;
}

// Обработчик события для кнопки "Submit"
submitButton.addEventListener('click', () => {
    // Получаем значения из полей ввода порядка действий и т.д.
    const inputFields = document.querySelectorAll('.input-field');
    const userOrder = [];
    inputFields.forEach(input => {
        const actionIndex = parseInt(input.getAttribute('data-action-index'));
        const order = parseInt(input.value);
        userOrder[actionIndex] = order;
    });

    // Получаем текущий объект вопроса
    const currentQuestionData = questionsData.questions[currentQuestion];

    // Проверяем, определена ли переменная currentQuestionData
    if (currentQuestionData) {
        if (currentQuestionData.correctOrder) {
            // Проверяем порядок действий
            const correctCount = checkOrder(userOrder, currentQuestionData.correctOrder);
            console.log("Правильно ответил на " + correctCount + " из " + currentQuestionData.correctOrder.length);

            // Увеличиваем счетчик правильных ответов, если все действия указаны в правильном порядке
            if (correctCount === currentQuestionData.correctOrder.length) {
                score++;
                // Делаем кнопку submit неактивной
                submitButton.disabled = true;
                // Показываем картинку правильного ответа
                showCorrectImage(currentQuestionData.correctImage);
                // Задержка перед переходом к следующему вопросу
                setTimeout(() => {
                    // Переходим к следующему вопросу или завершаем тест
                    currentQuestion++;
                    if (currentQuestion < questionsData.questions.length) {
                        showQuestion(questionsData.questions[currentQuestion]);
                    } else {
                        showResult();
                    }
                }, 3000); // 3000 миллисекунд (3 секунды)
            }
        } else if (currentQuestionData.correct) {
            // Проверяем варианты ответов
            const selectedOptions = optionsContainer.querySelectorAll('.option-checkbox:checked');
            let allCorrect = true;

            selectedOptions.forEach(selectedOption => {
                const selectedIndex = parseInt(selectedOption.id.slice(-1));
                if (!currentQuestionData.correct.includes(selectedIndex)) {
                    allCorrect = false;
                }
            });

            if (selectedOptions.length === currentQuestionData.correct.length && allCorrect) {
                score++;
                // Делаем кнопку submit неактивной
                submitButton.disabled = true;
                // Показываем картинку правильного ответа
                showCorrectImage(currentQuestionData.correctImage);
                // Задержка перед переходом к следующему вопросу
                setTimeout(() => {
                    // Переходим к следующему вопросу или завершаем тест
                    currentQuestion++;
                    if (currentQuestion < questionsData.questions.length) {
                        showQuestion(questionsData.questions[currentQuestion]);
                    } else {
                        showResult();
                    }
                }, 3000); // 3000 миллисекунд (3 секунды)
            } else {
                moveToNearestCheckpoint();
            }
        }
    } else {
        console.error("Ошибка: Не удалось получить информацию о текущем вопросе.");
    }
});

// Функция для отображения картинки правильного ответа
function showCorrectImage(imageUrl) {
    // Получаем текущий элемент img
    const image = optionsContainer.querySelector('img');
    if (image) {
        // Заменяем src текущего элемента img на новый imageUrl
        image.src = imageUrl;
    }
}

function selectOption() {
    const selectedOptions = optionsContainer.querySelectorAll('.option-checkbox:checked');
    const currentQuestionData = questionsData.questions[currentQuestion];
    let allCorrect = true;

    selectedOptions.forEach(selectedOption => {
        const selectedIndex = parseInt(selectedOption.id.slice(-1));
        if (!currentQuestionData.correct.includes(selectedIndex)) {
            allCorrect = false;
        }
    });

    if (selectedOptions.length === currentQuestionData.correct.length && allCorrect) {
        score++;
    }
}

function findNearestCheckpoint() {
    let nearestCheckpointIndex = 0;
    let minDistance = Math.abs(currentQuestion - checkpoints[0]);

    for (let i = 1; i < checkpoints.length; i++) {
        const distance = Math.abs(currentQuestion - checkpoints[i]);
        if (distance < minDistance) {
            minDistance = distance;
            nearestCheckpointIndex = i;
        }
    }

    return checkpoints[nearestCheckpointIndex];
}

function moveToNearestCheckpoint() {
    // Находим индекс текущего вопроса
    let currentIndex = currentQuestion;

    // Перебираем вопросы в обратном порядке, начиная с текущего вопроса
    for (let i = currentIndex; i >= 0; i--) {
        if (questionsData.questions[i].checkpoint) {
            // Нашли ближайшую контрольную точку
            currentQuestion = i; // Обновляем текущий вопрос
            showQuestion(questionsData.questions[currentQuestion]); // Показываем вопрос
            return; // Завершаем поиск
        }
    }

    // Если не нашли контрольную точку в текущих вопросах, перенаправляем к первому вопросу
    currentQuestion = 0;
    showQuestion(questionsData.questions[currentQuestion]);
}

function showResult() {
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    submitButton.style.display = 'none';

    resultContainer.textContent = `Молодец! Ты дошел до конца`;
}
