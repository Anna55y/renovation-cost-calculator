// Калькулятор ремонта - чистый JS без ошибок
document.addEventListener('DOMContentLoaded', function() {
    
    // Основные элементы
    const calculateBtn = document.getElementById('calculate-btn');
    const requestBtn = document.getElementById('request-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const requestForm = document.getElementById('request-form');
    const estimateList = document.getElementById('estimate-list');
    const totalPriceElement = document.getElementById('total-price');
    const modalTotalElement = document.getElementById('modal-total');
    const areaInput = document.getElementById('area');
    const bathroomAreaInput = document.getElementById('bathroom-area');
    const tilingCheckbox = document.getElementById('tiling');
    
    // Функция форматирования денег
    function formatMoney(amount) {
        return amount.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        });
    }
    
    // Валидация
    function validate() {
        let ok = true;
        const area = parseFloat(areaInput.value) || 0;
        const bathroom = parseFloat(bathroomAreaInput.value) || 0;
        
        // Сброс ошибок
        areaInput.classList.remove('input-error');
        bathroomAreaInput.classList.remove('input-error');
        
        if (area < 20 || area > 200) {
            areaInput.classList.add('input-error');
            ok = false;
        }
        
        if (tilingCheckbox.checked && (bathroom < 1 || bathroom > 20)) {
            bathroomAreaInput.classList.add('input-error');
            ok = false;
        }
        
        return ok;
    }
    
    // Расчет
    function calculate() {
        if (!validate()) return;
        
        const repairType = document.querySelector('input[name="repair-type"]:checked');
        const pricePerMeter = parseInt(repairType.value);
        const area = parseFloat(areaInput.value);
        const bathroom = parseFloat(bathroomAreaInput.value);
        
        let total = pricePerMeter * area;
        let items = [];
        
        // Базовая стоимость
        items.push({
            name: 'Ремонт (' + area + ' м²)',
            cost: pricePerMeter * area
        });
        
        // Дополнительные опции
        if (document.getElementById('demolition').checked) {
            const cost = total * 0.15;
            items.push({ name: 'Демонтаж (+15%)', cost: cost });
            total += cost;
        }
        
        if (document.getElementById('electrics').checked) {
            const cost = total * 0.20;
            items.push({ name: 'Электрика (+20%)', cost: cost });
            total += cost;
        }
        
        if (tilingCheckbox.checked) {
            const cost = bathroom * 2000;
            items.push({ name: 'Плитка (' + bathroom + ' м²)', cost: cost });
            total += cost;
        }
        
        if (document.getElementById('cleaning').checked) {
            items.push({ name: 'Уборка', cost: 5000 });
            total += 5000;
        }
        
        // Показать результат
        showResult(items, total);
        modalTotalElement.value = formatMoney(total);
    }
    
    // Показать результат
    function showResult(items, total) {
        estimateList.innerHTML = '';
        
        for (let i = 0; i < items.length; i++) {
            const li = document.createElement('li');
            li.className = 'estimate-item';
            li.innerHTML = '<span>' + items[i].name + '</span>' +
                          '<span class="estimate-value">' + formatMoney(items[i].cost) + '</span>';
            estimateList.appendChild(li);
        }
        totalPriceElement.textContent = formatMoney(total);
    }
    
    // Инициализация
    calculate();
    
    // События для радио и чекбоксов
    const allOptions = document.querySelectorAll('.radio-option, .checkbox-option');
    for (let i = 0; i < allOptions.length; i++) {
        allOptions[i].addEventListener('click', function(e) {
            if (e.target.tagName === 'INPUT') return;
            
            const input = this.querySelector('input');
            if (input.type === 'radio') {
                // Для радио - убрать selected у всех
                document.querySelectorAll('.radio-option').forEach(function(el) {
                    el.classList.remove('selected');
                });
                input.checked = true;
                this.classList.add('selected');
            } else {
                // Для чекбоксов
                input.checked = !input.checked;
                this.classList.toggle('selected');
                
                if (input.id === 'tiling') {
                    bathroomAreaInput.disabled = !input.checked;
                    if (!input.checked) bathroomAreaInput.value = '5';
                }
            }
            
            calculate();
        });
    }
    
    // События для инпутов
    areaInput.addEventListener('input', calculate);
    bathroomAreaInput.addEventListener('input', function() {
        if (tilingCheckbox.checked) calculate();
    });
    
    // Кнопки
    calculateBtn.addEventListener('click', calculate);
    
    requestBtn.addEventListener('click', function() {
        if (validate()) {
            calculate();
            modalOverlay.classList.add('active');
            document.getElementById('client-name').focus();
        }
    });
    
    closeModalBtn.addEventListener('click', function() {
        modalOverlay.classList.remove('active');
    });
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });
    
    // Форма заявки
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Простая валидация формы
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const email = document.getElementById('client-email').value.trim();
        
        let hasError = false;
        
        // Сброс ошибок
        document.querySelectorAll('.error-message').forEach(function(el) {
            el.style.display = 'none';
        });
        document.querySelectorAll('.form-group input').forEach(function(el) {
            el.classList.remove('input-error');
        });
        
        // Проверки
        if (!name) {
            document.getElementById('name-error').style.display = 'block';
            document.getElementById('client-name').classList.add('input-error');
            hasError = true;
        }
        
        if (!phone || phone.length < 10) {
            document.getElementById('phone-error').style.display = 'block';
            document.getElementById('client-phone').classList.add('input-error');
            hasError = true;
        }
        
        if (!email || !email.includes('@')) {
            document.getElementById('email-error').style.display = 'block';
            document.getElementById('client-email').classList.add('input-error');
            hasError = true;
        }
        
        if (!hasError) {
            // Показать успех
            const modalContent = document.getElementById('modal-content');
            const randomId = Math.floor(100000 + Math.random() * 900000);
            
            modalContent.innerHTML = '<div class="submit-success">' 
              '<div class="success-icon"><i class="fas fa-check-circle"></i></div>' +
                '<h3 class="success-message">Заявка отправлена!</h3>' +
                '<p>Номер заявки: #' + randomId + '</p>' +
                '<button class="btn btn-primary" id="close-success">Закрыть</button>' +
                '</div>';
            
            document.getElementById('close-success').addEventListener('click', function() {
                modalOverlay.classList.remove('active');
                // Вернуть форму через секунду
                setTimeout(function() {
                    modalContent.innerHTML = document.querySelector('form').outerHTML;
                    // Повторно привязать событие submit
                    document.getElementById('request-form').addEventListener('submit', arguments.callee);
                }, 1000);
            });
            
            console.log('Заявка:', { name: name, phone: phone, email: email });
        }
    });
    
    // Начальное выделение выбранных элементов
    document.querySelectorAll('.radio-option, .checkbox-option').forEach(function(el) {
        if (el.querySelector('input').checked) {
            el.classList.add('selected');
        }
    });
});
