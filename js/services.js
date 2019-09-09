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

class Square extends PIXI.Graphics {
  constructor(s, c) {
    super()
    this.s = s || 1
    this.c = c || 0x000000
    this.draw()
  }  

  draw() {
    this
    .lineStyle(2, 0xffffff, 1)
    .beginFill(this.c)
    .drawRect(-this.s/2, -this.s/2, this.s, this.s)
    .endFill()
  }
}

class Polygon extends PIXI.Graphics {
  constructor(p, f, fc, l, lc) {
    super()
    this.p = p || []
    this.f = f || 0
    this.fc = fc || 0x000000
    this.l = l || 1
    this.lc = lc || 0x000000
    this.draw()
  }

  draw() {
    this
    .lineStyle(this.l, this.lc)
    .beginFill(this.fc, this.f)
    .drawPolygon(this.p)
    .endFill()
  }
}

class Line extends PIXI.Graphics {
  constructor(points, lineWidth, lineColor, opacity) {
    super()   
    var s = this.lineWidth = lineWidth || 1
    var c = this.lineColor = lineColor || "0x000000"
    var o = this.opacity = opacity || 1
    this.points = points
    this.draw(s, c, o, points)
  }
  
  draw(s, c, o, p){
    this
    .lineStyle(s, c, o)
    .moveTo(p[0], p[1])
    .lineTo(p[2], p[3])
  }

  update(p) {
    var self = this
    var points = this.points = p.map(function(val, index){ 
      return val || self.points[index]
    });
    var s = this.lineWidth, c = this.lineColor, o = this.op   
    this.clear()
    this.draw(s, c, o, points)
  }
}

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
        ctn.scale.set(.7)
        ctnCopy.scale.set(.7)
      }else{
        var w = 800
      }
      
      canvas.width(w)
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
          if(self.isMobile()){
            // Show Indicator
            $(".canvas-ctn .ind").css({
              opacity: 0,
              visibility: "hidden"
            })

            canvas
            .find("[data-id='" + this.id + "']")
            .css({
              opacity: 1,
              visibility: "visible"
            })
          }
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
    drawIndicators: function(points, data){
      var self = this
      points.forEach(function(p, idx){
        // Indicator Name Boxes
        var el = $('<div/>')
        canvas.append(el)
        
        // el.html((idx+1) + ". " + data[idx].key)
        el.html(data[idx].key + "<img class='icon icon-light' src='img/info.svg' />")
        el.attr({
          "data-id": "nt" + (idx+1),
          "data-toggle": "popover",
          title: data[idx].key,
          class: "ind",
          tabindex: 0
        })

        if(self.isMobile()){
          el.css({
            bottom: -30,
            top: "unset",
            left: "50%",            
            transform: "translateX(-50%)",
            visibility: "hidden"
          })
        }else{
          el.css({
            transform: "translate(" + (p.x + data[idx].dx) + "px, " + (p.y + data[idx].dy) + "px)",
            transformOrigin: "0%"
          })
        }
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