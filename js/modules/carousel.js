define(['toolkit'], function (TK) {
  Carousel = Object.create({}, {
    init: {
      value: function (cfg) {
        var config = cfg || {};
        // One master container that contains all the elements --
        this.container = document.querySelector(config.container || '.gallery');

        // The container for gallery items.
        this.itemContainer = this.container.querySelector(config.itemContainer || 'ul');

        // The gallery items themselves.
        this.items = this.itemContainer.querySelectorAll(config.item || 'li');

        // The toolbar for buttons / indicators
        this.toolbar = this.container.querySelector(config.toolbar || '.-toolbar');

        this.autoPlayInterval = config.interval || 3000;
        this.autoPlay = config.auto || true;

        this.scan();

        return this;
      }
    },
    run: {
      value: function () {
        this.currentItemId = 0;
        this.updateItem();
        this.updateToolbar();

        // Auto run...
       
        if (this.autoPlay) {
          this.startAutoPlay();
        }
        return this;
      }
    },
    scan: {
      value: function () {
        var tallest = 0;

        // Review the items
        for (var i=0; i < this.items.length; i++) {
          var item = this.items.item(i);
          var height = item.offsetHeight;
          if (height > tallest) {
            tallest = height;
          }
          item.setAttribute('data-item', i);
        }

        // And the toolbar.
        var totalHeight = this.toolbar.offsetHeight + tallest;

        this.container.style.height = totalHeight+'px';

        this.itemContainer.style.height = tallest+'px';

        if (this.toolbarPosition === 'bottom') {
          this.toolbar.style.top = tallest+'px';
        } else {
          this.itemContainer.style.top = this.toolbar.offsetHeight+'px';
        }

        // Add the item buttons / indicators to the toolbar.
        var toolbarButtons = '';
         toolbarButtons += '<span class="-prev -btn"><i class="fa fa-chevron-left"></i></span>&nbsp;';
       
        for (var i=0; i<this.items.length; i++) {
          var btn = ' <span class="-item -btn" data-item="'+i+'"><i class="fa fa-circle"></i></span> ';
          toolbarButtons += btn;
        }
        toolbarButtons += '&nbsp;<span class="-next -btn"><i class="fa fa-chevron-right"></i></span>';
        this.toolbar.innerHTML = toolbarButtons;

        // And then hook up events to them
        // TODO: delegate on the toolbar.
        var btns = this.toolbar.querySelectorAll('.-item.-btn');
        var gallery = this;
        TK.DOMTools.nodeListEach(btns, function (btn) {
          btn.addEventListener('click', function(e) {
            gallery.onClickSelectBtn(e);
          });
        });

        this.toolbar.querySelector('.-prev.-btn').addEventListener('click', function (e) {
          gallery.onClickPrevBtn(e);
        });
        this.toolbar.querySelector('.-next.-btn').addEventListener('click', function (e) {
          gallery.onClickNextBtn(e);
        });
      }
    },
    startAutoPlay: {
      value: function(tempInterval) {
        var gallery = this;
        var interval = tempInterval || this.autoPlayInterval;
        if (interval) {
          this.autoPlayTimer = window.setTimeout(function () {
            gallery.onAutoPlay();
          }, interval);
        }

      }
    },
    onAutoPlay: {
      value: function () {
        this.nextItem();
        if (this.autoPlay) {
          this.startAutoPlay();
        }
      }
    },
    pauseAutoPlay: {
      value: function () {
        window.clearTimeout(this.autoPlayTimer);
        this.startAutoPlay(this.autoPlayInterval * 3);
      }
    },
    onClickSelectBtn: {
      value: function (e) {
        var b = e.currentTarget;
        var itemId = parseInt(b.getAttribute('data-item'));

        // if on autoplay, have auto play pause for 3x the play rate so that it doesn't 
        // just jump away from the selected item.
        if (this.autoPlay) {
          this.pauseAutoPlay();
        }

        this.selectItem(itemId);
      }
    },
    onClickPrevBtn: {
      value: function (e) {
        if (this.autoPlay) {
          this.pauseAutoPlay();
        }
        this.prevItem();
      }
    }, 
    onClickNextBtn: {
      value: function (e) {
        if (this.autoPlay) {
          this.pauseAutoPlay();
        }
        this.nextItem();
      }
    },
    prevItem: {
      value: function () {
        if (this.currentItemId === 0) {
          this.currentItemId = this.items.length-1;
        } else {
          this.currentItemId--;
        }
        this.updateItem();
        this.updateToolbar();
      }
    },
    nextItem: {
      value: function () {
        if (this.currentItemId === (this.items.length-1)) {
          this.currentItemId = 0;
        } else {
          this.currentItemId++;
        }
        this.updateItem();
        this.updateToolbar();
      }
    },
    selectItem: {
      value: function (itemId) {
        this.currentItemId = itemId;
        this.updateItem();
        this.updateToolbar();
      }
    },
    updateItem: {
      value: function() {
        // make selected item invisible
        var selectedItem = this.itemContainer.querySelector('.-selected');
        if (selectedItem) {
          selectedItem.classList.remove('-selected');
        }

        // make current item visible.
        var currentItem = this.itemContainer.querySelector('[data-item="'+this.currentItemId+'"]');
        currentItem.classList.add('-selected');
      }
    },
    updateToolbar: {
      value: function () {
        // unselect previous one
        var selected = this.toolbar.querySelector('.-selected');
        if (selected) {
          selected.classList.remove('-selected');
        }
        var btn = this.toolbar.querySelector('[data-item="'+this.currentItemId+'"]');
        btn.classList.add('-selected');
      }
    }
  });
  return {Carousel: Carousel};
});