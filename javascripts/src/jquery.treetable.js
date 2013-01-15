(function() {
  var $, Node, Tree, methods;

  $ = jQuery;

  Node = (function() {

    function Node(row, tree, settings) {
      this.row = row;
      this.tree = tree;
      this.settings = settings;
      this.id = this.row.data(this.settings.nodeIdAttr);
      this.parentId = this.row.data(this.settings.parentIdAttr);
      this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
      this.expander = $(this.settings.expanderTemplate);
      this.indenter = $(this.settings.indenterTemplate);
      this.children = [];
      this.initialized = false;
      this.treeCell.prepend(this.indenter);
    }

    Node.prototype.ancestors = function() {
      var ancestors, node;
      node = this;
      ancestors = [];
      while (node = node.parentNode()) {
        ancestors.push(node);
      }
      return ancestors;
    };

    Node.prototype.collapse = function() {
      this._hideChildren();
      this.row.removeClass("expanded").addClass("collapsed");
      this.expander.attr("title", "Expand");
      if ($.isFunction(this.settings.onNodeHide)) {
        this.settings.onNodeHide();
      }
      return this;
    };

    Node.prototype.expand = function() {
      this.row.removeClass("collapsed").addClass("expanded");
      this._showChildren();
      this.expander.attr("title", "Collapse");
      if ($.isFunction(this.settings.onNodeShow)) {
        this.settings.onNodeShow();
      }
      return this;
    };

    Node.prototype.expanded = function() {
      return this.row.hasClass("expanded");
    };

    Node.prototype.hide = function() {
      this._hideChildren();
      this.row.hide();
      return this;
    };

    Node.prototype.level = function() {
      return this.ancestors().length;
    };

    Node.prototype.parentNode = function() {
      if (this.parentId != null) {
        return this.tree[this.parentId];
      } else {
        return null;
      }
    };

    Node.prototype.render = function() {
      if (this.settings.expandable === true) {
        if (this.children.length > 0) {
          this.indenter.html(this.expander);
          this.expander.bind("click.treeTable", function(event) {
            $(this).parents("table").treeTable("node", $(this).parents("tr").data("ttId")).toggle();
            return event.preventDefault();
          });
        }
        if (this.settings.initialState === "collapsed") {
          this.collapse();
        }
      }
      return this.indenter[0].style.paddingLeft = "" + (this.level() * this.settings.indent) + "px";
    };

    Node.prototype.show = function() {
      if (!this.initialized) {
        this._initialize();
      }
      this.row.show();
      if (this.expanded()) {
        this._showChildren();
      }
      return this;
    };

    Node.prototype.toggle = function() {
      if (this.expanded()) {
        this.collapse();
      } else {
        this.expand();
      }
      return this;
    };

    Node.prototype._hideChildren = function() {
      var child, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.hide());
      }
      return _results;
    };

    Node.prototype._initialize = function() {
      this.render();
      return this.initialized = true;
    };

    Node.prototype._showChildren = function() {
      var child, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.show());
      }
      return _results;
    };

    return Node;

  })();

  Tree = (function() {

    function Tree(table, settings) {
      this.table = table;
      this.settings = settings;
      this.tree = {};
      this.roots = [];
    }

    Tree.prototype.load = function() {
      var node, parent, row, _i, _len, _ref;
      if (this.table.rows != null) {
        _ref = this.table.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          row = $(row);
          if (row.data(this.settings.nodeIdAttr) != null) {
            node = new Node($(row), this.tree, this.settings);
            this.tree[node.id] = node;
            if (node.parentId != null) {
              parent = this.tree[node.parentId];
              parent.children[parent.children.length] = node;
            } else {
              this.roots[this.roots.length] = node;
            }
          }
        }
      }
      return this;
    };

    Tree.prototype.render = function() {
      var root, _i, _len, _ref;
      _ref = this.roots;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        root = _ref[_i];
        root.show();
      }
      return this;
    };

    return Tree;

  })();

  methods = {
    init: function(options) {
      var settings;
      settings = $.extend({
        column: 0,
        columnElType: "td",
        expandable: false,
        expanderTemplate: "<a href='#'>&nbsp;</a>",
        indent: 19,
        indenterTemplate: "<span class='indenter'></span>",
        initialState: "collapsed",
        nodeIdAttr: "ttId",
        parentIdAttr: "ttParentId",
        onNodeHide: null,
        onNodeShow: null
      }, options);
      return this.each(function() {
        var tree;
        tree = new Tree(this, settings);
        tree.load().render();
        return $(this).addClass("treeTable").data("treeTable", tree);
      });
    },
    destroy: function() {
      return this.each(function() {
        return $(this).removeData("treeTable").removeClass("treeTable");
      });
    },
    node: function(id) {
      return $(this).data("treeTable").tree[id];
    }
  };

  $.fn.treeTable = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error("Method " + method + " does not exist on jQuery.treeTable");
    }
  };

  this.TreeTable || (this.TreeTable = {});

  this.TreeTable.Node = Node;

  this.TreeTable.Tree = Tree;

}).call(this);
