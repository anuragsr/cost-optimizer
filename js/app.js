var l = console.log.bind(window.console)
, app = angular.module('app', [])

app.controller('ctrl', function($scope, $timeout, pixi){
  var BORDER_SIZE = 10  
  , m_pos = 0
  , currPanel
  , currPanelIndex
  , newWidth
  , origWidth = null
  // , url = 'data/data-points.json'
  , url = 'data/data-points-new.json'
  , sum = 0
  , s = $scope
  , handle = null

  s.showOptimizer = true
  s.showPopup = false
  s.popupPos = "right"
  s.popupContent = ""
  s.resize = false
  s.showLoader = true
  s.overlay = false

  s.dividers = { 
    d: 4000,
    m: 3000,
  }

  if(pixi.isMobile()){
    s.currDivider = s.dividers.m
  } else{
    s.currDivider = s.dividers.d
  }
  
  pixi.get(url).then(function(res){
    // l(res)
    s.networkData = res.data
    // s.networkData = [
    //   { id: "t1", key: "Design", value: 95, amount: 1107.5, dx: 10, dy: -30 },
    //   { id: "t2", key: "Connectivity & Infotainment", value: 80, amount: 443.0, dx: 0, dy: -20 },
    //   { id: "t3", key: "Display & Operator Experience", value: 85, amount: 302.0, dx: 0, dy: -20 },
    //   { id: "t4", key: "Environmental Compatibility <br/>& Sustainability", value: 65, amount: 1248.4, dx: 0, dy: -30 },
    //   { id: "t5", key: "Automated Driving & Safety", value: 70, amount: 302.0, dx: 0, dy: -10 },
    //   { id: "t6", key: "Driving Dynamics", value: 80, amount: 1087.4, dx: 0, dy: -15 },
    //   { id: "t7", key: "Ride Comfort", value: 80, amount: 986.7, dx: -50, dy: 0 },
    //   { id: "t8", key: "Comfort", value: 85, amount: 503.4, dx: -70, dy: 0 },
    //   { id: "t9", key: "Everyday Usability", value: 80,  amount: 503.4, dx: -140, dy: 0 },
    //   { id: "t10", key: "Quality & Reliability", value: 85, amount: 1892.8, dx: -160, dy: -15 },
    //   { id: "t11", key: "TCO", value: 85, amount: 865.9, dx: -70, dy: -20 },
    //   // { id: "t12", key: "Sample", value: 75, amount: 865.9, dx: -70, dy: -20 },
    // ]
    
    s.networkDataSec = angular.copy(s.networkData)
  
    s.networkDataSec.forEach(function(obj){
      obj.total = (obj.amount*100) / obj.value
      sum+= obj.amount
    })
  
    s.sum = parseFloat(sum.toFixed(2))
    s.newSum = parseFloat(sum.toFixed(2)) 
    
    // PIXI Canvas
    pixi.init()
     
    // Web
    var radii = [ 0, 20, 40, 60, 80, 100 ]
    , canvas = $(".canvas-ctn")
    , w = canvas.width()
    , h = canvas.height()

    radii.forEach(function(obj){
      // Percent Marks
      var el = $('<div class="perc">')
      // el.html(obj + " %")
      el.html(obj / 10 + ".0")
      if(pixi.isMobile()){
        el.css({
          transform: "translate(" + (w/2 - 50) + "px, " + (h/2 - 1.4*obj - 20) + "px)",
          transformOrigin: "0%"      
        })
      }else{
        el.css({
          transform: "translate(" + (w/2 - 50) + "px, " + (h/2 - 2*obj - 20) + "px)",
          transformOrigin: "0%"      
        })
      }
      canvas.append(el)

      // Main Polygon Rings
      var p = pixi.getPoints(2*obj, s.networkData.length)
      // pixi.drawPoints(p, 2)
      pixi.drawPolygon(p)
      if(obj === 100){
        // Draw lines from center to end points
        pixi.drawLinesFromCenter(p)      
      }
    })

    // Indicators
    var p = pixi.getPoints(220, s.networkData.length)
    // pixi.drawPoints(p, 2)
    pixi.drawIndicators(p, s.networkData)
    
    // Draw original network polygon
    var dp = pixi.getDataPoints(s.networkData)
    pixi.drawPoints(dp, pixi.isMobile()?10:6, 0x11cccc)
    pixi.drawPolygon(dp, null, null, 2, 0x11cccc)

    // Draw second polygon to be dragged
    pixi.drawDraggablePolygon(s.networkDataSec)
    
    s.showLoader = false

  })

  // New Sum
  s.$watch('networkDataSec', function(n, o){
    if(angular.isDefined(n)){
      var sum = 0
      n.forEach(function(obj){ sum+= obj.amount })
      s.newSum = parseFloat(sum.toFixed(2))
    }
  }, true)
  
  s.$on('dataChange', function(e, v){
    s.$apply(function(){
      var curr = s.networkDataSec[v.index]
      curr.amount = parseFloat((curr.total*v.percent).toFixed(2))
    })
  })

  s.$on('$viewContentLoaded', function(){
    //s.showLoader = false
  })
  
  s.$on('$includeContentLoaded', function(){
    // Popovers
    $('[data-toggle="popover"]').each(function(){
      var popCtn = $('#' + $(this).data('id'))
      , content = popCtn.find(".ctn-click").length ? popCtn.find(".ctn-click").html() : popCtn.html()

      $(this).popover({
        // trigger: pixi.isMobile()?'focus':'click',
        trigger: 'focus',
        container: 'body',
        placement: 'bottom',
        html: true,
        content: content
      })
    })

    // fullWidth = $(".outer").width()
  })

  // s.doResize = function(e){
  //   if(s.resize){
  //     var x = e.originalEvent.x
  //     , dx = x - m_pos
  //     , newWidth = origWidth + dx

  //     m_pos = x

  //     if(!isNaN(newWidth)){
  //       if(newWidth >=10){
  //         // Need to calulate percent correctly here
  //         var diff = dx/origWidth
  //         , perc = 1 + diff
  //         , max = s.networkData[currPanelIndex].amount*100/s.networkData[currPanelIndex].value
  //         , min = s.networkData[currPanelIndex].amount*.3
  //         // l(perc)
  //         // l(pixi.round(perc*100, 5)/100)

  //         origWidth = newWidth
  //         s.networkDataSec[currPanelIndex].amount = Math.min( max, s.networkDataSec[currPanelIndex].amount*perc )
  //         s.networkDataSec[currPanelIndex].amount = Math.max( min, s.networkDataSec[currPanelIndex].amount )
  //         // s.networkDataSec[currPanelIndex].amount = Math.min( max, s.networkDataSec[currPanelIndex].amount*(pixi.round(perc*100, 5)/100) )
          
  //         percForPolygon = s.networkDataSec[currPanelIndex].amount/max
  //         percForPolygon = parseFloat(percForPolygon.toFixed(2))*100
  //         percForPolygon = Math.max(30, percForPolygon)

  //         pixi.redrawDraggablePoint(
  //           currPanelIndex, 
  //           percForPolygon
  //         )
  //       }else{
  //         s.finishResize()
  //       }
  //     }
  //   }
  // }

  // s.finishResize = function(){
  //   s.resize = false
  //   origWidth = null

  //   // l("Hide popup")
  //   s.showPopup = false
  //   $timeout(function(){
  //     s.popupPos = "right"    
  //   }, 500)
  // }

  // s.onPanelDrag = function(e, idx, fromTouch){
  //   s.resize = true
  //   currPanelIndex = idx
  //   currPanel = $(e.currentTarget)
  //   // l(origWidth)
  //   if(!origWidth){
  //     // l("New width taken")
  //     origWidth = angular.copy(currPanel.width())
  //   }

  //   // if(fromTouch){
  //   //   var rect = e.target.getBoundingClientRect()
  //   //   var x = e.targetTouches[0].pageX - rect.left
  //   //   var y = e.targetTouches[0].pageY - rect.top
  //   //   if (origWidth - x < BORDER_SIZE) {
  //   //     m_pos = x

  //   //     // l("t" + (idx + 1), "Show popup")
  //   //     s.popupContent = $("#t" + (idx + 1)).find(".ctn-drag").html()
  //   //     s.showPopup = true
  //   //     s.popupPos = "left"
  //   //   }
  //   // } else {      
  //   // }
  //   if (origWidth - e.offsetX < BORDER_SIZE) {
  //     m_pos = e.x

  //     // l("t" + (idx + 1), "Show popup")
  //     s.popupContent = $("#t" + (idx + 1)).find(".ctn-drag").html()
  //     s.showPopup = true
  //     s.popupPos = "left"
  //   }
  // }

  // s.toggleOpt = function(){
  //   s.showOptimizer = !s.showOptimizer
  //   pixi.setCtnCopy(s.showOptimizer)
  // }   

  window.onresize = function(){
    pixi.resize()
  }

  s.$on('showPopup', function(e, v){
    // l(e, v)
    if(pixi.isMobile()){
      // l(v.idx)
      switch(v.idx){
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          s.popupPos = "top"
        break;

        default: 
          s.popupPos = "bottom"
        break;
      }
    } else s.popupPos = "right"

    s.popupContent = $("#nt" + v.idx).find(".ctn-drag").html()
    s.showPopup = true
    s.$apply()
  })

  s.$on('hidePopup', function(e, v){
    s.showPopup = false
    s.$apply()
    // $timeout(function(){
    //   if(pixi.isMobile()){
    //     s.popupPos = "top"
    //   }else s.popupPos = "right"    
    // }, 500)
  })

  function barsFunction(){
    $(".handle").on('mousedown touchstart', function(e){
      currPanelIndex = $(".handle").index(this)

      handle = {
        x : e.pageX,
        p : $(this).parent(),
        pw: $(this).parent().width()
      }
      s.popupPos = "left"
      
      if (e.originalEvent.touches){       
        e.preventDefault()
        var evt = e.originalEvent.touches[0]
        handle.x = evt.pageX
        if(evt.clientY <= window.innerHeight/2){          
          s.popupPos = "bottom"
        } else s.popupPos = "top"
      }

      s.popupContent = $("#t" + (currPanelIndex + 1)).find(".ctn-drag").html()
      s.showPopup = true
      s.$apply()
    })
        
    $(document).on({
      'mousemove touchmove':function(e){
        if(handle) {
          var max = s.networkData[currPanelIndex].amount*100/s.networkData[currPanelIndex].value
          , min = s.networkData[currPanelIndex].amount*.3
          , oldWidth = handle.p.width()
          , newWidth
          , diff
          , perc

          if (e.originalEvent.touches){ // Mobile
            newWidth = handle.pw + (e.originalEvent.touches[0].pageX - handle.x)
          }else{ // Desktop
            newWidth = handle.pw + (e.pageX - handle.x)
          }

          diff = (newWidth - oldWidth)/oldWidth
          perc = 1 + diff

          // l(currPanelIndex, max, min, newWidth, oldWidth, perc)
          s.networkDataSec[currPanelIndex].amount = Math.min( max, s.networkDataSec[currPanelIndex].amount*perc )
          s.networkDataSec[currPanelIndex].amount = Math.max( min, s.networkDataSec[currPanelIndex].amount )
          s.$apply()

          // handle.p.width(newWidth) -> width set using angular in template
          percForPolygon = s.networkDataSec[currPanelIndex].amount/max
          percForPolygon = parseFloat(percForPolygon.toFixed(2))*100
          percForPolygon = Math.max(30, percForPolygon)

          pixi.redrawDraggablePoint(
            currPanelIndex, 
            percForPolygon
          )
        }

        e.preventDefault()
      },
      'mouseup touchend':function(e){
        if(handle) {          
          handle = null
          s.$apply(function(){          
            s.showPopup = false
            // $timeout(function(){
            //   s.popupPos = "right"    
            // }, 500)
          })
          e.preventDefault()
        }
      }
    })

    if(pixi.isMobile()){
      $("#exampleModal").modal("show")
    }
  }

  $(function() {
    setTimeout(function(){
      barsFunction()
    }, 1000)
  })
  
})
.filter('trustedHTML', function($sce){
  return function(text) { return $sce.trustAsHtml(text) }
})