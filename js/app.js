var l = console.log.bind(window.console)
, app = angular.module('app', [])

app.controller('ctrl', function($scope, $timeout, pixi){
  var msie = window.document.documentMode
  , s = $scope

  if(angular.isDefined(msie)){
    s.isSupported = false
    l(s.isSupported)
    return
  }

  var BORDER_SIZE = 10  
  , m_pos = 0
  , currPanel
  , currPanelIndex
  , newWidth
  , origWidth = null
  // , url = 'data/data-points.json'
  , url = 'data/data-points-new.json'
  , sum = 0
  , handle = null

  s.isSupported = true
  s.showPopup = false
  s.popupPos = "right"
  s.popupContent = ""
  s.resize = false
  s.showLoader = true
  s.overlay = false
  l(s.isSupported)

  s.dividers = { 
    d: 4000,
    m: 4000,
  }

  if(pixi.isMobile()){
    s.currDivider = s.dividers.m
  } else{
    s.currDivider = s.dividers.d
  }
  
  pixi.get(url).then(function(res){
    // l(res)
    s.networkData = res.data
    
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
      pixi.drawPercent(obj)
      // var el = $('<div class="perc">')
      // // el.html(obj + " %")
      // // el.html(obj / 10 + ".0")
      // el.html(obj / 10)
      // if(pixi.isMobile()){
      //   el.css({
      //     transform: "translate(" + (w/2 - 50) + "px, " + (h/2 - 1.4*obj - 20) + "px)",
      //     transformOrigin: "0%"      
      //   })
      // }else{
      //   el.css({
      //     transform: "translate(" + (w/2 - 50) + "px, " + (h/2 - 2*obj - 20) + "px)",
      //     transformOrigin: "0%"      
      //   })
      // }
      // canvas.append(el)

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
    if(pixi.isMobile()){
      var p = pixi.getPoints(100, s.networkData.length)
    } else{
      var p = pixi.getPoints(220, s.networkData.length)
    }
    // pixi.drawPoints(p, 2)
    pixi.drawIndicators(p, s.networkData)
    
    // Draw original network polygon
    var dp = pixi.getDataPoints(s.networkData)
    pixi.drawPolygon(dp, null, null, 5, 0x00aac9)
    pixi.drawPoints(dp, pixi.isMobile()?20:12, 0x00aac9)

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
        trigger: 'focus',
        container: 'body',
        placement: 'bottom',
        html: true,
        content: content
      })
    })
  })

  window.onresize = function(){
    if(!pixi.isMobile()){    
      pixi.resize()
      $(".canvas-ctn .ind").remove()
      var p = pixi.getPoints(220, s.networkData.length)
      pixi.drawIndicators(p, s.networkData)
      $('[data-toggle="popover"]').each(function(){
        var popCtn = $('#' + $(this).data('id'))
        , content = popCtn.find(".ctn-click").length ? popCtn.find(".ctn-click").html() : popCtn.html()

        $(this).popover({
          trigger: 'focus',
          container: 'body',
          placement: 'bottom',
          html: true,
          content: content
        })
      })
    }
  }

  s.$on('showPopup', function(e, v){
    // l(e, v)
    if(pixi.isMobile()){
      // l(v.idx)
      // switch(v.idx){
      //   case 3:
      //   case 4:
      //   case 5:
      //   case 6:
      //   case 7:
      //     s.popupPos = "top"
      //   break;

      //   default: 
      //     s.popupPos = "bottom"
      //   break;
      // }
      s.popupPos = "top"      
    } else s.popupPos = "right"

    s.popupContent = $("#nt" + v.idx).find(".ctn-drag").html()
    s.showPopup = true
    s.$apply()
  })

  s.$on('hidePopup', function(e, v){
    s.showPopup = false
    s.$apply()
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
        // if(evt.clientY <= window.innerHeight/2){          
        //   s.popupPos = "bottom"
        // } else s.popupPos = "top"
        s.popupPos = "top"
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
          s.networkDataSec[currPanelIndex].amount = Math.round( s.networkDataSec[currPanelIndex].amount )
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
          })
          e.preventDefault()
        }
      }
    })

    if(pixi.isMobile()){
      // $("#exampleModal").modal("show")
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
.filter('noHyphen', function(){
  return function(text) { 
    return text.replace(/-/g, '')
  }
})