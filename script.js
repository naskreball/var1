let currentStep = 1;
const totalSteps = 7;

const state = {
    event: '', shape: '', weight: 0, portions: 0, filling: '', gallery: '', cakeText: '', hasUpload: false
};

const PRICE_PER_KG = 1550;

// --- Навигация ---
function updateNavButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    
    if (currentStep === totalSteps) {
        document.getElementById('nav-buttons').style.display = 'none';
    } else {
        document.getElementById('nav-buttons').style.display = 'flex';
    }

    let canGoNext = false;
    if (currentStep === 1) canGoNext = !!state.event;
    if (currentStep === 2) canGoNext = !!state.shape;
    if (currentStep === 3) canGoNext = state.weight > 0;
    if (currentStep === 4) canGoNext = !!state.filling;
    if (currentStep === 5) canGoNext = true;
    if (currentStep === 6) canGoNext = true;

    nextBtn.disabled = !canGoNext;
    nextBtn.style.opacity = canGoNext ? '1' : '0.5';
    nextBtn.style.cursor = canGoNext ? 'pointer' : 'not-allowed';
}

function goToStep(step) {
    document.querySelectorAll('.step-view').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
    updateProgress();
    updateNavButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() { if (currentStep < totalSteps) goToStep(currentStep + 1); }
function prevStep() { if (currentStep > 1) goToStep(currentStep - 1); }

function updateProgress() {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.querySelectorAll('.step-label').forEach((el, index) => {
        el.classList.toggle('active', index + 1 <= currentStep);
    });
}

// --- Выбор ---
function clearActive(containerId) {
    document.getElementById(containerId)?.querySelectorAll('.btn-option, .cat-btn').forEach(btn => btn.classList.remove('active'));
}

function selectOption(type, value, btn) {
    state[type] = value;
    clearActive('event-options');
    btn.classList.add('active');
    document.getElementById('custom-event').value = '';
    updateSummary();
    updateNavButtons();
}

function selectCustom(type, value) {
    if (value.trim() !== '') {
        state[type] = value;
        clearActive('event-options');
        updateSummary();
        updateNavButtons();
    }
}

function selectShape(value, btn) {
    state.shape = value;
    clearActive('shape-options');
    btn.classList.add('active');
    renderFillingCategories(value); 
    updateSummary();
    updateNavButtons();
}

function selectWeight(value, btn) {
    state.weight = parseFloat(value);
    clearActive('weight-options');
    btn.classList.add('active');
    document.getElementById('custom-weight').value = '';
    calculatePortions(state.weight);
    updateSummary();
    updateNavButtons();
}

function selectCustomWeight(value) {
    const w = parseFloat(value);
    if (!isNaN(w) && w >= 2) {
        state.weight = w;
        document.querySelectorAll('#weight-options .btn-option').forEach(b => b.classList.remove('active'));
        calculatePortions(w);
        updateSummary();
        updateNavButtons();
    }
}

function calculatePortions(weightKg) {
    const portions = Math.floor((weightKg * 1000) / 150);
    state.portions = portions;
    document.getElementById('portions-count').innerText = portions;
    document.getElementById('calc-info').style.display = 'block';
}

// --- ШАГ 4: НАЧИНКИ И ФОТО ---
const fillingData = {
    'Шоколадные': 11,
    'Кофейные': 8,
    'Медовые': 4,
    'Фруктово-ягодные': 13,
    'Карамель / Крем-брюле': 4,
    'С безе': 3,
    'С суфле "Птичье молоко"': 3,
    'Многокомпонентные': 4,
    'А еще...': 5
};

function renderFillingCategories(shape) {
    const catContainer = document.getElementById('filling-categories');
    catContainer.innerHTML = '';
    
    let allowedCategories = Object.keys(fillingData);

    if (shape === 'Фигурный') {
        allowedCategories = allowedCategories.filter(c => c !== 'Многокомпонентные');
    } else if (shape === 'Многоярусный') {
        allowedCategories = ['Шоколадные', 'Фруктово-ягодные', 'Медовые'];
    }

    allowedCategories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${index === 0 ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => selectCategory(cat, btn);
        catContainer.appendChild(btn);
    });

    if (allowedCategories.length > 0) {
        selectCategory(allowedCategories[0], catContainer.firstChild);
    }
}

function selectCategory(catName, btn) {
    clearActive('filling-categories');
    btn.classList.add('active');
    
    const cakePhoto = document.getElementById('cake-photo-visual');
    cakePhoto.className = 'cake-photo'; 
    
    const themes = {
        'Шоколадные': 'theme-choco',
        'Кофейные': 'theme-coffee',
        'Медовые': 'theme-honey',
        'Фруктово-ягодные': 'theme-fruit',
        'Карамель / Крем-брюле': 'theme-caramel',
        'С безе': 'theme-bez',
        'С суфле "Птичье молоко"': 'theme-souffle',
        'Многокомпонентные': 'theme-multi',
        'А еще...': 'theme-choco'
    };
    
    if (themes[catName]) {
        cakePhoto.classList.add(themes[catName]);
        const textEl = cakePhoto.querySelector('.photo-text');
        if(textEl) textEl.style.display = 'none';
    }

    const grid = document.getElementById('filling-grid');
    grid.innerHTML = '';
    const count = fillingData[catName];
    
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'btn-option';
        div.onclick = function() { 
            state.filling = `${catName} (Вариант ${i})`;
            clearActive('filling-grid');
            this.classList.add('active');
            updateSummary();
            updateNavButtons();
        };
        div.innerHTML = `<div class="img-placeholder" style="height:60px; margin-bottom:5px;">Фото</div><div style="font-size:10px;">Начинка ${i}</div>`;
        grid.appendChild(div);
    }
}

// --- ШАГ 5: ГАЛЕРЕЯ И ЗАГРУЗКА ---
function switchGalleryTab(tabName, btn) {
    document.querySelectorAll('.g-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'btn-option';
        div.style.padding = '5px';
        div.onclick = function() {
            state.gallery = `${tabName} (Фото ${i})`;
            clearActive('gallery-grid');
            this.classList.add('active');
            updateSummary();
        };
        div.innerHTML = `<div class="img-placeholder" style="height:80px; margin:0;">Фото ${i}</div>`;
        grid.appendChild(div);
    }
}

switchGalleryTab('Праздничные', document.querySelector('.g-tab'));

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('preview-container').classList.remove('hidden');
            document.querySelector('.upload-label').style.display = 'none';
            state.hasUpload = true;
            updateSummary();
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto(e) {
    e.preventDefault();
    document.getElementById('image-preview').src = '';
    document.getElementById('preview-container').classList.add('hidden');
    document.querySelector('.upload-label').style.display = 'flex';
    document.getElementById('file-upload').value = '';
    state.hasUpload = false;
    updateSummary();
}

// --- Итог ---
function toggleNoText(isChecked) {
    const input = document.getElementById('cake-text');
    input.value = isChecked ? 'Никакой, он и так прекрасен' : '';
    input.disabled = isChecked;
    state.cakeText = input.value;
    updateSummary();
}

function updateSummary() {
    document.getElementById('sum-event').innerText = state.event || 'Не выбрано';
    document.getElementById('sum-shape').innerText = state.shape || 'Не выбрано';
    document.getElementById('sum-weight').innerText = state.weight ? `${state.weight} кг` : 'Не выбран';
    document.getElementById('sum-portions').innerText = state.portions ? `${state.portions} персон` : '-';
    document.getElementById('sum-filling').innerText = state.filling || 'Не выбрана';
    document.getElementById('sum-text').innerText = document.getElementById('cake-text').value || '-';
    document.getElementById('sum-gallery').innerText = state.gallery || 'Без референса';
    document.getElementById('sum-upload').innerText = state.hasUpload ? 'Загружено ваше фото' : 'Нет';

    const priceEl = document.getElementById('sum-price');
    const priceContainer = document.getElementById('price-container');
    
    if (state.weight > 0) {
        const price = state.weight * PRICE_PER_KG;
        const formatted = price.toLocaleString('ru-RU');
        if(priceEl.innerText !== formatted) {
            priceContainer.classList.add('price-pulse');
            setTimeout(() => priceContainer.classList.remove('price-pulse'), 300);
        }
        priceEl.innerText = formatted;
    } else {
        priceEl.innerText = '0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    updateNavButtons();
});