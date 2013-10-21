/*jshint bitwise:true, noarg:true, noempty:true, nonew:true, undef:true, browser:true */

(function(window){
	var STYLE =
		"#stateside-ctr{position:fixed;right:-180px;top:0;width:200px;background:rgba(32,32,32,0.7);opacity:0.5}" +
		"#stateside-ctr:hover{right:0px;opacity:1}" +
		"#stateside-sel{background:transparent;font:8pt/10pt sans-serif;width:100%;color:#FFF;border:none}";
	var document = window.document;
	var body = document.body;


	function prepareStates() {
		var states = {};
		var n = 0;
		var STATESIDE = window.STATESIDE || null;
		if(!STATESIDE) return null;

		for(var key in STATESIDE) {
			key = key.replace(/[/]+/g, '/');
			var val = STATESIDE[key];
			var path = key.split("/");
			var parent = path.slice(0, path.length - 1).join("/") || "/";
			states[key] = {state: val, parentName: (key != "/" ? parent : null)};
			n++;
		}
		if(!n) return null;
		return states;
	}

	function activateSelectorState(el, selectorState) {
		if(selectorState === "show") selectorState = {"$visible": true};
		if(selectorState === "hide") selectorState = {"$visible": false};
		for(var key in selectorState) {
			var val = selectorState[key];
			switch(key) {
				case "$visible": el.style.display = (val ? "" : "none"); break;
				default: if(val) el.classList.add(key); else el.classList.remove(key); break;
			}
		}
	}

	function transitionToState(stateName) {
		var state = states[stateName];
		if(!state) return;
		if(state.parentName) transitionToState(state.parentName);
		var selVals = state.state || {};
		for(var selector in selVals) {
			var selectorState = selVals[selector];
			[].forEach.call(document.querySelectorAll(selector), function(el) {
				activateSelectorState(el, selectorState);
			});
		}
	}

	function prepareUI(states) {
		function makeElement(tag, props) {
			var el = document.createElement(tag);
			for(var key in (props || {})) {
				el[key] = props[key];
			}
			return el;
		}

		var ctr = makeElement("div", {id: "stateside-ctr"});
		body.appendChild(ctr);
		var sel = makeElement("select", {id: "stateside-sel", size: 10});
		ctr.appendChild(sel);
		body.appendChild(makeElement("style", {innerHTML: STYLE}));
		var last = window.sessionStorage.STATESIDE_LAST || null;

		for(var key in states) {
			sel.appendChild(makeElement("option", {value: key, innerHTML: key, selected: (last == key)}));
		}
		transitionToState(last);
		sel.addEventListener("change", function() {
			var newState = sel.value;
			transitionToState(newState);
			window.sessionStorage.STATESIDE_LAST = newState;
		}, false);
	}

	var states = prepareStates();
	if(states) prepareUI(states);
}(window));