function ContextMenu() {

	this.items = new Array();

	this.addItem = function(item) {
		this.items.push( {
			"isSimpleItem": true,
			"name": item["name"],
			"action": item.action,
		});
	};

	this.addSubMenu = function(item) {
		this.items.push({
			"isSimpleItem": false,
			"name": item["name"],
			"menu": new ContextMenu(),
		});
		this.items[this.items.length-1]["menu"].setItems(item.items);
	};

	this.removeItemByName = function(name) {
		for (let i = items.length - 1; i > 0; i--) {
			if (this.items[i].name.valueOf() == name.valueOf()) {
				this.items.splice(i, 1);
				break;
			}
		}
	};

	this.setItems = function(items) {
		this.items = new Array();
		for (let i = 0; i < items.length; i++) {
			if (items[i]["name"]) {
				if (items[i].action)
					this.addItem(items[i]);
				else if(items[i].items)
					this.addSubMenu(items[i]);
			}
		}
	};

	this.showMenu = function(event, parent, items) {
		if(items)
			this.setItems(items);

		if(event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;

		this.initMenu(parent);
		this.DOMObj.style.top = (event.clientY+document.body.scrollTop)+"px";
		this.DOMObj.style.left = event.clientX+"px";
		var self = this;
		var hideMenu = function() {
			if (self.DOMObj) {
				self.DOMObj.parentNode.removeChild(self.DOMObj);
			}
			this.onclick = undefined;
			document.removeEventListener("click", hideMenu);
		};
		setTimeout(()=> {
              document.addEventListener("click", hideMenu);
           }, 100);
	};

	this.initMenu = function(parent) {
		if (this.DOMObj && this.DOMObj.parentNode && this.DOMObj.parentNode.removeChild) {
			this.DOMObj.parentNode.removeChild(this.DOMObj);
		}
		var self = this;
		var menu = document.createElement("div");
		menu.className = "context-menu";
		var list = document.createElement("ul");
		menu.appendChild(list);
		for (let i = 0; i < this.items.length; i++) {
			var item = document.createElement("li");
			list.appendChild(item);
			item.setAttribute("data-index",i);
			var name = document.createElement("span");
			name.className = "context-menu-item-name";
			name.textContent = this.items[i]["name"];
			item.appendChild(name);
			if (this.items[i].isSimpleItem) {
				item.onclick = function() {
					let ix = this.getAttribute("data-index");
					self.items[ix].action();
				};
			}
			else {
				let arrow = document.createElement("span");
				arrow.className = "arrow";
				arrow.innerHTML = "&#9658;";
				name.appendChild(arrow);
				this.items[i]["menu"].initMenu(item);
				this.items[i]["menu"].DOMObj.style.display = "none";
				item.onmouseover = function() {
					setTimeout(() => {
						this.getElementsByClassName("context-menu")[0].style.display = "";
					}, 500);
				};
				item.onmouseout = function() {
					setTimeout(() => {
						this.getElementsByClassName("context-menu")[0].style.display = "none";
					}, 500);
				};
			}
		}
		this.DOMObj = menu;
		parent.appendChild(menu);
	};
}