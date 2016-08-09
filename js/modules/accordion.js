define(['jquery', 'lodash'], function(jquery, lodash) {
	
	/*
		Our pattern is title, body, title, body, ..
		So we collect these into an array of "panels", which is how we
		want to logically group them. 
		NB we use this pattern because it is easier markup.
	*/
	function runAccordions () {
		jquery(".dfw-accordion").each(function() {

			var myAccordion = {
					onlyOneOpen: true,
					openPanels: [],
					panels: []
				},
				root = jquery(this),
				kids = root.children(),

				panelCount = kids.size() / 2,
				panels = myAccordion.panels;

			for (var i = 0; i < panelCount; i++) {
				var title = kids.slice(2*i, 2*i+1).addClass("dfw-accordion-title"),
					section = kids.slice(2*i+1, 2*i+1+1).addClass("dfw-accordion-section");

				panels[i] = {
					accordion: myAccordion,
					title: title,
					section: section,
					autoOpen: section.data("dfw-auto-open"),
					index: i
				};
			}

			lodash.forEach(panels, function(panel) {
				// Ensure all panels are hidden ... they should be already.
				if (panel.autoOpen) {
					panel.section.show();
					panel.accordion.openPanels.push(panel);
				} else {
					panel.section.hide();
				}

				// Set up clicking on the title.
				panel.title.on("click", function(event) {					
					var accordion = panel.accordion;
					if (panel.section.is(':hidden')) {
						if (accordion.onlyOneOpen) {
							lodash.forEach(accordion.openPanels, function(openPanel) {
								openPanel.section.hide({easing: "linear", duration: 200});
								openPanel.title.removeClass("dfw-accordion-selected");
							});
							accordion.openPanels = [];
						}
						accordion.openPanels.push(panel);
						panel.section.show({easing: "linear", duration: 200});
						panel.title.addClass("dfw-accordion-selected");
					} else {
						panel.section.hide({easing: "linear", duration: 200});
						panel.title.removeClass("dfw-accordion-selected");
						accordion.openPanels = lodash.filter(accordion.openPanels, function(openPanel) {
							return openPanel.section === panel.section;
						});
					}
				});
			});

			// Show the overall thing.
			root.removeClass("dfw-loading");
		});
	}

	var AccordionManager = Object.create({}, {
			run: {
				value: runAccordions
			}
		});
	return AccordionManager;
});