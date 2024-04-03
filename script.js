// После загрузки контента
document.addEventListener("DOMContentLoaded", function () {
    // Показываем первый слайд
    showSlide("startSlide1");

    // Ждем определенное время перед показом второго слайда
    setTimeout(function () {
        showSlide("startSlide2");
    }, 5000); // Время в миллисекундах (здесь 5000 миллисекунд или 5 секунд)

    // Ждем определенное время перед началом теста
    setTimeout(function () {
        startQuiz();
    }, 5000); // Время в миллисекундах (здесь 10000 миллисекунд или 10 секунд)
});

function showSlide(slideId) {
    // Скрыть все слайды
    var slides = document.querySelectorAll(".slide");
    slides.forEach(function (slide) {
        slide.style.display = "none";
    });

    // Показать заданный слайд
    document.getElementById(slideId).style.display = "block";
}


function startQuiz(){
    setTimeout(function(){
        var slides = document.querySelectorAll(".slide");
    slides.forEach(function (slide) {
        slide.style.display = "none";
    });
        document.getElementById("qustionContainer").style.display = "block";
        showQuestion(questionsData.questions[currentQuestion]);
    }, 5000);
}
const quest = document.getElementById('qustionContainer');
const questionContainer = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const submitButton = document.getElementById('submitBtn');
const resultContainer = document.getElementById('result');

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

// Показать вопрос и варианты ответов



function showQuestion(question) {
    questionContainer.textContent = question.question;

    // Очистить предыдущие варианты ответов и картинки
    optionsContainer.innerHTML = '';

    if (question.backgroundImage) {
        quest.style.backgroundImage = `url(${question.backgroundImage})`;
        quest.classList.add('question-with-background');
    } else {
        // Убираем фоновое изображение, если его нет
        quest.style.backgroundImage = 'none';
        quest.classList.remove('question-with-background');
    }

    // Если есть изображение для вопроса, добавляем его
    if (question.image) {
        const image = document.createElement('img');
        image.src = question.image;
        image.alt = "Question Image";
        optionsContainer.appendChild(image);
    }

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
    submitButton.disabled = true;
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
                // Показываем картинку правильного ответа
                showCorrectImage(currentQuestionData.correctImage);
                // Задержка перед переходом к следующему вопросу
                setTimeout(() => {
                    // Переходим к следующему вопросу или завершаем тест
                    currentQuestion++;
                    if (currentQuestion < questionsData.questions.length) {
                        showQuestion(questionsData.questions[currentQuestion]);
                        submitButton.disabled = false;
                    } else {
                        showResult();
                    }
                }, 3000); // 3000 миллисекунд (3 секунды)
            } else {
                moveToNearestCheckpoint();
                submitButton.disabled = false;
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
                // Показываем картинку правильного ответа
                showCorrectImage(currentQuestionData.correctImage);
                // Задержка перед переходом к следующему вопросу
                setTimeout(() => {
                    // Переходим к следующему вопросу или завершаем тест
                    currentQuestion++;
                    if (currentQuestion < questionsData.questions.length) {
                        showQuestion(questionsData.questions[currentQuestion]);
                        submitButton.disabled = false;
                    } else {
                        showResult();
                    }
                }, 3000); // 3000 миллисекунд (3 секунды)
            } else {
                moveToNearestCheckpoint();
                submitButton.disabled = false;
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

    resultContainer.textContent = `Вы ответили правильно на ${score} из ${questionsData.questions.length} вопросов.`;
    submitButton.disabled = false;
}
