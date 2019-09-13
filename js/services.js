// class Dot extends PIXI.Graphics {
//   constructor(r, f, c) {
//     super()
//     this.r = r || 1
//     this.f = f || .1
//     this.c = c || 0x000000
//     this.draw()
//   }  

//   draw() {
//     this
//     .beginFill(this.c, this.f)
//     .drawCircle(this.x, this.y, this.r)
//     .endFill()
//   }
// }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Square =
/*#__PURE__*/
function (_PIXI$Graphics) {
  _inherits(Square, _PIXI$Graphics);

  function Square(s, c) {
    var _this;

    _classCallCheck(this, Square);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Square).call(this));
    _this.s = s || 1;
    _this.c = c || 0x000000;

    _this.draw();

    return _this;
  }

  _createClass(Square, [{
    key: "draw",
    value: function draw() {
      this.lineStyle(2, 0xffffff, 1).beginFill(this.c).drawRect(-this.s / 2, -this.s / 2, this.s, this.s).endFill();
    }
  }]);

  return Square;
}(PIXI.Graphics);

var Polygon =
/*#__PURE__*/
function (_PIXI$Graphics2) {
  _inherits(Polygon, _PIXI$Graphics2);

  function Polygon(p, f, fc, l, lc) {
    var _this2;

    _classCallCheck(this, Polygon);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Polygon).call(this));
    _this2.p = p || [];
    _this2.f = f || 0;
    _this2.fc = fc || 0x000000;
    _this2.l = l || 1;
    _this2.lc = lc || 0x000000;

    _this2.draw();

    return _this2;
  }

  _createClass(Polygon, [{
    key: "draw",
    value: function draw() {
      this.lineStyle(this.l, this.lc).beginFill(this.fc, this.f).drawPolygon(this.p).endFill();
    }
  }]);

  return Polygon;
}(PIXI.Graphics);

var Line =
/*#__PURE__*/
function (_PIXI$Graphics3) {
  _inherits(Line, _PIXI$Graphics3);

  function Line(points, lineWidth, lineColor, opacity) {
    var _this3;

    _classCallCheck(this, Line);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Line).call(this));
    var s = _this3.lineWidth = lineWidth || 1;
    var c = _this3.lineColor = lineColor || "0x000000";
    var o = _this3.opacity = opacity || 1;
    _this3.points = points;

    _this3.draw(s, c, o, points);

    return _this3;
  }

  _createClass(Line, [{
    key: "draw",
    value: function draw(s, c, o, p) {
      this.lineStyle(s, c, o).moveTo(p[0], p[1]).lineTo(p[2], p[3]);
    }
  }, {
    key: "update",
    value: function update(p) {
      var self = this;
      var points = this.points = p.map(function (val, index) {
        return val || self.points[index];
      });
      var s = this.lineWidth,
          c = this.lineColor,
          o = this.op;
      this.clear();
      this.draw(s, c, o, points);
    }
  }]);

  return Line;
}(PIXI.Graphics);

app.factory('pixi', function($q, $filter, $rootScope, $http, $q) {
  var canvas = $(".canvas-ctn")
  , app
  , ctn = new PIXI.DisplayObjectContainer()  
  , ctnCopy = new PIXI.DisplayObjectContainer()  
  , lineArr = []
  , sqArr = []
  , polyCopy
  , currLine

  return {
    isMobile: function(){
      if(    navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i)
          || window.innerWidth <= 768
        ){
        return true
      }
      else {
        return false
      }
    },
    resize: function(){
      w = canvas.width()
      h = canvas.height()
      c = { x: w/2, y: h/2 }
      
      app.renderer.view.width = w  
      app.renderer.view.height = h
      
      app.renderer.resize(w, h)
      ctn.position.set(c.x, c.y)
      ctnCopy.position.set(c.x, c.y)
    },
    get: function(u){
      var def = $q.defer()
      $http.get(u).then(function(r){ def.resolve(r) })
      return def.promise
    },
    lerp: function(a, b, x){ 
      return a + x*(b - a) 
    },
    round: function(x, n){ 
      return Math.ceil( x / n ) * n 
    },
    init: function(){
      if(this.isMobile()){
        var w = "100%"        
        ctn.scale.set(.6)
        ctnCopy.scale.set(.6)
      }else{
        var w = 800
      }
      
      // canvas.width(w)
      var h = canvas.width()*9/16 + 200
      canvas.height(h)

      c = { x: canvas.width()/2, y: h/2 }

      app = new PIXI.Application( canvas.width(), h, {
        // renderer: PIXI.CanvasRenderer,
        transparent: true,
        antialias: true,
        resolution: 2
      })

      // app.renderer.plugins.interaction.autoPreventDefault = false
      // app.view.style['touch-action'] = 'auto'
      app.view.style.position = "absolute"
      app.view.style.top = app.view.style.left = 0
      canvas.append(app.view)

      ctn.pivot.set(c.x, c.y)
      ctn.position.set(c.x, c.y)
      ctnCopy.pivot.set(c.x, c.y)
      ctnCopy.position.set(c.x, c.y)

      app.stage.addChild(ctn)
      app.stage.addChild(ctnCopy)
      // this.setCtnCopy(false)
    },
    fl: function(fil, arr, condition){
    	return $filter(fil)(arr, condition)
    },
    setCtnCopy: function(value){
      ctnCopy.visible = value
      if(!value && this.isMobile())
        $(".ind").css({
          opacity: 0,
          visibility: "hidden"
        })
    },
    getClosestPointByPercent: function(line, t) {
      line.x0 = line.points[0]
      line.y0 = line.points[1]
      line.x1 = line.points[2]
      line.y1 = line.points[3]

      return {
        x: this.lerp(line.x0, line.x1, t),
        y: this.lerp(line.y0, line.y1, t)
      }
    },
    getClosestPointOnLine: function(line, x, y) {
      line.x0 = line.points[0]
      line.y0 = line.points[1]
      line.x1 = line.points[2]
      line.y1 = line.points[3]
      
      var dx = line.x1 - line.x0
      , dy = line.y1 - line.y0
      , t = ( (x - line.x0)*dx + (y - line.y0)*dy ) / ( dx*dx + dy*dy )

      t = Math.min(1, Math.max(0, t))

      // Here we want the t to be in steps of .05 (5%)
      t = this.round(t*100, 5)/100
      // l(t)

      // Making t >= .3
      t = Math.max(.3, t)

      return {
        x: this.lerp(line.x0, line.x1, t),
        y: this.lerp(line.y0, line.y1, t),
        p: t
      }
    },
    getDecimal: function(num){
			return Math.round(num * 100) / 100;
		},
    getPoints: function(radius, num){
      var retArr = []
      , self = this
			, angle = 2*Math.PI/num

			//  Get n equidistant points
			for(var i = 0; i < num; i++){
				var x = angle*i - Math.PI/2
				retArr.push({
					x: self.getDecimal(c.x + radius*Math.cos(x)),
					y: self.getDecimal(c.y + radius*Math.sin(x))
				})
			}
			return retArr
    },
    getDataPoints: function(data){
      var retArr = []
      , self = this
      , num = data.length
			, angle = 2*Math.PI/num

			//  Get n data points based on %
			for(var i = 0; i < num; i++){
				var x = angle*i - Math.PI/2
				retArr.push({
					x: self.getDecimal( c.x + Math.cos(x) * 2 * data[i].value ),
					y: self.getDecimal( c.y + Math.sin(x) * 2 * data[i].value ),
				})
			}
			return retArr
    },
    drawPoints: function(points, side, color){
      points.forEach(function(obj){
        var dot = new Square(side, color)
        dot.position.x = obj.x
        dot.position.y = obj.y
        dot.rotation = Math.PI/4
        ctn.addChild(dot)
      })
    },
    drawPolygon: function(points, f, fc, l, lc, isSquare){
      var polyGonArr = []
      , poly

      // if(isSquare){
      //   points.forEach(function(obj){
      //     polyGonArr.push(obj.x + obj.s/2, obj.y + obj.s/2)
      //   })
      //   polyGonArr.push(points[0].x + points[0].s/2, points[0].y + points[0].s/2)
      //   poly = new Polygon(polyGonArr, f, fc, l, lc)
      //   ctnCopy.addChild(poly)
      // }else{
      // }

      points.forEach(function(obj){
        polyGonArr.push(obj.x, obj.y)
      })
      polyGonArr.push(points[0].x, points[0].y)
      poly = new Polygon(polyGonArr, f, fc, l, lc)
      ctn.addChild(poly)
      
      return poly
    },
    drawDraggablePoints: function(points, side, color){
      var self = this      
      points.forEach(function(obj, idx){
        var sq = new Square(side, color)
        sq.position.x = obj.x
        sq.position.y = obj.y
        sq.rotation = Math.PI/4
        sq.id = "nt" + (idx + 1)
        sq.idx = idx + 1
        sqArr.push(sq)
        // ctnCopy.addChild(sq)
        
        // sq.visible = false
        sq.interactive = true
        sq.buttonMode  = true
        sq
		    .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove)
        
        function onDragStart(e){
          // l(e.data)

          // store a reference to the data
          // the reason for this is because of multitouch
          // we want to track the movement of this particular touch
          this.data = e.data
          this.alpha = 0.5
          this.dragging = true
          
          $rootScope.$broadcast("showPopup", { idx: this.idx })

          currLine = self.fl('filter', lineArr, { id: this.id })[0]
          // if(self.isMobile()){
          //   // Show Indicator
          //   $(".canvas-ctn .ind").css({
          //     opacity: 0,
          //     visibility: "hidden"
          //   })

          //   canvas
          //   .find("[data-id='" + this.id + "']")
          //   .css({
          //     opacity: 1,
          //     visibility: "visible"
          //   })
          // }
			  }

		    function onDragEnd(){
          this.alpha = 1
			    this.dragging = false
			    // set the interaction data to null
          this.data = null
          currLine = null
          $rootScope.$broadcast("hidePopup")          
        }
        
		    function onDragMove(){
          if (this.dragging){
            var newPos = this.data.getLocalPosition(this.parent)
            , point = self.getClosestPointOnLine(currLine, newPos.x, newPos.y)

            // this.position.x = point.x - this.s/2
            // this.position.y = point.y - this.s/2
            this.position.x = point.x
            this.position.y = point.y

            var idx = sqArr.indexOf(this)
            $rootScope.$broadcast("dataChange", {
              percent: point.p,              
              index: idx
            })

            self.redrawPolygon()
			    }
        }
        
      })
    },
    redrawDraggablePoint: function(idx, percent){
      // l(
      //   sqArr[idx], 
      //   lineArr[idx],
      //   this.round(percent, 5)/100
      // )
      
      var sq = sqArr[idx]
      , point = this.getClosestPointByPercent(
        lineArr[idx], 
        this.round(percent, 5)/100
      )

      sq.position.x = point.x// - sq.s/2
      sq.position.y = point.y// - sq.s/2

      this.redrawPolygon()
    },
    drawDraggablePolygon: function(data){
      this.drawDraggablePoints(this.getDataPoints(data), this.isMobile()?20:12, 0x156c9c)
      
      // Dynamically draw secondary polygon
      this.redrawPolygon()

      sqArr.forEach(function(sq){
        ctnCopy.addChild(sq)        
      })
    },
    drawLinesFromCenter: function(points){
      points.forEach(function(obj, idx){
        var line = new Line([
          c.x, c.y,
          obj.x, obj.y
        ], null, 0x000000, 1)
        line.id = "nt" + (idx + 1)
        lineArr.push(line)
        ctn.addChild(line)
      })
    },
    drawPercent: function(obj){
      var style = new PIXI.TextStyle({
          align: "right",
          fontFamily: "Arial Narrow, Arial",
          fontSize: 18,
          fontWeight: "bold"
      });
      var text = new PIXI.Text(obj / 10, style);
      text.alpha = .9
      text.position.x = c.x - 20
      text.position.y = c.y - 2*obj - 15

      ctnCopy.addChild(text)
    },
    drawIndicators: function(points, data){
      var self = this
      points.forEach(function(p, idx){
        // Indicator Name Boxes
        var el = $('<div/>')
        canvas.append(el)
        
        // el.html((idx+1) + ". " + data[idx].key)
        el.html("<div class'ind-text'>" + data[idx].key + "</div><img class='icon icon-light' src='img/info.svg' />")
        el.attr({
          "data-id": "nt" + (idx+1),
          "data-toggle": "popover",
          title: data[idx].key.replace(/-/g, ''),
          class: "ind",
          tabindex: 0
        })

        // if(self.isMobile()){
        //   el.css({
        //     bottom: -30,
        //     top: "unset",
        //     left: "50%",            
        //     transform: "translateX(-50%)",
        //     visibility: "hidden"
        //   })
        // }else{
        if(self.isMobile()){
          var ty = "calc("+ p.y +"px - 50%)"
          var tx = p.x +"px"
          
          if(idx === 0){
            tx = "calc("+ p.x +"px - 50%)"
            ty = "calc("+ p.y +"px - 200%)"
          } else if(idx === 1 || idx === 2){
            tx = "calc("+ p.x +"px + 20%)"
            ty = "calc("+ p.y +"px - 150%)"
          } else if(idx === 3){
            tx = "calc("+ p.x +"px + 25%)"
            ty = "calc("+ p.y +"px + 50%)"
          } else if(idx === 4){
            tx = "calc("+ p.x +"px - 50%)"
            ty = "calc("+ p.y +"px + 100%)"
          } else if(idx === 5){
            tx = "calc("+ p.x +"px - 125%)"
            ty = "calc("+ p.y +"px + 50%)"
          } else if(idx === 6){
            tx = "calc("+ p.x +"px - 115%)"
            ty = "calc("+ p.y +"px + 50%)"
          } else if(idx === 7){
            tx = "calc("+ p.x +"px - 125%)"
            ty = "calc("+ p.y +"px - 125%)"
          }
        }else{          
          var ty = "calc("+ p.y +"px - 50%)"
          var tx = p.x +"px"
          
          if(idx === 0){
            tx = "calc("+ p.x +"px - 50%)"
            ty = "calc("+ p.y +"px - 100%)"
          } else if(idx === 4){
            tx = "calc("+ p.x +"px - 50%)"
            ty = "calc("+ p.y +"px + 0%)"
          }
          else if(idx === 5 || idx === 6 || idx === 7){
            tx = "calc("+ p.x +"px - 100%)"
          }
        }

          el.css({
            // transform: "translate(" + (p.x + data[idx].dx) + "px, " + (p.y + data[idx].dy) + "px)",
            // transform: "translate(" + (p.x) + "px, " + (p.y) + "px)",
            transform: "translate("+ tx + ", " + ty +")",
            transformOrigin: "0%"
          })
        // }
      })
    },
    redrawPolygon: function(){
      if(angular.isDefined(polyCopy)){
        polyCopy.destroy()
        sqArr.forEach(function(sq){
          ctnCopy.removeChild(sq)        
        })
      }
      polyCopy = this.drawPolygon(sqArr, null, null, 5, 0x156c9c, true)
      sqArr.forEach(function(sq){
        ctnCopy.addChild(sq)        
      })
    }
	}
})