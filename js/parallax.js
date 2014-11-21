$(function(){
	var      $window = $( window )
	  ,        $body = $( 'body' )
	  , $bodyAndHTML = $body.add( 'html' )
	  ,     $content = $( '#content' )
	  ,    $sections = $content.find( 'section' )
	  ,    $scroller = $( '#mock-scroller' )
	  ,  fScrPercent = 0
	  ,   aAnimProps = [ 'opacity', 'left', 'top', 'width', 'height', 'background-position' ]
	  ,        sHash = location.hash
	  ,  bAllowAnims = !~location.href.indexOf( 'noanims' )
	  ,  aAnimations = []
	  ,    webkitCSS = document.body.style[ 'webkitTransform' ] !== undefined
	  ,       mozCSS = document.body.style[ 'MozTransform'    ] !== undefined
	  ,        msCSS = document.body.style[ 'msTransform'     ] !== undefined
	  , iAnimTimeout, iWindowHeight, sLastHash, iMaxHeight, iWinScrTop, iLastScrTime, iScrTimeout, sWinSize, kinetics
	  ;

	// find all animatable nodes and store properties
	$sections.each( function( ix ){
		var $sec = $sections.eq( ix );
		$sec.data( '$pNodes' , $sec.find( '.animate' ) );
		$sec.data( 'bSection', true );

		$sec.add( $sec.data( '$pNodes' ) ).each( function(){
			var $this = $( this )
			  , oData = $this.data()
			  ;

			oData.iPause    = 0 | $this.attr( 'anim-pause' );
			oData.bDetached = !!~'1 true'.indexOf( $this.attr( 'anim-detached' ) );
			oData.fSpeed    = parseFloat( $this.attr( 'anim-speed' ) ) || 1;
			oData.onFocus   = $this.attr( 'anim-focus-handler' );
			oData.onBlur    = $this.attr( 'anim-blur-handler' );
		} );

		// remove the section from the DOM
		$sec.detach();
	} );

	// converts a unit string to px
	function parseUnit( vVal, $node, sValFn ){
		var  aVal = /(-?\d+)(.*)/.exec( vVal )
		  , fUnit = parseFloat( aVal[ 1 ] )
		  , sUnit = aVal[ 2 ]
		  ;

		switch( sUnit ){
			case '':
			case 'px':
				return fUnit;

			case '%':
				return $node[ sValFn ]()  * fUnit / 100;

			default:
				throw new Error( 'Unexpected unit type: ' + sUnit );
				return;
		}
	}

	// reads all listed css properties from $node with sClass applied
	function readCSSProps( $node, sClass ){
		var oObj = {}
		  , i, l, vPropVal, sProp
		  ;

		$node.addClass( sClass ).removeAttr( 'style' );

		for( i=0, l=aAnimProps.length; i<l; i++ ){
			sProp = aAnimProps[i];
			switch( sProp ){
				// numeric css
				case 'opacity':
					vPropVal = 0 | $node.css( sProp );
					break;

				// numeric position
				case 'left':
				case 'top':
					vPropVal = $node.position()[ sProp ];
					break;

				// numeric size
				case 'width':
				case 'height':
					vPropVal = $node[ 'outer' + sProp.substr( 0, 1 ).toUpperCase() + sProp.substr( 1 ) ]();
					break;

				// split numeric properties
				case 'background-position':
					vPropVal = ( $node.css( sProp ) || '0 0' ).split( ' ' );
					vPropVal[0] = parseUnit( vPropVal[0], $node, 'outerWidth'  );
					vPropVal[1] = parseUnit( vPropVal[1], $node, 'outerHeight' );
					break;
			}

			oObj[ sProp ] = vPropVal;
		}

		$node.removeClass( 'start focus to end' );

		return oObj;
	}

	// determines if two values are equal if they are basic types or arrays
	function eq( vVal1, vVal2 ){
		var i, l;

		if( vVal1 === vVal2 ){ return true; }
		if( typeof vVal1 !== typeof vVal2 ){ return false; }

		if( vVal1.length && vVal1.splice && vVal2.length && vVal2.splice ){
			if( vVal1.length != vVal2.length ){ return false; }

			for( i=0, l=vVal1.length; i<l; i++ ){
				if( !eq( vVal1[i], vVal2[i] ) ){
					return false;
				}
			}

			return true;
		}

		return false;
	}

	// returns properties that differ between two objects
	function propDiff( oProps1, oProps2 ){
		var oDiff = {}
		  , n, bProp;

		for( n in oProps2 ){
			if( !eq( oProps1[n], oProps2[n] ) ){
				oDiff[n] = bProp = [ oProps1[n], oProps2[n] ];
			}
		}

		return bProp && oDiff;
	}

	// given a node, top & stage, stores an animation for the node
	function addDiffAnimation( $node, iTop, iStage, iAnimLength ){
		var      stages = [ 'start', 'focus', 'to', 'end' ]
		  , iStartStage = iStage - 1
		  ,   sEndStage = stages[ iStage ]
		  ,   oPropsEnd = readCSSProps( $node, sEndStage )
		  ,       oData = $node.data()
		  ,  bPreDefLen = !!iAnimLength
		  , oPropDiff, n, iDiff
		  ;

		if( !iAnimLength ){ iAnimLength = 0; }

		// get the diff between this stage and the prior one
		oPropDiff = propDiff( readCSSProps( $node, stages[ iStartStage ] ), oPropsEnd );

		if( !oPropDiff ){ return 0; }

		for( n in oPropDiff ){
			iDiff = Math.abs( oPropDiff[n][1] - oPropDiff[n][0] );
			if( !bPreDefLen && ( iDiff > iAnimLength ) ){ iAnimLength = iDiff; }
		}

		aAnimations.push( {
			     $node : $node
			,   oProps : oPropDiff
			,     iTop : iTop
			,  iBottom : iTop + iAnimLength
			, bSection : oData.bSection
		} );

		return oData.bDetached ? 0 : iAnimLength;
	}

	// window loaded or re-sized, re-calculate all dimensions
	function measureAnimations(){
		var         iTop = 0
		  ,  iStartTimer = +new Date()
		  , iLastSection = $sections.length - 1
		  ,  iPageHeight = 0
		  , oAnim, oData
		  ;

		aAnimations = window.aAnimations = [];
		$scroller.css( 'height', 10000 );

		// add animations for each section & .animate tag in each section
		$sections.each( function( ix ){
			var       $sec = $( this )
			  ,      oData = $sec.data()
			  ,    $pNodes = oData.$pNodes
			  , iSecHeight = 0
			  ,  iMaxPause = oData.iPause
			  , i, l, iAnimSize, $pNode
			  ;

			oData.startsAt = iTop;

			// append section to content and reset position
			$sec
				.css({ top : '', visibility: 'hidden' })
				.appendTo( $content );

			if( ix ){
				iSecHeight = addDiffAnimation( $sec, iTop, 1 );
			}

			for( i=0, l=$pNodes.length; i<l; i++ ){
				$pNode = $pNodes.eq( i );

				if( bAllowAnims ){
					iMaxPause = Math.max(
						  iMaxPause
						,             addDiffAnimation( $pNode, iTop                                     , 1, iSecHeight )
						, iAnimSize = addDiffAnimation( $pNode, iTop + iSecHeight + iMaxPause            , 2, iSecHeight )
						,             addDiffAnimation( $pNode, iTop + iSecHeight + iMaxPause + iAnimSize, 3, iSecHeight )
					);
				}
			}

			if( ix ){
				iTop += iMaxPause; // Math.max( iSecHeight, iMaxPause, $sec.outerHeight() );
			}

			addDiffAnimation( $sec, iTop + iSecHeight, 2 );

			if( ix < iLastSection ){
				addDiffAnimation( $sec, iTop + iSecHeight, 3 );
			}

			$sec.detach().css({ visibility: 'visible' });

			oData.endsAt   = iTop += iSecHeight;
			oData.bVisible = false;
		} );

		// wipe start/end positions on sections
		for( i=0, l=$sections.length; i<l; i++ ){
			$sections.eq(i).data().iTop    = Infinity;
			$sections.eq(i).data().iBottom = -Infinity;
		}

		// post-process animations
		for( i=0, l=aAnimations.length; i<l; i++ ){
			oAnim = aAnimations[i];

			if( oAnim.iBottom > iPageHeight ){
				iPageHeight = oAnim.iBottom;
			}

			if( oAnim.bSection ){
				oData = oAnim.$node.data();
				if( oAnim.iTop < oData.iTop ){
					oData.iTop = oAnim.iTop;
				}

				if( oAnim.iBottom > oData.iBottom ){
					oData.iBottom = oAnim.iBottom;
				}
			}
		}
		iPageHeight = Math.max( iPageHeight, ++$sections.last().data().iBottom );
		$scroller.css( 'height', ( iMaxHeight = iPageHeight ) + iWindowHeight );

		$window.trigger( 'animations-added', { animations: aAnimations } );
	}

	function onResize(){
		var pTop = ( iWinScrTop / iMaxHeight ) || 0;

		measureAnimations();
		$window.trigger( 'post-resize-anim' );
		$window.scrollTop( pTop * iMaxHeight );
		onScroll();

		kinetics
			.adjustRange( iMaxHeight )
			.setPosition( pTop * iMaxHeight );
	}

	function singlePartialCSSProp( iScrTop, oAnim, oProp ){
		return ( iScrTop - oAnim.iTop ) / ( oAnim.iBottom - oAnim.iTop ) * ( oProp[1] - oProp[0] ) + oProp[0];
	}

	function partialCSSProp( iScrTop, oAnim, oProp ){
		if( oProp[0].splice ){
			return $.map( oProp[0], function( nul, ix ){
				return ( 0|singlePartialCSSProp( iScrTop, oAnim, [ oProp[0][ix], oProp[1][ix] ] ) ) + 'px';
			} ).join( ' ' );
		}else{
			return singlePartialCSSProp( iScrTop, oAnim, oProp );
		}
	}

	function onScrollHandler(){
		var   cDate = +new Date()
		  , iScrTop = $window.scrollTop()
		  ,   iDiff = cDate - iLastScrTime
		  ;

		iLastScrTime = cDate;
		if( iScrTimeout ){
			clearTimeout( iScrTimeout );
			iScrTimeout = 0;
		}

		// last tick was either recent enough or a while ago.  pass through
		if( ( iDiff > 200 ) || ( iDiff < 50 ) ){
			onScroll( iScrTop );
		}else{

			// stupid browser scrolling is too slow, fix it
			var iLastTop = iWinScrTop
			  , iScrDiff = iScrTop - iLastTop
			  ;	

			function nextScrollTick(){
				var   now = +new Date()
				  , iStep = ( now + 30 - cDate ) / iDiff;
				
				if( iStep > 1 ){ iStep = 1; }

				onScroll( iLastTop + iScrDiff * iStep )

				if( iStep < 1 ){
					iScrTimeout = setTimeout( nextScrollTick, 30 );
				}
			}
			nextScrollTick();
		}
	}

	function onScroll( iScrTop ){
		var bChangedLoc = false
		  , i, l, oAnim, $sec, oData
		  , $node, sSecId, n, oCssProps, oProps, iCurScr, sState
		  ;

		iScrTop || ( iScrTop = $window.scrollTop() );

		iWinScrTop = iScrTop;

		if( iScrTop < 0 ){ iScrTop = 0; }
		if( iScrTop > iMaxHeight ){ iScrTop = iMaxHeight; }

		// hide/show sections
		for( i=0, l=$sections.length; i<l; i++ ){
			$sec  = $sections.eq(i);
			oData = $sec.data();

			if( ( oData.iTop <= iScrTop ) && ( oData.iBottom >= ( iScrTop ) ) ){
				if( !oData.bVisible ){
					$sec.appendTo( $content );
					oData.bVisible = true;
				}
				if( !bChangedLoc ){
					if( sLastHash != ( sSecId = $sec.attr( 'id' ).split( '-' ).pop() ) ){
						location.replace( '#' + ( sLastHash = sSecId ) );
						$body.prop( 'class', $body.prop( 'class' ).replace( /(?: |^)section-[^ ]+/g, '' ) ).addClass( 'section-' + sSecId );
					}
					bChangedLoc = true;
				}
			}else{
				if( oData.bVisible ){
					$sec.detach();
					oData.bVisible = false;
				}
			}
		}

		for( i=0, l=aAnimations.length; i<l; i++ ){
			oAnim   = aAnimations[i];
			$node   = oAnim.$node;
			iCurScr = iScrTop;

			if( ( oAnim.iTop > iCurScr ) || ( oAnim.iBottom < iCurScr ) ){
				sState = oAnim.lastState;
				oAnim.lastState = 'disabled';

				// animation is newly disabled
				if( sState === 'enabled' ){
					iCurScr = ( oAnim.iTop > iCurScr ) ? oAnim.iTop : oAnim.iBottom;
				}else{
					continue;
				}
				
			}else{
				oAnim.lastState = 'enabled';
			}

			// in the middle of an animation
			oCssProps = {};
			oProps = oAnim.oProps;
			for( n in oProps ){
				oCssProps[ n ] = partialCSSProp( iCurScr, oAnim, oProps[n] );
				//oCssProps[n] = 0|-( ( iScrTop - oProps[n][0] ) / ( oProps[n][1] - oProps[n][0] ) * ( oProps[n][1] - oProps[n][0] ) + oProps[n][0] );
			}
			$node.css( hardwareCSSTransform( oCssProps ) );
		}
	}

	function hardwareCSSTransform( props ){
		if( props.top!=null || props.left!=null ){
			if( webkitCSS ){
				props.webkitTransform = 'translate3d(' + ( props.left || 0 ) + 'px, ' + ( props.top || 0 ) + 'px, 0)';

				if( null != props.top  ){ props.top  = 0; }
				if( null != props.left ){ props.left = 0; }
			}

			if( mozCSS || msCSS ){
				props[ mozCSS ? 'MozTransform' : 'msTransform' ] = ( props.top ? 'translateY(' + props.top + 'px)' : '' ) + ( props.left ? 'translateX(' + props.left + 'px)' : '' );
				
				if( null != props.top  ){ props.top  = 0; }
				if( null != props.left ){ props.left = 0; }
			}
		}

		return props;
	}

	window.getAnimationController = function( sSelector ){
		var oAnim, i, l;

		for( i=0, l=aAnimations.length; i<l; i++ ){
			if( aAnimations[i].$node.is( sSelector ) ){
				oAnim = aAnimations[i];
				break;
			}
		}

		if( !oAnim ){
			throw new Error( 'no animation matches selector ' + sSelector );
		}

		return {
			scrollTo: function( iTop ){
				iTop += oAnim.iTop;
				iTop = Math.max( oAnim.iTop, Math.min( oAnim.iBottom, iTop ) );

				$bodyAndHTML.scrollTop( iTop );
			}

			, scrollBy : function( iTop ){
				iTop = iWinScrTop + iTop;
				iTop = Math.max( oAnim.iTop, Math.min( oAnim.iBottom, iTop ) );

				$bodyAndHTML.scrollTop( iTop );
			}
		}
	}

	window.scrollToSection = function( sSec, immediate ){
		var $sect = $sections.filter( '#story-' + sSec )
		  , oData = $sect.data()
		  ,   top = oData.iTop + ( $sections[0] === $sect[0] ? 0 : iWindowHeight + 1 );

		if( immediate ){
			$bodyAndHTML.scrollTop( top );
		}else{
			$bodyAndHTML.animate({ scrollTop: top }, 1000);
		}
	}

	if( sHash ){
		setTimeout( function(){
			scrollToSection( sHash.substr( 1 ), true );
		}, 100 );
	}

	/* touch move kinetics */
	kinetics = new Kinetics( window );
	window.kinetics = kinetics;
	kinetics.bind( 'move', function( ev, y ){
		onScroll( y );
	} );


	$window
		/**
		 * On resize:
		 * 
		 * - save window height for onscroll calculations
		 * - re-calculate the height of all the <section> elements
		 * - adjust top position so that it's at the same %, not same px
		 **/
		.bind( 'resize', function(){
			// patch IE which keeps triggering resize events when elements are resized
			var sCurWinSize = $window.width() + 'x' + $window.height();
			if( sCurWinSize === sWinSize ){ return; }
			sWinSize = sCurWinSize;

			if( iAnimTimeout ){ clearTimeout( iAnimTimeout ); }
			iAnimTimeout = setTimeout( onResize, 50 );

			iWindowHeight = $window.height();
		})
		.trigger( 'resize' )
		.bind( 'scroll', onScrollHandler );
});