;(function(){

	var mapData,// Вспомогательный массив для сортировки
		dataSorted,// Вспомогательный массив для сортировки
		dataSortedUnique = [],//Здесь соберутся отсортированные уникальные данные из JSON
		itemList = [],//Массив, который заполнится элементами li с данными из JSON
		inputs = document.querySelectorAll("input[data-input]"),
		dataCopy = data.slice(); //Копия JSON-массива. Для сортировки


	// ========== Сортировка входящего массива JSON ==========

	 mapData = dataCopy.map(function(elem, i) {
	 	return {
	 		index: i,
	 		value: elem["City"].toLowerCase()
	 	}
	 });
	 //Сортировка по алфавиту
	 mapData.sort(function(a, b) {
	 	return +(a.value < b.value) || +(a.value === b.value) - 1;
	 });

	 dataSorted = mapData.map(function(elem) {
	 	return dataCopy[elem.index];
	 });
	 //Добавление в вспомогательный массив данных с сортировкой повторяющихся названий, а также бессмысленных значений типа "34км" и "36км"
	for(var i = 0; i<dataSorted.length; i++) {
	 	if( (dataSorted[i]["City"].slice(-2) !== "км") && 
	 		dataSorted[i+1] &&
	 		(dataSorted[i]["City"] !== dataSorted[i+1]["City"]) ) 
	 	{
	 		dataSortedUnique.push( dataSorted[i] );
	 	}
	}
	//Убираем вспомогательные массивы, в том числе data из global scope
	data = dataCopy = mapData = dataSorted = null;
	
	//Добавление в массив itemList элементов li с названиями городов из отсортированных данных
	dataSortedUnique.forEach(function(i) {
		var listItem = document.createElement("li");
		listItem.classList.add("list-item");
		listItem.setAttribute("data-list-item", "");
		listItem.innerHTML = i["City"];
		itemList.push(listItem);
		listItem = null;
	});
	//Убираем вспомогательный массив
	dataSortedUnique = null;


	// ========== Конструктор класса Autocomplete ==========

	function Autocomplete(input) {
		this._input = input; //Входящий input
		this._parent = this._input.parentElement; //Родитель
		this._container = this._parent.parentElement; //Контейнер
		this._controlKeys = [9, 13, 27, 38, 40];//Коды кнопок, задействованных в управлении с клавиатуры 
	}


//  ========== Добавление в прототип методов и свойств ==========
  

  //Сеттер свойства, соответсвтующего элементу ul - списку городов
  Autocomplete.prototype._setList = function() {
  	var list = document.createElement("ul");
  	list.classList.add("data-list");
  	list.setAttribute("data-list", "");
  	this._list = list;
  }

	//Сеттер модификатора списка, который делает его открывающимся вверх при расстоянии в данном случае от низа окна не более 200px
	Autocomplete.prototype._setListUp = function() {
		var offset = window.innerHeight - this._container.clientHeight - this._container.offsetTop;
		if( offset <= 200 )
			this._list.classList.add("data-list__up");
	}

	//Сеттер свойства, указывающего на элемент списка с сообщением "Не найдено"
	Autocomplete.prototype._setNotFound = function() {
		var notFound = document.createElement("li");
		notFound.classList.add("list-item_error");
		notFound.setAttribute("data-not-found", "");
		notFound.innerHTML = "Не найдено";
		this._notFound = notFound;
	}

	//Сеттер свойства, указывающего на элемент "счетчик" отсортированных городов. Показывает кол-во найденных и показанных городов внизу списка
	Autocomplete.prototype._setCounterItem = function() {
		var counterItem = document.createElement("li");
		counterItem.innerHTML = 
		"Показано <span class='items-shown' data-shown-number></span> из <span class='list-length' data-found-number></span> найденных городов. Уточните запрос, чтобы увидеть остальные.";
		counterItem.classList.add("list-counter");
		counterItem.setAttribute("data-list-counter", "");
		this._counterItem = counterItem; 
	}

	//Сеттер свойства, указывающего на элемент c сообщением об ошибке при валидации
	Autocomplete.prototype._setChooseItem = function() {
		var chooseItem = document.createElement("span");
		chooseItem.classList.add("choose-city");
		chooseItem.setAttribute("data-choose-city", "");
		chooseItem.innerHTML = "Выберите значение из списка";
		this._chooseItem = chooseItem;
	}

	//Сеттер модификатора на список городов при кол-ве городов меньше или равном 5. Данный модификатор устанавливает отступ снизу = 0, так как счетчик городов в этом случае не показывается
	Autocomplete.prototype._setListSmall = function() {
		if(this._list && this._list.children.length <= 5) {
			this._list.classList.add("data-list__small");
		} else {
			if(this._list)
				this._list.classList.remove("data-list__small");
		}
	}

	//Общий сеттер для всех свойств
	Autocomplete.prototype._setAllProperties = function() {
		this._setList();
		this._setListUp();
		this._setNotFound();
		this._setChooseItem();
		this._setCounterItem();
	}

	//Метод добавления города в список при соответствии запросу
	Autocomplete.prototype._insertItem = function() {
		var that = this,
				value = this._input.value,
				items;
		if( value && value[0] !== " " ) 
		{
			//Заполняем список
			for(var i = 0; i < itemList.length; i++) 
			{
				if( itemList[i].innerHTML.toLowerCase()
					.indexOf(value.toLowerCase()) === 0 ) 
				{
					this._list.insertBefore(itemList[i], this._list.firstElementChild);
				} 
			}
			//Отменяем метод при отсутствии совпадений
			if(!this._list.firstElementChild) return;
			
			items = this._list.children;
			[].forEach.call(items, function(i){				
			//Проверяем наличие активных элементов списка
			if( i.matches("li[data-active-item]") ) 
				//Удаляем соответствующий модификатор и атрибут во избежание размножения активных элементов при следующих итерациях 
				that._deactivateItem(i);
			});
			//Делаем первый элемент активным по умолчанию
			if( this._list.firstElementChild
					.matches("li[data-list-item]") )
			{
				this._activateItem(this._list.firstElementChild);
			}
			//Вставляем сформированный список в DOM
			this._parent.insertBefore(this._list, this._input.nextSibling);
		}
	} 

	//Метод добавления "Не найдено" в список при несоответствии запросу 
	Autocomplete.prototype._insertNotFound = function() {
		var value = this._input.value;
		if( value && this._list.children.length === 0 ) 
		{
			this._list.appendChild(this._notFound);
			this._parent.insertBefore(this._list, this._input.nextSibling);
		}
	}

	//Валидация. Вызывается при потере фокуса
	Autocomplete.prototype._insertChooseItem = function() {
		var value = this._input.value;
		if( value &&
			this._list.firstElementChild.matches("li[data-not-found]") )
		{
			this._input.classList.add("city-input_error");
			this._parent.appendChild(this._chooseItem);
			this._list.remove();
		}
	}

	//Метод добавления элемента списка - "счетчика" найденных городов при кол-ве вариантов > 5
	Autocomplete.prototype._insertCounterItem = function() {
		var counter,
		counterLI,
		cities,
		items = this._container.querySelectorAll("li[data-list-item]");
		
		//Делаем все элементы видимыми по умолчанию
		[].forEach.call(items, function(i){
			i.style.display = "";
		});

		if( !counterLI && items.length > 5 ) 
		{
			this._list.appendChild(this._counterItem);
			//Количество найденных городов
			counter = this._container.querySelector("span[data-found-number]"),
			//Количество показанных в списке городов
			itemsShown = this._container.querySelector("span[data-shown-number]");
			//Элемент - счетчик
			counterLI = this._container.querySelector("li[data-list-counter]");
			counterLI.style.bottom = "0px";
		} 
		if( counterLI )
		{
			[].forEach.call(items, function(i){
				//Проверка числа найденных городов
				if( items.length > 50 )
				{
					//Показываем 20 городов при числе найденных > 50
					if( i.matches("li[data-list-item]:nth-child(n + 20)") )
						i.style.display = "none";
				} else {
					//Показываем 5 городов при числе найденных < 50
					if( i.matches("li[data-list-item]:nth-child(n + 6)") )
						i.style.display = "none";
				}
			});
			//Вставляем информацию о найденных городах
			cities = items.length;
			counter.innerHTML = cities;
			cities > 50 ? itemsShown.innerHTML = "20" 
									: itemsShown.innerHTML = "5"
		}
	}

	//Метод удаления счетчика списка городов при кол-ве вариантов < 5
	Autocomplete.prototype._deleteCounter = function() {
		var cities = this._list.querySelectorAll("li[data-list-item]");
		if( cities.length <= 5 ) {
			[].forEach.call(this._list.children, function(i){
				if(i.matches("li[data-list-counter]"))
				{
					i.remove();
				}
			});
		}
	}

	//Метод удаления города из списка при несоответствии началу введенного значения
	Autocomplete.prototype._deleteItem = function() {
		var cities = this._list.querySelectorAll(
			"li[data-list-item]"
			),
		counterLI = this._list.querySelector("li[data-list-counter]"),
		value = this._input.value;
		for(var i = 0; i < cities.length; i++) 
		{
			if( cities[i].innerHTML.toLowerCase()
				.indexOf(value.toLowerCase()) !== 0 ) 
			{
				cities[i].remove();	
			}
		}
		//Удаление элемента с текстом "Не найдено" при хотя бы одном совпадении
		if( this._list.children.length >= 2 &&
			this._list.lastChild.matches("li[data-not-found]") )
		{
			this._list.removeChild(this._list.lastChild);
		}
	}

	//Метод выбора значение элемента по клику и последующего скрытия списка
	Autocomplete.prototype._clickItem = function() {
		var that = this;
		this._list.addEventListener("click", function(e) {
			if( e.target.nodeName === "LI" && 
				e.target.matches("li[data-list-item]") )
			{
				that._input.value = e.target.innerHTML;
				that._clearList.call(that);
			}
		});
	}

 //Mетод "активации" элемента
	Autocomplete.prototype._activateItem = function(elem) {
		if(elem.matches("li[data-list-item]"))
		{
			elem.classList.add("list-item_active");
			elem.setAttribute("data-active-item", "");
		}
	}
	
	//Mетод "деактивации" элемента
	Autocomplete.prototype._deactivateItem = function(elem) {
		elem.classList.remove("list-item_active");
		elem.removeAttribute("data-active-item");
	}

	//Метод полного очищения списка и удаления из DOM
	Autocomplete.prototype._clearList = function() {
		while( this._list.firstChild )
		{
			this._list.removeChild(this._list.firstChild);
		}
		//Удаление из DOM
		this._list.remove();
	}
	
	//Управление выбором с клавиатуры
	Autocomplete.prototype._keyInteraction = function(e){
		var active = this._list.querySelector("li[data-active-item]"),
				nextActive = active.nextElementSibling,//нижний сосед активного элемента
				prevActive = active.previousElementSibling;//верхний сосед активного элемента
		switch (e.keyCode) {
			case 40://Стрелка вниз
				if( nextActive && nextActive.matches("li[data-list-item]") && (nextActive.style.display !== "none") )
				{
					//Скролим список вниз при достижении последнего видимого элемента
					if( active.offsetTop >= 360 )
					{
						this._list.scrollTop += active.clientHeight;
					}
					//Меняем активный элемент
					this._activateItem(nextActive);
					this._deactivateItem(active);
				}
				break;
			case 38://Стрелка вверх
				if( prevActive && prevActive.matches("li[data-list-item]") )
				{
					//Скролим вверх при достижении верхнего элемента
					if( this._list.scrollTop !== 0 &&
							( this._list.scrollTop > active.offsetTop ||
								this._list.scrollTop > prevActive.offsetTop))
					{
						this._list.scrollTop -= active.clientHeight;
					}
					//Меняем активный элемент
					this._activateItem(prevActive);
					this._deactivateItem(active);
				}
				break;
			case 27://Esc. Убираем список
				this._clearList();
				break;
			case 13://Enter - выбор активного элемента списка
				this._input.value = active.innerText;
				this._clearList();
				break;
			case 9: //Нажатие TAB - переход к следующему контролу, очищаем текущий
				this._clearList();
				break;
		}		
	}

	//Метод формирования списка
	Autocomplete.prototype._createList = function() {
		this._insertItem();
		this._deleteItem();
		this._insertCounterItem();
		this._deleteCounter();
		this._insertNotFound();
		this._setListSmall();
	}

	//Метод-слушатель keyup
	Autocomplete.prototype._keyupListen = function() {
		var that = this;
		this._input.addEventListener("keyup", function(e){
			//Если не нажата управляющая кнопка 
			if( that._controlKeys.indexOf(e.keyCode) === -1)	
			{
				//Формируем список
				that._createList.call(that);
			}
			//Убираем список если поле ввода становится пустым
			if( !this.value ) {
				that._clearList();
			}			
		});
	}
	
	//Метод - слушатель keydown для управления с клавиатуры
	Autocomplete.prototype._keyDown = function() {
		var that = this;
		this._input.addEventListener("keydown", function(e){
			//Проверка нажатия управляющей кнопки
			if( that._controlKeys.indexOf(e.keyCode) !== -1)
			{
				if( that._list.firstChild && 
							that._list.firstChild.
							matches("li[data-list-item]") )
					//Запуск метода с текущим аргументом события "е"
					that._keyInteraction.call(that, e);
			}
		});
	}

	//Метод-слушатель focus
	Autocomplete.prototype._focusListen = function() {
		var that = this;
		this._input.addEventListener("focus", function(){
			this.select();
			//Удаляем модификатор error c input
			if( this.matches(".city-input_error") )				
				this.classList.remove("city-input_error");	
			//Удаляем сообщение об ошибке валидации
			if( that._parent.lastChild === that._chooseItem )
				that._parent.removeChild(that._chooseItem);
			//Формируем список
			that._createList.call(that);
		});
	}

	//Метод-слушатель blur
	Autocomplete.prototype._blurListen = function() {
		var that = this;
		this._input.addEventListener("blur", function(e) {
			if( that._list.firstElementChild &&
				that._list.firstElementChild.matches("li[data-not-found]") )
			{
				//Запускаем валидацию при потере фокуса
				that._insertChooseItem.call(that);
				that._clearList();
			} 
				//Убираем список при полном совпадении
				else if( that._list.children.length === 1 &&
				that._list.firstElementChild.innerHTML ===
				that._input.value ) 
			{
				that._clearList();
			} 
				//Если найдено одно совпадение, выбираем его
				else if ( that._list.children.length === 1 &&
				that._list.firstElementChild.innerHTML.toLowerCase() ===
				that._input.value.toLowerCase() )
			{
				that._input.value = that._list.firstElementChild.innerHTML;
				that._clearList();
			}
		});
	}

	//Метод отмены прокрутки страницы при окончании прокрутки списка
	Autocomplete.prototype._scrollListen = function() {
		var delta,
		isFirefox = (navigator.userAgent.indexOf("Gecko") !== -1);
		this._list.addEventListener("mousewheel", function(e) {
			delta = e.wheelDelta;
			this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
			e.preventDefault();
		});
			//Для Mozilla
			if(isFirefox) 
			{
				this._list.addEventListener("DOMMouseScroll", function(e) {
					delta = -e.detail;
					this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
					e.preventDefault();
				});
			}
		}

	//Фиксация счетчика городов внизу при прокрутке списка
	Autocomplete.prototype._listScroll = function() {
		var that = this,
		bottom,
		isFirefox = (navigator.userAgent.indexOf("Gecko") !== -1);
			//Для mouswheel события
			this._list.addEventListener("mousewheel", function(e){

				//Определяем насколько изменим свойство bottom в зависимоти от величины прокрутки списка
				bottom = "-" + (this.scrollTop);
				//Изменяем свойство
				that._counterItem.style.bottom = bottom + "px";
			});
			
			//DOMMouseScroll - для Mozilla
			if(isFirefox) 
			{
				this._list.addEventListener("DOMMouseScroll", function(e) {
					bottom = "-" + (this.scrollTop);
					that._counterItem.style.bottom = bottom + "px";
				});
			}
			//То же самое для scroll event
			this._list.addEventListener("scroll", function(){
				bottom = "-" + (this.scrollTop);
				that._counterItem.style.bottom = bottom + "px";
			}); 
		}

	//Метод очищения списка при фокусе на любой другой input на странице
	Autocomplete.prototype._bodyClick = function(){
		var that = this;
		document.body.addEventListener("click", function(e){
			if(e.target.matches("input") && !(e.target === that._input) )
				that._clearList.call(that);
		});
	}

	//Метод - слушатель mouseover 
	Autocomplete.prototype._mouseEnter = function() {
		var that = this,
				cities;
		this._list.addEventListener("mouseover", function(e){
			cities = that._list.children;
			//Проверка наведения на город в списке
			if(e.target.matches("li[data-list-item]")) {
				//Убираем существующий активный элемент
				[].forEach.call(cities, function(i){
					if(i.matches("li[data-active-item]"))
					{
						that._deactivateItem(i);
					}
				});
				//Активируем наведенный элемент
				that._activateItem(e.target);
			}
		});
	}

	//Метод для инициализации всех слушателей событий
	Autocomplete.prototype._triggerAllListeners = function() {
		this._keyupListen();
		this._keyDown();
		this._focusListen();
		this._scrollListen();
		this._clickItem();
		this._listScroll();
		this._blurListen();
		this._bodyClick();
		this._mouseEnter();
	}

	//Метод инициализации
	Autocomplete.prototype.InitAutocomplete = function() {
		this._setAllProperties();
		this._triggerAllListeners();
	}

	//Создаем экземпляры класса с аргуметом input
	inputOnTop = new Autocomplete(inputs[0]);
	inputOnBottom = new Autocomplete(inputs[1]);
	//Инициализируем
	inputOnTop.InitAutocomplete();
	inputOnBottom.InitAutocomplete();

})();
