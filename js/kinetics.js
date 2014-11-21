~function(){
	function KineticModel() {
		var min          = 0
		  , max          = 1000
		  , lastPosition = 0
		  , velocity     = 0
		  , timestamp    = Date.now()
		  , timeConstant, ticker
		  ;

		function clamped(pos) {
			return (pos > max) ? max : (pos < min) ? min : pos;
		}

		function nop() {}

		this.duration       = 1950;
		this.position       = 0;
		this.updateInterval = 1000 / 60;

		this.onPositionChanged = nop;
		this.onScrollStarted   = nop;
		this.onScrollStopped   = nop;


		this.setRange = function (start, end) {
			min = start;
			max = end;
		};

		this.getRange = function () {
			return {
				  minimum : min
				, maximum : max
			};
		};

		this.setPosition = function (pos) {
			var self = this;

			this.position = clamped(pos);
			this.onPositionChanged(this.position);

			if (!ticker) {
				// Track down the movement to compute the initial
				// scrolling velocity.
				ticker = window.setInterval(function () {
					var now = Date.now(),
						elapsed = now - timestamp,
						v = (self.position - lastPosition) * 1000 / elapsed;

					// Moving average to filter the speed.
					if (ticker && elapsed >= self.updateInterval) {
						timestamp = now;
						if (v > 1 || v < -1) {
							velocity = 0.2 * (velocity) + 0.8 * v;
							lastPosition = self.position;
						}
					}
				}, this.updateInterval);
			}
		};

		this.resetSpeed = function () {
			velocity     = 0;
			lastPosition = this.position;

			window.clearInterval(ticker);
			ticker = null;
		};

		this.release = function () {
			var           self = this
			  ,      amplitude = velocity
			  , targetPosition = this.position + amplitude
			  ,   timeConstant = 1 + this.duration / 6
			  ,      timestamp = Date.now()
			  ;

			window.clearInterval(ticker);
			ticker = null;

			if (velocity > 1 || velocity < -1) {

				this.onScrollStarted(self.position);

				window.clearInterval(ticker);
				ticker = window.setInterval(function () {
					var elapsed = Date.now() - timestamp;

					if (ticker) {
						self.position = targetPosition - amplitude * Math.exp(-elapsed / timeConstant);
						self.position = clamped(self.position);
						self.onPositionChanged(self.position);

						if (elapsed > self.duration) {
							self.resetSpeed();
							self.onScrollStopped(self.position);
						}
					}
				}, this.updateInterval);
			}
		};
	}

	function Kinetics( el ){
		var scroller = new KineticModel()
		  , pressed  = false
		  , refPos   = 0
		  , $watcher = $( '<div></div>' );

		scroller.onPositionChanged = function( y ){
			$watcher.trigger( 'move', y );
		};

		$watcher.adjustRange = function( max ){
			scroller.setRange( 0, max );

			return $watcher
		}

		$watcher.setPosition = function( y ){
			scroller.position = y;

			return $watcher;
		}

		function tap( e ){
			pressed = true;

			if (e.targetTouches && (e.targetTouches.length >= 1)) {
				refPos = e.targetTouches[0].clientY;
			} else {
				refPos = e.clientY;
			}

			scroller.resetSpeed();

			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		function untap( e ){
			pressed = false;

			scroller.release();

			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		function drag( e ){
			var pos, delta;

			if (!pressed) {
				return;
			}

			if (e.targetTouches && (e.targetTouches.length >= 1)) {
				pos = e.targetTouches[0].clientY;
			} else {
				pos = e.clientY;
			}

			delta = refPos - pos;
			if (delta > 2 || delta < -2) {
				scroller.setPosition( scroller.position += delta );
				refPos = pos;
			}

			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		if( el.addEventListener ){
			el.addEventListener( 'touchstart', tap   );
			el.addEventListener( 'touchmove' , drag  );
			el.addEventListener( 'touchend'  , untap );
		}

		return $watcher;
	}

	window.Kinetics = Kinetics;
}();