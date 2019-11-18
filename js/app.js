var l = console.log.bind(window.console)
	, app = angular.module('app', ['pascalprecht.translate'], function ($locationProvider) {
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		})
	})

app.config(function ($translateProvider) {
	$translateProvider.preferredLanguage('de')
	$translateProvider.fallbackLanguage('en')
	$translateProvider.useStaticFilesLoader({
		prefix: 'data/', suffix: '.json'
	})
	$translateProvider.useSanitizeValueStrategy('sce')
})

app.controller('ctrl', function($scope, $location, $translate, $timeout, pixi){
  var msie = window.document.documentMode
  , s = $scope

  if(angular.isDefined(msie)){
    s.isSupported = false
    l(s.isSupported)
    return
  }

  var currPanelIndex
  , url
  , sum = 0
  , handle = null
	, radii = [0, 20, 40, 60, 80, 100]

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
	
	WebFont.load({
		custom: { families: ['bs-m'] },
		active: function() {
			setTimeout(function () {
				radii.forEach(function (obj) {
					// Percent Marks
					pixi.drawPercent(obj)	
				})
			}, 500)
		}
	})

	var lang = $location.search().lang
	if (angular.isDefined(lang) && lang === "en"){
		url = 'data/en/data-points.json'
		// s.popoverFile = 'data/en/popover.html'
	} else{
		lang = 'de'
		url = 'data/de/data-points.json'
		// s.popoverFile = 'data/de/popover.html'
	}
	$translate.use(lang)
	
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
		radii.forEach(function(obj){ 

			// Main Polygon Rings
			var p = pixi.getPoints(2*obj, s.networkData.length)
			pixi.drawPolygon(p)

			if(obj === 100){
				// Draw lines from center to end points, edge dots
				pixi.drawLinesFromCenterAndEdgeDots(p)
			}
		})

		// Indicators
		if(pixi.isMobile()){
			var p = pixi.getPoints(100, s.networkData.length)
		} else{
			var p = pixi.getPoints(220, s.networkData.length)
		}
    pixi.drawIndicators(p, s.networkData, lang)
    l("ind drawn")
    if(lang === 'en') s.popoverFile = 'data/en/popover.html'
    else s.popoverFile = 'data/de/popover.html'
    
		// Draw original network polygon
		var dp = pixi.getDataPoints(s.networkData)
		pixi.drawPolygon(dp, null, null, 5, 0x73b657)
		pixi.drawPoints(dp, pixi.isMobile() ? 12 : 10, 0x73b657)

		// Draw second polygon to be dragged
		pixi.drawDraggablePolygon(s.networkDataSec, pixi.isMobile() ? 12 : 10, 0x166c9d)
		
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
  
  s.$on('$includeContentLoaded', function(){
    $timeout(function(){
      l("content loaded")
      // l($('[data-toggle="popover"]').length)
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
    
      pixi.isMobile() && $("#exampleModal").modal("show")				
      s.showLoader = false
      // s.$apply()
    }, 500)
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