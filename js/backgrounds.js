$(function(){
	var aBackgrounds = $( 'section > .bg' )
	  ,     $content = $( '#content' )
	  ;

	function measureBackgrounds(){
		var i, l, oData, $item, $section, fRW, fRH;

		for( i=0, l=aBackgrounds.length; i<l; i++ ){
			$item    = aBackgrounds.eq(i);
			oData    = $item.data();
			$section = $item.parent();
			$section.appendTo( $content );

			if( !oData.width ){
				oData.width  = $item.width();
				oData.height = $item.height();
			}

			fRW = $section.width()  / oData.width;
			fRH = $section.height() / oData.height;

			$item.css( { width: 'auto', height: 'auto' } ).css( fRW > fRH ? 'width' : 'height', '100%' );

			$section.detach();
		}
	}

	$( window ).bind( 'post-resize-anim', measureBackgrounds );
});