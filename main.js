
(function () {
  const countries = window.countries || [];
  const predicates = window.predicates || [];
  const countryList = document.getElementById('countryList');
  const search = document.getElementById('search');
  const productInput = document.getElementById('productInput');
  const checkBtn = document.getElementById('checkBtn');
  const countryInfo = document.getElementById('countryInfo');
  const result = document.getElementById('result');

  let selectedCountryCode = null;

  function renderCountryList(filter) {
    countryList.innerHTML = '';
    const list = countries.filter(c => (c.name + ' ' + c.code).toLowerCase().includes((filter||'').toLowerCase()));
    if (list.length === 0) {
      countryList.innerHTML = '<div class="text-sm text-gray-500 p-2">Ничего не найдено</div>';
      return;
    }
    list.forEach(c => {
      const el = document.createElement('div');
      el.className = 'p-2 rounded-md hover:bg-indigo-50 cursor-pointer flex justify-between items-center';
      el.innerHTML = '<div><span class="font-semibold mr-2">'+c.code+'</span>'+c.name+'</div><div class="text-xs text-gray-500">'+c.region+'</div>';
      el.addEventListener('click', () => {
        selectedCountryCode = c.code;
        countryInfo.innerHTML = '<div class="text-sm"><strong>'+c.name+'</strong> ('+c.code+')<br>Регион: '+c.region+'<br>Статус: <span class="'+(c.friendly? 'text-green-600 font-bold' : 'text-red-600 font-bold')+'">'+(c.friendly? 'Дружественная' : 'Недружественная')+'</span></div>';
      });
      countryList.appendChild(el);
    });
  }

  search.addEventListener('input', (e) => renderCountryList(e.target.value));
  renderCountryList('');

  function parseCode(input) {
    if (!input) return null;
    const parts = input.split(/[-—:]+/).map(s => s.trim()).filter(Boolean);
    const codePart = parts.length >= 2 ? parts[parts.length-1] : parts[0];
    const digits = (codePart || '').replace(/\D/g,'');
    if (digits.length === 6 || digits.length === 10) return digits;
    return null;
  }

  function determineMeasures() {
    const raw = productInput.value.trim();
    const tnved = parseCode(raw);
    if (!tnved) {
      alert('Неверный формат кода ТН ВЭД. Введите 6 или 10 цифр, например: Электродвигатель — 850110');
      return;
    }
    if (!selectedCountryCode) {
      alert('Выберите страну из списка.');
      return;
    }
    const country = countries.find(c => c.code === selectedCountryCode);
    // evaluate predicates
    const results = predicates.map(fn => {
      try { return !!fn({ product: raw, tnved, country }); }
      catch(e) { return false; }
    });

    // Decide which measures apply: if ALL predicates for a measure are true -> apply.
    const measures = [];
    function allTrue(indices) {
      return indices.every(i => results[i] === true);
    }
    if (allTrue([0,1,2])) measures.push('Мера ТТР 1');
    if (allTrue([3,4])) measures.push('Мера ТТР 2');
    if (allTrue([5,6,7])) measures.push('Мера ТТР 3');
    if (allTrue([8,9])) measures.push('Мера ТТР 4');
    if (allTrue([10,11,12,13,14])) measures.push('Мера ТТР 5');
    if (allTrue([15,16,17])) measures.push('Мера ТТР 6');

    result.innerHTML = '<div class="text-sm"><strong>Код ТН ВЭД:</strong> '+tnved+'<br><strong>Страна:</strong> '+country.name+' ('+country.code+')<br><strong>Регион:</strong> '+country.region+'<br><strong>Статус:</strong> <span class="'+(country.friendly? 'text-green-600 font-bold' : 'text-red-600 font-bold')+'">'+(country.friendly? 'Дружественная' : 'Недружественная')+'</span></div>';
    const measuresHtml = measures.length ? measures.map(m => '<div class="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-sm mr-2 mt-2">'+m+'</div>').join('') : '<div class="text-gray-500">Нет применимых мер</div>';
    result.innerHTML += '<div class="mt-3">'+measuresHtml+'</div>';
  }

  checkBtn.addEventListener('click', determineMeasures);
})();
