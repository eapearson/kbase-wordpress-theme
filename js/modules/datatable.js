define(['mustachio', 'numeral', 'toolkit', 'datatable'], function(M,numeral,TK, DT) {
  var DOM = TK.DOMTools;
  
  var  Table = Object.create({}, {
    init: {
      value: function (config) {
        this.config = config;
        //this.sourceDb = this.db;
        this.db = config.db;
        this.rowsShowing = this.db.rows.length;
        this.wrapper = config.wrapper;
        this.wrapperNode = document.querySelector(this.wrapper);
        this.containerNode = document.querySelector(this.wrapper + ' [data-placeholder="table-rows"]');
        this.templateNode = document.querySelector(this.wrapper + ' [data-template="table-rows"]');
        this.filters = [];
        var template = this.templateNode.innerHTML;
        var modifiers = {
          mbyte: function (value) {
            if (value && (typeof value === 'number')) {
              return value / 1000000;
            } else {
              return value;
            }
          },
          gbyte: function (value) {
            if (value && (typeof value === 'number')) {
              return value / 1000000000;
            } else {
              return value;
            }
          },
            byteNum: function (value) {
   					  if (value) {
     						return numeral(value).format('0,0');
     					} else {
     						return value;
     					}
     				},
            intNum: function (value) {
    					  if (value) {
      						return numeral(value).format('0,0');
      					} else {
      						return value;
      					}
      				},
              date: function (value) {
                if (value) {
                  var d = new Date(value);
                  var s = d.getUTCFullYear()+'-'+
                          ('0'+(d.getUTCMonth()+1)).substr(-2)+'-'+
                          ('0'+d.getUTCDate()).substr(-2);
                  return s;
                } else {
                  return value;
                }
              }
         };
         var m = Object.create(M.Base).init({template: template, modifiers: modifiers});
         this.template = m.parse();
       
         var that = this;
         var sortControls = document.querySelectorAll(this.wrapper + ' [data-control="sort"]');
         DOM.nodeListEach(sortControls, function (node) {
           node.addEventListener('click', function(e) {
             var field = e.currentTarget.getAttribute('data-for-field');
             var direction = e.currentTarget.getAttribute('data-sort-direction');
             if (that.isBlank(direction)) {
               direction = that.config.defaultSortDirection || 'ascending';
             }
             var nextDirection;
             if (direction === 'ascending') {
               nextDirection = 'descending';
             } else {
               nextDirection = 'ascending';
             }
             e.currentTarget.setAttribute('data-sort-direction', nextDirection);
             var type = e.currentTarget.getAttribute('data-type');
             that.sort(field,type,direction);
             that.render();
           });
         });     
       
       
         DOM.nodeListEach(document.querySelectorAll(this.wrapper + ' .-search input'), function (node) {
           node.addEventListener('change', function (e) {
             var filterControl = e.currentTarget;
             var searchValue = filterControl.value;
             var cell = DOM.findAncestor(filterControl, '[data-for-field]');
             // console.log('Filtering with: '+searchValue+', '+cell.getAttribute('data-for-field')+', '+filterControl.getAttribute('data-filter-op'));
             that.updateFilter({field: cell.getAttribute('data-for-field'), 
                               op: filterControl.getAttribute('data-filter-op'), 
                               modifier: cell.getAttribute('data-modifier'),
                               value: searchValue});
             that.runCalcs();
             that.render();
           });
         });
       
         return this;
      }
    },
    render: {
      value: function () {
        // alert('about to render...');
        this.containerNode.innerHTML = this.template.render(this.db);

        // do this better...
        var node = this.wrapperNode.querySelector('[data-info="rows-showing"]');
        if (node) {
          node.innerHTML = this.rowsShowing;
        }
        return this;
      }
    },
    prop: {
      value: function(obj,props,pos) {
        if (pos===undefined) { pos = 0}
        if (props.length === pos) {
          return obj;
        } else if (typeof obj === 'object') {
          return this.prop(obj[props[pos]], props, pos+1);
        }
      
      }
    },
    setProp: {
      value: function(obj,props,value,pos) {
        pos = typeof pos !== 'undefined' ? pos : 0;
        if (props.length === pos) {
          return false;
        } else if (props.length-1 === pos) {
          // on a leaf.
          var key = props[pos];
          obj[key] = value;
        } else {
          var key = props[pos];
          if (obj[key] === undefined) {
            obj[key] = {};
          }
          return this.prop(obj[key], props, value, pos+1);
        }
      }
    },
    incProp: {
      value: function(obj,props,value,pos) {
        pos = typeof pos !== 'undefined' ? pos : 0;
        if (props.length === pos) {
          return false;
        } else if (props.length-1 === pos) {
          // on a leaf.
          var key = props[pos];
          if (obj[key] === undefined) {
            obj[key] = value;
          } else {
            obj[key] += value;
          }
        } else {
          var key = props[pos];
          if (obj[key] === undefined) {
            obj[key] = {};
          }
          return this.incProp(obj[key], props, value, pos+1);
        }
      }
    },
    isBlank: {
      value: function(x) {
        if ( (x === null) || (x === undefined) || ( (typeof x === 'string') && (x.length===0) ) ) {
          return true;
        } else {
          return false;
        }
      }
    },
    intSorter: {
      value: function (a,b) {
        if (this.isBlank(a)) {
          if (this.isBlank(b)) {
            return 0;
          } else {
            return -1;
          }
        } else {
          if (this.isBlank(b)) {
            return 1;
          } else {
            return (a-b);
          }
        }
      }
    },
    strCmp: {
      value: function (a,b) {
        var min = Math.min(a.length, b.length);
        var ac, bc;
        for (var i=0; i<min; i++) {
          ac = a.charCodeAt(i);
          bc = b.charCodeAt(i);
          diff = ac - bc;
          if (diff !== 0) {
            return diff;
          }
        }
        if (a.length === b.length) {
          return 0;
        } else {
          if (a.length < b.length) {
            return -1;
          } else {
            return 1;
          }
        }
      }
    },
    alphaSorter: {
      value: function (a,b) {
        if (this.isBlank(a)) {
          if (this.isBlank(b)) {
            return 0;
          } else {
            return -1;
          }
        } else {
          if (this.isBlank(b)) {
            return 1;
          } else {
            return this.strCmp(a, b);
          }
        }
      }
    },
    sort: {
      value: function (fieldName, type, direction) {
        var props = fieldName.split('.');
        var that = this;
        var reverse = (direction === 'ascending') ? 1 : -1;
        var fun;
        switch (type) {
          case 'int': fun = 'intSorter'; break;
          case  'string': fun = 'alphaSorter'; break;
          default: fun = 'intSorter'
        }
        this.db.rows.sort(function (a,b) {
          var av = that.prop(a, props);
          var bv = that.prop(b, props);
          return reverse*that[fun](av,bv);
        });
      }
    }, 
    runCalcs: {
      value: function () {
        var that = this;
        var sum = {};
        var rows = this.db.rows;
        var loop = function (next, path) {   
          var keys = Object.keys(next);          
          for (var i=0; i<keys.length; i++) {
            var key = keys[i];
            var n = next[key];            
            if (typeof n === 'object') {
              if (n !== null) {
                path.push(key);
                loop(n, path);
                path.pop();
              }
            } else {
              if (typeof n === 'number') {
                 path.push(key);
                that.incProp(sum, path, n);
                path.pop();
              }
            }
          }
        }
        for (var j=0; j< rows.length; j++) {
          if (!rows[j].__hide) {
            loop(rows[j], []);
          }
        }
        this.db.total = sum;
        return this;
      }
    }, 
    xrunCalcs: {
      value: function () {
        // TODO: A generic object summer -- for now hard coded.
        var sum = {
          pub: {
            std: {byte: 0, cnt: 0},
            del: {byte: 0, cnt: 0}
          },
          priv: {
            std: {byte: 0, cnt: 0},
            del: {byte: 0, cnt: 0}
          },
          total: {
            std: {byte: 0, cnt: 0},
            del: {byte: 0, cnt: 0}
          }
        }
        var rows = this.db.rows;
        for (var i=0; i< rows.length; i++) {
          var item = rows[i];
          if (!item.__hide) {
            sum.pub.std.byte += item.pub.std.byte;
            sum.pub.std.cnt += item.pub.std.cnt;
        
            sum.priv.std.byte += item.priv.std.byte;
            sum.priv.std.cnt += item.priv.std.cnt;
        
            sum.total.std.byte += sum.pub.std.byte + sum.priv.std.byte;
            sum.total.std.cnt += sum.pub.std.cnt + sum.priv.std.cnt;
          }
        }
        this.db.total = sum;
        return this;
      }
    },
    updateFilter: {
      value: function (cfg) {
        if (this.isBlank(cfg.value)) {
          delete this.filters[cfg.field+':'+cfg.op];
        } else {
          this.filters[cfg.field+':'+cfg.op] = cfg;
        }
        this.applyFilters(); 
      }
    },
    applyModifier: {
      value: function (mod, value) {
        if (mod === 'mbytes') {
          return value*1000000;
        } else {
          return value;
        }
      }
    },
    applyFilters: {
      value: function () {
        var that = this;
      
        // First build a set of filter functions. These are applied
        // in any order, and are ANDed together -- that is if all succeed the filter
        // succeeds.
        var filtersToApply = [];
        for (var k in this.filters) {
          var filter = this.filters[k];
          var props = filter.field.split('.');
          switch (filter.op) {
          case 'regexp':
          case 'regexp-match':
            filtersToApply.push({
              fun: function (row, props, filterValue) {    
                var val = that.prop(row, props);
                // An empty cell is considered an empty string.
                if (!val) {
                  val = '';
                }
                if (val.match(filterValue)) {
                  return true;
                } else {
                  return false;
                }
              },
              op: filter.op,
              val: new RegExp(filter.value),
              props: props
            });
            break;
          case 'ge':
            filtersToApply.push({
              fun: function (row, props, filterValue) {
                //console.log('applying "ge" with '+filterValue+', '+that.prop(row, props));
                var rowValue = that.prop(row, props);
                if (typeof rowValue === 'number') {
                  if (that.prop(row, props) >= filterValue) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              },
              op: filter.op,
              val: this.applyModifier(filter.modifier, parseInt(filter.value)),
              props: props
            });
            break;
          case 'le':
            filtersToApply.push({
              fun: function (row, props, filterValue) {
                var rowValue = that.prop(row, props);
                if (typeof rowValue === 'number') {
                  if (that.prop(row, props) <= filterValue) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              },
              op: filter.op,
              val: this.applyModifier(filter.modifier, parseInt(filter.value)),
              props: props
            });
            break; 
          case 'boolean':
          case 'bool': 
          var boolVal = false;
          switch (filter.value) {
          case true:
          case 'y':
          case 'yes':
          case 't':
          case 'true':
            boolVal = true;
          }
          filtersToApply.push({
            fun: function (row, props, filterValue) {
              if (that.prop(row,props) === filterValue) {
                return true;
              } else {
                return false;
              }
            },
            op: filter.op,
            val: boolVal,
            props: props
          })
          }  
        }
      
        var showingCount = 0;
        this.db.rows.forEach(function (x) {
          var matched = true;
          for (var i in filtersToApply) {
           // console.log('applying filter '+i);
            var keepRow = filtersToApply[i].fun(x, filtersToApply[i].props, filtersToApply[i].val);
            //console.log('got: '+keepRow);
            if (!keepRow) {
              matched = false;
              break;
            }
          }
          if (matched) {
            showingCount++;
            x.__hide = false;
          } else {
            x.__hide = true;
          }
        });
        that.rowsShowing = showingCount;
      }
    },
    totalPad: {
      value: function (node) {
        var t = parseInt(window.getComputedStyle(node).paddingTop.replace(/px$/, ''));
        t += parseInt(window.getComputedStyle(node).paddingBottom.replace(/px$/, ''));
        t += parseInt(window.getComputedStyle(node).borderTopWidth.replace(/px$/, ''));
        t += parseInt(window.getComputedStyle(node).borderBottomWidth.replace(/px$/, ''));
        
        return t;
      }
    },
    resizeParent: {
      value: function () {
        // just a hack for now.
        // get the height of the table, post render.
        var that = this;
        window.setTimeout(function () {
          var height = that.wrapperNode.offsetHeight;
          // adjust the tabs panes
          var parent = DOM.findAncestor(that.wrapperNode, '.tabs');
          if (parent) {
            var panes = parent.querySelectorAll('.pane');
            DOM.nodeListEach(panes, function (node) {
              var t = that.totalPad(node);              
              
              node.style.height = (t+height)+'px';
            });
          }
        }, 0);
      }
    }
  });
  return {
    Table: Table
  }
});