;(function(){

	var //list = document.querySelector(".data-list"),
		//container = document.querySelectorAll(".data-container"),
		//nodeItems = list.childNodes,
		mapData,
		dataSorted,
		itemList = [],//Массив, который заполнится данными из JSON
		city,
		//input = document.querySelector("#city"),
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
	})
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

	//Конструктор Autocomplete
	function Autocomplete(input) {
		this._input = input;
		this._container = input.parentNode.parentNode;
		this._containerChildren = this._container.childNodes;
	}

	Autocomplete.prototype.setList = function() {
		for(var i = 0; i < this._containerChildren.length; i++) {
			if(this._containerChildren[i].classList && 
				this._containerChildren[i].classList.contains("data-list")) 
			{
				this._list = this._containerChildren[i];
				return;
			}
		}
	}

	Autocomplete.prototype.setNotFound = function() {
		var notFound = document.createElement("li");
		notFound.classList.add("list-item_error");
		notFound.innerText = "Не найдено";
		this._notFound = notFound;
	}

	Autocomplete.prototype.insertItem = function() {
		var value = this._input.value;
		if( value && !(value[0] === " ") ) {
			for(var i = 0; i < itemList.length; i++) {
				if(itemList[i].innerText.toLowerCase()
					.indexOf(value.toLowerCase()) === 0) 
				{
					this._list.insertBefore(itemList[i], this._list.firstChild);
				}
			}
		}
	} 

	Autocomplete.prototype.insertNotFound = function() {
		var value = this._input.value;
		if(value && this._list.children.length === 0) {
			this._list.appendChild(this._notFound);
		}
	}

	Autocomplete.prototype.deleteItem = function() {
		var cities = document.querySelectorAll(".list-item"),
				value = this._input.value;
		for(var i = 0; i < cities.length; i++) {
			if( cities[i].innerText.toLowerCase()
				.indexOf(value.toLowerCase() ) !== 0) 
			{
				cities[i].remove();	
			}
		}
	}
	
	Autocomplete.prototype.clearList = function() {
		while(this._list.firstChild && this._list.firstChild.classList.contains("list-item")) {
			this._list.removeChild(this._list.firstChild);
		}
		//Подчищаем "Не найдено"
		if(this._list.firstChild.classList.contains("list-item_error"))
			this._list.removeChild(this._list.firstChild);
	}

	Autocomplete.prototype.keyupListen = function() {
		var that = this;
		this._input.addEventListener("keyup", function(){
			Autocomplete.prototype.insertItem.call(that);
			Autocomplete.prototype.insertNotFound.call(that);
			Autocomplete.prototype.deleteItem.call(that);
			if( !(this.value.length) ) {
				Autocomplete.prototype.clearList.call(that);
			}
		})
	}

	Autocomplete.prototype.focusListen = function() {
		var that = this;
		this._input.addEventListener("focus", function(){
			if( this.value.length ) 
				Autocomplete.prototype.insertItem.call(that);
		})
	}

	Autocomplete.prototype.check = function() {
		//console.log(this._notFound);
	}

	
	inputOnTop = new Autocomplete(inputs[0]);
	inputOnBottom = new Autocomplete(inputs[1]);

	inputOnTop.setList();
	inputOnBottom.setList();

	inputOnTop.setNotFound();
	inputOnBottom.setNotFound();

	inputOnTop.keyupListen();
	inputOnBottom.keyupListen();

	inputOnTop.focusListen();
	inputOnBottom.focusListen();
	

	inputOnTop.check();
	inputOnBottom.check();

	


	

	//Функция добавления элемента в список
	

	//Функция очищения списка
	

	
	
	

	

	//Проверка расстояния от контейнера с input до нижнего края окна
	
	
})();