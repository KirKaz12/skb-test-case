;(function(){
	//console.log(data[0]);
	var list = document.querySelector(".data-list"),
		nodeItems = list.childNodes,
		mapData,
		itemList = [],
		city = document.querySelector(".list-item"),
		input = document.querySelector("#city"),
		dataCopy = data.slice(0);

	//Сортировка списка городов
	dataCopy.forEach(function(i){
		if(parseInt(i["City"]) && i["City"].length>5) {
			//console.log(i);
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
	  return +(a.value > b.value) || +(a.value === b.value) - 1;
	});
	dataSorted = mapData.map(function(elem) {
		return dataCopy[elem.index]
	});
	
	//Создание списка городов в памяти из отсортированных данных
	dataSorted.forEach(function(i) {
		var listItem = document.createElement("li");
			listItem.classList.add("list-item");
			listItem.innerHTML = i["City"];
			itemList.push(listItem);
	});

	//Функция добавления строки
	function addItem() {
		if(input.value || !(input.value[0]===" ")) {
			for(var i = 0; i<itemList.length; i++) {
				if(itemList[i].innerHTML.toLowerCase().indexOf(input.value) === 0) {
					list.appendChild(itemList[i]);
				}
			}
		} 
	}

	//Функция очищения списка
	function removeItems() {
		while(list.firstChild) {
			list.removeChild(list.firstChild);
		}
	}


	input.addEventListener("keyup", function() {
		addItem();
		for(var k = 0; k<nodeItems.length; k++) {
			if(nodeItems[k].innerHTML.toLowerCase().indexOf(input.value.toLowerCase()) !== 0) {
				list.removeChild(nodeItems[k]);
				
			}
		}

	});
	
	input.addEventListener("focus", function() {
		if(input.value.length) addItem();
		
	});
	input.addEventListener("blur", function(){
		removeItems();
	})
	
	
})();