;(function(){

	var list = document.querySelector(".data-list"),
		container = document.querySelectorAll(".data-container"),
		nodeItems = list.childNodes,
		mapData,
		itemList = [],
		city,
		input = document.querySelector("#city"),
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
	

	//Удаление одинаковых эелементов


	//Создание списка городов в памяти из отсортированных данных
	dataSorted.forEach(function(i) {
		var listItem = document.createElement("li");
			listItem.classList.add("list-item");
			listItem.innerHTML = i["City"];
			itemList.push(listItem);
			listItem = null;
	});

	//Функция добавления элемента в список
	function addItem() {
		if(input.value || !(input.value[0]===" ")) {
			for(var i = 0; i<itemList.length; i++) {
				if(itemList[i].innerText.toLowerCase().indexOf(input.value.toLowerCase()) === 0) {
					list.insertBefore(itemList[i], list.firstChild);
				}
			}
		}
		if(list.lastChild && list.lastChild.classList.contains("list-item_error"))  {
			list.removeChild(list.lastChild);
		}
	}

	//Функция очищения списка
	function removeItems() {
		while(list.firstChild && list.firstChild.classList.contains("list-item")) {
			list.removeChild(list.firstChild);
		}
	}

	input.addEventListener("keyup", function() {
		var notFound = document.createElement("li");
		notFound.classList.add("list-item_error");
		notFound.innerText = "Не найдено";
		addItem();
		city = document.querySelectorAll(".list-item");
		for(var k = 0; k < city.length; k++) {
			if(city[k].innerHTML.toLowerCase().indexOf(this.value.toLowerCase()) !== 0) {
				city[k].remove();	
			}
		}
		if(!(input.value.length)) {
			removeItems();
			if(list.firstChild) list.removeChild(list.firstChild);
		} 
		if(input.value.length && list.children.length === 0) {
			list.appendChild(notFound);
			notFound = null;
		}
	});
	
	input.addEventListener("focus", function() {
		if(input.value.length) addItem();
		
	});

	list.addEventListener("click", function(e){
		input.value = e.target.innerText;
		removeItems();
	});

	//Проверка расстояния от контейнера с input до нижнего края окна
	container.forEach(function(i){
		var offset = window.innerHeight - i.clientHeight - i.offsetTop,
			childList = i.childNodes;

		if(offset <= 200) {//Добавление модификатора автокомплиту с открытием  вверх при отступе снизу 200px и менее
			childList.forEach(function(i){
				if(i.classList && i.classList.contains("data-list")){
					i.classList.add("data-list__up");

				}
			})
			//i.classList.add("data-list__up");
		}
	});
	
})();