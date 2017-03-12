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
		listItem.setAttribute("data-list-item", "city-item");
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
		/*for(var i = 0; i < this._containerChildren.length; i++) {
			if( this._containerChildren[i].matches(".data-list") )
			{
				this._list = this._containerChildren[i];
				return;
			}
		}*/
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
		notFound.innerHTML = "Не найдено";
		this._notFound = notFound;
	}

	//Метод показа кол-ва элементов при большой выборке
	Autocomplete.prototype._setCounterItem = function() {
		var counterItem = document.createElement("li");
		counterItem.innerHTML = 
		"Показано <span class='items-shown'>5</span> из <span class='list-length'>0</span> найденных городов. Уточните запрос, чтобы увидеть остальные.";
		counterItem.classList.add("list-counter");
		counterItem.setAttribute("data-list-counter", "");
		this._counterItem = counterItem; 
	}

	//Сеттер свойства, указывающего на элемент c сообщением об ошибке при валидации
	Autocomplete.prototype._setChooseItem = function() {
		var chooseItem = document.createElement("span");
		chooseItem.classList.add("city-notfound");
		chooseItem.innerHTML = "Выберите значение из списка";
		this._chooseItem = chooseItem;
	}

	//Сеттер модификатора на список городов при кол-ве городов меньше или равном 5. Данный модификатор устанавливает отступ снизу = 0, так как счетчик городов в этом случае не показывается
	Autocomplete.prototype._setListSmallMode = function() {
		//this._sibling = this._parent.nextElementSibling;
		//var list = this._sibling.querySelector("ul[data-list]");
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
		var value = this._input.value,
				list;
		this._parent.insertBefore(this._list, this._parent.nextElementSibling);
		/*this._sibling = this._parent.nextElementSibling;
		list = this._sibling.querySelector("ul[data-list]");*/
		if( value && !(value[0] === " ") ) 
		{
			for(var i = 0; i < itemList.length; i++) 
			{
				if( itemList[i].innerHTML.toLowerCase()
					 .indexOf(value.toLowerCase()) === 0 ) 
				{
					
					//this._list.classList.add("data-list_visible");
					this._list.insertBefore(itemList[i], this._list.firstElementChild);
				}
			}
			
		}
	} 

	//Метод добавления "Не найдено" в список при несоответствии запросу 
	Autocomplete.prototype._insertNotFound = function() {
		var value = this._input.value,
				list;
		this._parent.insertBefore(this._list, this._parent.nextElementSibling);
		/*this._sibling = this._parent.nextElementSibling;
		list = this._sibling.querySelector("ul[data-list]");*/
		if( value && this._list.children.length === 0 ) 
		{
			this._list.classList.add("data-list_visible");
			this._list.appendChild(this._notFound);
		}
	}

	//Валидация
	Autocomplete.prototype._insertChooseItem = function() {
		var value = this._input.value,
				list;
		this._parent.insertBefore(this._list, this._parent.nextElementSibling);
		/*this._sibling = this._parent.nextElementSibling;
		list = this._sibling.querySelector("ul[data-list]");*/
		/*if( value && 
					this._list.firstChild &&
					  this._list.firstChild.classList.contains("list-item_error") )*/
			if( value &&
					this._list.firstChild &&
						this._list.firstChild.matches(".list-item_error") )
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
				items = document.querySelectorAll(".list-item");
				
		/*this._parent.insertBefore(this._list, this._parent.nextElementSibling);*/
		/*this._sibling = this._parent.nextElementSibling;
		list = this._sibling.querySelector("ul[data-list]");*/
		if( !counterLI && items.length > 5 ) 
		{
			this._list.appendChild(this._counterItem);
			counter = document.querySelector(".list-length"),
			itemsShown = document.querySelector("span.items-shown");
			counterLI = document.querySelector("li[data-list-counter]");
		} 
		if( counterLI )
		{
			items = document.querySelectorAll(".list-item");
			cities = items.length;
			counter.innerHTML = cities;
			if( cities > 50 )
			{
				itemsShown.innerHTML = "20"; 
			} else
			{
				[].forEach.call(items, function(i){
					if(i.matches("li:nth-child(n + 6)")){
						i.style.display = "none";
					}
				})
				itemsShown.innerHTML = "5"; 
			}
		}

	}

	//Метод удаления счетчика списка городов при кол-ве вариантов < 5
	Autocomplete.prototype._deleteCounter = function() {
		var cities = document.querySelectorAll(
			"li[data-list-item]"
			),
				list;
		/*this._sibling = this._parent.nextElementSibling;
		list = this._sibling.querySelector("ul[data-list]");*/
		if( cities.length <= 5 ) {
			[].forEach.call(this._list.children, function(i){
				/*if( i.classList.contains("list-counter") ) */
				if(i.matches(".list-counter"))
				{
					i.remove();
				}
			});
		}
	}

	//Метод удаления города из списка при несоответствии введенному значению
	Autocomplete.prototype._deleteItem = function() {
		var cities = document.querySelectorAll(
			"li[data-list-item]"
			),
				counterLI = document.querySelector("li[data-list-counter]"),
				value = this._input.value,
				list;
		/*this._sibling = this._parent.nextElementSibling;
		list = this._sibling.querySelector("ul[data-list]");*/
		for(var i = 0; i < cities.length; i++) 
		{
			if( cities[i].innerHTML.toLowerCase()
					.indexOf(value.toLowerCase()) !== 0 ) 
			{
				cities[i].remove();	
			}
		}
		/*if( this._list.children.length >=2 && 
					this._list.lastChild.classList
					.contains("list-item_error") )*/
		if( this._list && this._list.children.length >=2 &&
				this._list.lastChild.matches(".list-item_error") )
		{
			this._list.removeChild(this._list.lastChild);
			//list.remove();
		}
	}

	//Метод выбора значение элемента по клику и последующего скрытия списка
	Autocomplete.prototype._clickItem = function() {
		var that = this;
		this._list.addEventListener("click", function(e) {
			if( e.target.nodeName === "LI" && 
						e.target.matches(".list-item") )
			{
				that._input.value = e.target.innerHTML;
				that._clearList.call(that);
			}
		});
	}
	
	//Метод очищения списка
	Autocomplete.prototype._clearList = function() {
		/*while( this._list.firstChild && 
						this._list.firstChild.classList
						.contains("list-item") ) */
		/*this._sibling = this._parent.nextElementSibling;
		var list = this._sibling.querySelector("ul[data-list]");*/
		while( this._list.firstChild &&
						this._list.firstChild.matches(".list-item") )
		{
			this._list.removeChild(this._list.firstChild);
			this._list.remove();
		}
		//Подчищаем "Не найдено" и счетчик большого кол-ва городов
		/*if( this._list.firstChild && 
				(this._list.firstChild.classList
				.contains("list-item_error") || 
					this._list.firstChild.classList
					.contains("list-counter")) ) */
		if( this._list.firstChild &&
					(this._list.firstChild.matches(".list-item_error") ||
					 		this._list.firstChild.matches(".list-counter")) )
		{
			this._list.removeChild(this._list.firstChild);
			this._list.remove();
		}
		this._list.remove();
	}
	
	//Метод-слушатель keyup
	Autocomplete.prototype._keyupListen = function() {
		var that = this;
		this._input.addEventListener("keyup", function(){
			var	end,
				time,
				start = performance.now();
			
			that._insertItem.call(that);
			that._deleteItem.call(that);
			that._insertCounterItem.call(that);
			end = performance.now();
			time = end - start;
			console.log(time);
			that._deleteCounter.call(that);
			that._insertNotFound.call(that);
			that._setListSmallMode.call(that);
			if( !(this.value.length) ) 
			{
				that._clearList.call(that);
			}
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
		//that._sibling = that._parent.nextElementSibling;
		this._input.addEventListener("blur", function(e) {
			/*that._list.addEventListener("click", function(){
				e.scrollTopPropagation();
				console.log("lll")
			});*/
				
			
			//that._clearList();
			
			//var list = that._sibling.querySelector("ul[data-list]");
			if( that._list.firstElementChild &&
						that._list.firstElementChild.matches(".list-item_error") )
			{
				//list.classList.remove("data-list_visible");
				that._list.removeChild(that._list.firstChild);
				that._list.remove();
				that._insertChooseItem.call(that);
			} else if( that._list.children.length === 1 &&
										 that._list.firstElementChild.innerHTML ===
											 that._input.value ) 
			{
				console.log("blurrrr")
				//list.classList.remove("data-list_visible");
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

	//Метод для инициализации всех слушателей событий
	Autocomplete.prototype._triggerAllListeners = function() {
		this._keyupListen();
		this._focusListen();
		this._blurListen();
		this._scrollListen();
		this._clickItem();
		this._listScroll();
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