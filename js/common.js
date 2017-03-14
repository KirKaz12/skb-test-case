;(function(){
	var mapData,// Вспомогательный массив для сортировки
		dataSorted,// Вспомогательный массив для сортировки
		dataSortedUnique = [],//Здесь соберутся отсортированные уникальные данные из JSON
		itemList = [],//Массив, который заполнится элементами li с данными из JSON
		city,
		inputs = document.querySelectorAll("input[data-input]"),
		dataCopy = data.slice(); //Копия JSON-массива. Для сортировки

	//Работа с входящим массивом JSON:
	 //Сортировка списка городов по алфавиту и удаление повторяющихся городов
	 mapData = dataCopy.map(function(elem, i) {
	 	return {
	 		index: i,
	 		value: elem["City"].toLowerCase()
	 	}
	 });

	 mapData.sort(function(a, b) {
	 	return +(a.value < b.value) || +(a.value === b.value) - 1;
	 });

	 dataSorted = mapData.map(function(elem) {
	 	return dataCopy[elem.index];
	 });

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

	//Конструктор класса Autocomplete
	function Autocomplete(input) {
		this._input = input;
		this._parent = this._input.parentElement;
		this._container = this._parent.parentElement;
		this._containerChildren = this._container.children;
	}

  //Сеттер свойства, соотвентсвтующего элементу ul - список городов
  Autocomplete.prototype._setList = function() {
  	var list = document.createElement("ul");
  	list.classList.add("data-list");
  	list.setAttribute("data-list", "");
  	this._list = list;
  }

	//Сеттер модификатора ul - спискa городов для открытия вверх при расстоянии в данном случае от низа окна не более 200px
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
	//Метод показа кол-ва элементов при большой выборке
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
	Autocomplete.prototype._setListSmallMode = function() {
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
		var value = this._input.value;
		if( value && !(value[0] === " ") ) 
		{
			for(var i = 0; i < itemList.length; i++) 
			{
				if( itemList[i].innerHTML.toLowerCase()
					.indexOf(value.toLowerCase()) === 0 ) 
				{
					this._list.insertBefore(itemList[i], this._list.firstElementChild);
				}
			}
			this._parent.insertBefore(this._list, this._input.nextSibling);
			this._list.firstElementChild.classList.add("list-item_active");
			this._list.firstElementChild.setAttribute("data-active-item", "");
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
	//Валидация
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
	//Метод добавления счетчика списка городов при кол-ве вариантов > 5
	Autocomplete.prototype._insertCounterItem = function() {
		var counter,
		counterLI,
		cities,
		items = this._container.querySelectorAll("li[data-list-item]");
		[].forEach.call(items, function(i){
			i.style.display = "";
		});

		if( !counterLI && items.length > 5 ) 
		{
			this._list.appendChild(this._counterItem);
			counter = this._container.querySelector("span[data-found-number]"),
			itemsShown = this._container.querySelector("span[data-shown-number]");
			counterLI = this._container.querySelector("li[data-list-counter]");
			counterLI.style.bottom = "0px";
		} 
		if( counterLI )
		{
			cities = items.length;
			counter.innerHTML = cities;
			if( cities > 50 )
			{
				itemsShown.innerHTML = "20";
				[].forEach.call(items, function(i){
					if(i.matches("li[data-list-item]:nth-child(n + 21)")){
						i.style.display = "none";
					}
				}); 
			} else
			{
				[].forEach.call(items, function(i){
					if(i.matches("li[data-list-item]:nth-child(n + 6)")){
						i.style.display = "none";
					}
				});
				itemsShown.innerHTML = "5"; 
			}
		}
	}
	//Метод удаления счетчика списка городов при кол-ве вариантов < 5
	Autocomplete.prototype._deleteCounter = function() {
		var cities = this._container.querySelectorAll(
			"li[data-list-item]"
			),
		list;
		if( cities.length <= 5 ) {
			[].forEach.call(this._list.children, function(i){
				if(i.matches("li[data-list-counter]"))
				{
					i.remove();
				}
			});
		}
	}

	//Метод удаления города из списка при несоответствии введенному значению
	Autocomplete.prototype._deleteItem = function() {
		var cities = this._container.querySelectorAll(
			"li[data-list-item]"
			),
		counterLI = this._container.querySelector("li[data-list-counter]"),
		value = this._input.value;
		for(var i = 0; i < cities.length; i++) 
		{
			if( cities[i].innerHTML.toLowerCase()
				.indexOf(value.toLowerCase()) !== 0 ) 
			{
				cities[i].remove();	
			}
		}
		if( this._list && this._list.children.length >=2 &&
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
	
	//Метод полного очищения списка
	Autocomplete.prototype._clearList = function() {
		while( this._list.firstChild &&
			this._list.firstChild.matches("li[data-list-item]") )
		{
			this._list.removeChild(this._list.firstChild);
			this._list.remove();
		}
		//Подчищаем "Не найдено" и счетчик кол-ва городов
		if( this._list.firstChild &&
			(this._list.firstChild.matches("li[data-not-found]") ||
				this._list.firstChild.matches("li[data-list-counter]")) )
		{
			this._list.removeChild(this._list.firstChild);
			this._list.remove();
		}
		this._list.remove();
	}
	
	//Работа с клавиатурой
	Autocomplete.prototype._keyInteraction = function(e, active){
		var nextActive = active.nextElementSibling;
				prevActive = active.previousElementSibling;
		if(e.keyCode === 40)// Кнопка "вниз"
		{
			if( nextActive && nextActive.matches("li[data-list-item]") && (nextActive.style.display !== "none"))
			{
				console.log("work")
				active.classList.remove("list-item_active");
				active.removeAttribute("data-active-item");
				nextActive.classList.add("list-item_active");
				nextActive.setAttribute("data-active-item", "");
			}
		}
		if(e.keyCode === 27) //Убираем список при нажатии на ESC
			this._clearList();
		if(e.keyCode === 13) //Выбор значения по нажатию на Enter
		{
			this._input.value = active.innerText;
			this._clearList();
		}
			
	}

	//Метод-слушатель keyup
	Autocomplete.prototype._keyupListen = function() {
		var that = this,
				active;
		this._input.addEventListener("keyup", function(e){	
			that._insertItem.call(that);
			that._deleteItem.call(that);
			that._insertCounterItem.call(that);
			that._deleteCounter.call(that);
			that._insertNotFound.call(that);
			that._setListSmallMode.call(that);
			active = that._list.querySelector("li[data-active-item]");
			that._keyInteraction.call(that, e, active);
		});
	}
	
	//Метод-слушатель focus
	Autocomplete.prototype._focusListen = function() {
		var that = this;
		this._input.addEventListener("focus", function(){
			this.select();
			if( this.matches(".city-input_error") )				
				this.classList.remove("city-input_error");	
			if( that._parent.lastChild === that._chooseItem )
				that._parent.removeChild(that._chooseItem);
		});
	}
	//Метод-слушатель blur
	Autocomplete.prototype._blurListen = function() {
		var that = this;
		this._input.addEventListener("blur", function(e) {
			if( that._list.firstElementChild &&
				that._list.firstElementChild.matches("li[data-not-found]") )
			{
				that._insertChooseItem.call(that);
				that._list.removeChild(that._list.firstChild);
				that._list.remove();
			} else if( that._list.children.length === 1 &&
				that._list.firstElementChild.innerHTML ===
				that._input.value ) 
			{
				that._list.removeChild(that._list.firstChild);
				that._list.remove();
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
			//mouswheel event
			this._list.addEventListener("mousewheel", function(e){
				bottom = "-" + (this.scrollTop);
				that._counterItem.style.bottom = bottom + "px";
			});
			//для Mozilla
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

		Autocomplete.prototype._bodyClick = function(){
			var that = this;
			document.body.addEventListener("click", function(e){
				if(e.target.matches("input") && !(e.target === that._input) )
					that._clearList.call(that);
			});
		}
	//Метод для инициализации всех слушателей событий
	Autocomplete.prototype._triggerAllListeners = function() {
		this._keyupListen();
		this._focusListen();
		this._scrollListen();
		this._clickItem();
		this._listScroll();
		this._blurListen();
		this._bodyClick();
	}

	//Метод инициализации
	Autocomplete.prototype.InitAutocomplete = function() {
		this._setAllProperties();
		this._triggerAllListeners();
	}

	//Создаем экземпляры класса с аргуметом input
	inputOnTop = new Autocomplete(inputs[0]);
	inputOnBottom = new Autocomplete(inputs[1]);

	inputOnTop.InitAutocomplete();
	inputOnBottom.InitAutocomplete();
	
})();