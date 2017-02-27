(function(){

	var mapData,
			dataSorted,
			itemList = [],//Массив, который заполнится элементами li с данными из JSON
			city,
			inputs = document.querySelectorAll(".city-input"),
			dataCopy = data.slice(0);
	
	//Сортировка списка городов по алфавиту
	dataCopy.forEach(function(i){
		if(parseInt(i["City"]) && i["City"].length > 5) {
			i["City"] = i["City"].slice(i["City"].indexOf("км")+2) + ", " + i["City"].slice(0, i["City"].indexOf("км")+2);
		}
	});
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
		return dataCopy[elem.index]
	});
	
	//добавление в массив itemList элементаов li с названиями городов в памяти из отсортированных данных
	dataSorted.forEach(function(i) {
		var listItem = document.createElement("li");
		listItem.classList.add("list-item");
		listItem.innerHTML = i["City"];
		itemList.push(listItem);
		listItem = null;
	});

	//Конструктор класса Autocomplete
	function Autocomplete(input) {
		this._input = input;
		this._parent = this._input.parentNode;
		this._container = this._parent.parentNode;
		this._containerChildren = this._container.childNodes;
	}
  
  //Сеттер свойства, указывающего на элемент ul - список городов
	Autocomplete.prototype._setList = function() {
		for(var i = 0; i < this._containerChildren.length; i++) {
			if(this._containerChildren[i].classList && 
				this._containerChildren[i].classList.contains("data-list")) 
			{
				this._list = this._containerChildren[i];
				return;
			}
		}
	}
	
	//Сеттер модификатора списку городов для открытия вверх при расстоянии в данном случае от низа окна не более 200px
	Autocomplete.prototype._setListUp = function() {
		var offset = window.innerHeight - this._container.clientHeight - this._container.offsetTop;
		if(offset <= 200)
			this._list.classList.add("data-list__up");
	}

	//Сеттер свойства, указывающего на элемент списка с сообщением "Не найдено"
	Autocomplete.prototype._setNotFound = function() {
		var notFound = document.createElement("li");
		notFound.classList.add("list-item_error");
		notFound.innerText = "Не найдено";
		this._notFound = notFound;
	}

	//Сеттер свойства, указывающего на элемент c сообщением об ошибке при валидации
	Autocomplete.prototype._setChooseItem = function() {
		var chooseItem = document.createElement("span");
		chooseItem.classList.add("city-notfound");
		chooseItem.innerText = "Выберите значение из списка";
		this._chooseItem = chooseItem;
	}

	//Общий сеттер для всех свойств
	Autocomplete.prototype._setAllProperties = function() {
		this._setList();
		this._setListUp();
		this._setNotFound();
		this._setChooseItem();
	}

	//Метод добавления города в список при соответствии запросу
	Autocomplete.prototype._insertItem = function() {
		var value = this._input.value;
		if( value && !(value[0] === " ") ) {
			for(var i = 0; i < itemList.length; i++) {
				if( itemList[i].innerText.toLowerCase()
					 .indexOf(value.toLowerCase() ) === 0) 
				{
					this._list.insertBefore(itemList[i], this._list.firstChild);
				}
			}
		}
	} 

	//Метод добавления "Не найдено" в список при несоответствии запросу 
	Autocomplete.prototype._insertNotFound = function() {
		var value = this._input.value;
		if(value && this._list.children.length === 0) 
		{
			this._list.appendChild(this._notFound);
		}
	}

	//Валидация
	Autocomplete.prototype._insertChooseItem = function() {
		var value = this._input.value;
		if( value && 
			  this._list.firstChild.classList.contains("list-item_error") )
		{
			this._input.classList.add("city-input_error");
			this._parent.appendChild(this._chooseItem);
		}
	}

	//Метод удаления города из списка при несоответствии введенному значению
	Autocomplete.prototype._deleteItem = function() {
		var cities = document.querySelectorAll(".list-item"),
				value = this._input.value;
		for(var i = 0; i < cities.length; i++) 
		{
			if( cities[i].innerText.toLowerCase()
				.indexOf(value.toLowerCase() ) !== 0) 
			{
				cities[i].remove();	
			}
		}
		if( this._list.children.length >=2 && 
				this._list.lastChild.classList
				.contains("list-item_error") )
		{
			this._list.removeChild(this._list.lastChild);
		}
	}
	
	//Метод очищения списка
	Autocomplete.prototype._clearList = function() {
		while( this._list.firstChild && 
					this._list.firstChild.classList
					.contains("list-item") ) 
		{
			this._list.removeChild(this._list.firstChild);
		}
		//Подчищаем "Не найдено"
		if( this._list.firstChild && 
			this._list.firstChild.classList
			.contains("list-item_error") ) 
		{
			this._list.removeChild(this._list.firstChild);
		}
	}
	
	//Метод-слушатель keyup
	Autocomplete.prototype._keyupListen = function() {
		var that = this;
		this._input.addEventListener("keyup", function(){
			that._insertItem.call(that);
			that._deleteItem.call(that);
			if( !(this.value.length) ) {
				that._clearList.call(that);
			}
			that._insertNotFound.call(that);
		});
	}
	
	//Метод-слушатель focus
	Autocomplete.prototype._focusListen = function() {
		var that = this;
		this._input.addEventListener("focus", function(){
			if( this.value.length ) 
				that._insertItem.call(that);
			this.classList.remove("city-input_error");
			if(that._parent.lastChild === that._chooseItem)
				that._parent.removeChild(that._chooseItem);
		});
	}
	
	//Метод-слушатель blur
	Autocomplete.prototype._blurListen = function() {
		var that = this;
		this._input.addEventListener("blur", function() {
			that._insertChooseItem.call(that);
			if( that._list.firstChild &&
					that._list.firstChild.classList
					.contains("list-item_error")) 
			{
				that._list.removeChild(that._list.firstChild);
			}
		});
	}
	//Общий метод для инициализации всех слушателей событий
	Autocomplete.prototype._triggerAllListeners = function() {
		this._keyupListen();
		this._focusListen();
		this._blurListen();
	}
	//Метод инициализации экземпляра класса
	Autocomplete.prototype.initAutocomplete = function() {
		this._setAllProperties();
		this._triggerAllListeners();
	}
	Autocomplete.prototype.check = function() {
		//console.log(this._chooseItem);
	}

	
	inputOnTop = new Autocomplete(inputs[0]);
	inputOnBottom = new Autocomplete(inputs[1]);

	inputOnTop.initAutocomplete();
	inputOnBottom.initAutocomplete();

	inputOnTop.check();
	inputOnBottom.check();

	//Функция добавления элемента в список
	

	//Функция очищения списка


	//Проверка расстояния от контейнера с input до нижнего края окна
	
	
})();