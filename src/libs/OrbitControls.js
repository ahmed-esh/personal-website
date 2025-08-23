/**
 * Simple OrbitControls for Three.js
 * Basic mouse/touch controls for orbiting around a target
 */

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	this.enableDamping = false;
	this.dampingFactor = 0.05;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 1.0;

	// Mouse buttons
	this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();

	//
	// public methods
	//

	this.getPolarAngle = function () {
		return spherical.phi;
	};

	this.getAzimuthalAngle = function () {
		return spherical.theta;
	};

	this.saveState = function () {
		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
	};

	this.reset = function () {
		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.update();
	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().invert();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.enableDamping ) {
				spherical.theta += sphericalDelta.theta * scope.dampingFactor;
				spherical.phi += sphericalDelta.phi * scope.dampingFactor;
			} else {
				spherical.theta += sphericalDelta.theta;
				spherical.phi += sphericalDelta.phi;
			}

			// restrict theta to be between desired limits
			var min = scope.minAzimuthAngle;
			var max = scope.maxAzimuthAngle;

			if ( isFinite( min ) && isFinite( max ) ) {
				if ( min < - Math.PI ) min += 2 * Math.PI; else if ( min > Math.PI ) min -= 2 * Math.PI;
				if ( max < - Math.PI ) max += 2 * Math.PI; else if ( max > Math.PI ) max -= 2 * Math.PI;

				if ( min <= max ) {
					spherical.theta = Math.max( min, Math.min( max, spherical.theta ) );
				} else {
					spherical.theta = ( spherical.theta > ( min + max ) / 2 ) ?
						Math.max( min, Math.min( max, spherical.theta ) ) :
						Math.max( min, Math.min( max, spherical.theta ) );
				}
			}

			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );
			spherical.makeSafe();

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			if ( scope.enableDamping === true ) {
				scope.target.addScaledVector( panOffset, scope.dampingFactor );
			} else {
				scope.target.add( panOffset );
			}

			offset.setFromSpherical( spherical );

			// rotate offset back from "y-axis-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {
				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );
				panOffset.multiplyScalar( 1 - scope.dampingFactor );
			} else {
				sphericalDelta.set( 0, 0, 0 );
				panOffset.set( 0, 0, 0 );
			}

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x) = 1 - x^2 / 2

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;
			}

			return false;
		};
	}();

	this.dispose = function () {
		// Clean up event listeners
		scope.domElement.removeEventListener( 'contextmenu', onContextMenu );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel );
		scope.domElement.removeEventListener( 'touchstart', onTouchStart );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove );
		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'mouseup', onMouseUp, false );
	};

	//
	// internals
	//

	var scope = this;

	var EPS = 0.000001;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Touch fingers
	this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

	// State constants
	var STATE = {
		NONE: - 1,
		ROTATE: 0,
		DOLLY: 1,
		PAN: 2,
		TOUCH_ROTATE: 3,
		TOUCH_PAN: 4,
		TOUCH_DOLLY_PAN: 5,
		TOUCH_DOLLY_ROTATE: 6
	};

	var state = STATE.NONE;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getZoomScale() {
		return Math.pow( 0.95, scope.zoomSpeed );
	}

	function rotateLeft( angle ) {
		sphericalDelta.theta -= angle;
	}

	function rotateUp( angle ) {
		sphericalDelta.phi -= angle;
	}

	var panLeft = function () {
		var v = new THREE.Vector3();
		return function panLeft( distance, objectMatrix ) {
			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );
			panOffset.add( v );
		};
	}();

	var panUp = function () {
		var v = new THREE.Vector3();
		return function panUp( distance, objectMatrix ) {
			if ( scope.screenSpacePanning === true ) {
				v.setFromMatrixColumn( objectMatrix, 1 );
			} else {
				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );
			}
			v.multiplyScalar( distance );
			panOffset.add( v );
		};
	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {
		var offset = new THREE.Vector3();
		return function pan( deltaX, deltaY ) {
			var element = scope.domElement;

			if ( scope.object.isPerspectiveCamera ) {
				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we use only clientHeight here so aspect ratio does not distort speed
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
			} else if ( scope.object.isOrthographicCamera ) {
				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );
			} else {
				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;
			}
		};
	}();

	function dollyOut( dollyScale ) {
		if ( scope.object.isPerspectiveCamera ) {
			scale /= dollyScale;
		} else if ( scope.object.isOrthographicCamera ) {
			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly disabled.' );
			scope.enableZoom = false;
		}
	}

	function dollyIn( dollyScale ) {
		if ( scope.object.isPerspectiveCamera ) {
			scale *= dollyScale;
		} else if ( scope.object.isOrthographicCamera ) {
			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly disabled.' );
			scope.enableZoom = false;
		}
	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {
		rotateStart.set( event.clientX, event.clientY );
	}

	function handleMouseDownDolly( event ) {
		dollyStart.set( event.clientX, event.clientY );
	}

	function handleMouseDownPan( event ) {
		panStart.set( event.clientX, event.clientY );
	}

	function handleMouseMoveRotate( event ) {
		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		var element = scope.domElement;

		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		rotateStart.copy( rotateEnd );

		scope.update();
	}

	function handleMouseMoveDolly( event ) {
		dollyEnd.set( event.clientX, event.clientY );
		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {
			dollyOut( getZoomScale() );
		} else if ( dollyDelta.y < 0 ) {
			dollyIn( getZoomScale() );
		}

		dollyStart.copy( dollyEnd );

		scope.update();
	}

	function handleMouseMovePan( event ) {
		panEnd.set( event.clientX, event.clientY );
		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();
	}

	function handleMouseWheel( event ) {
		if ( event.deltaY < 0 ) {
			dollyIn( getZoomScale() );
		} else if ( event.deltaY > 0 ) {
			dollyOut( getZoomScale() );
		}

		scope.update();
	}

	function handleKeyDown( event ) {
		var needsUpdate = false;

		switch ( event.code ) {
			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				needsUpdate = true;
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				needsUpdate = true;
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				needsUpdate = true;
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				needsUpdate = true;
				break;
		}

		if ( needsUpdate ) {
			event.preventDefault();
			scope.update();
		}
	}

	function handleTouchStartRotate( event ) {
		if ( event.touches.length === 1 ) {
			rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		}
	}

	function handleTouchStartPan( event ) {
		if ( event.touches.length === 1 ) {
			panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		}
	}

	function handleTouchStartDolly( event ) {
		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );
	}

	function handleTouchStartDollyPan( event ) {
		if ( scope.enableZoom ) handleTouchStartDolly( event );
		if ( scope.enablePan ) handleTouchStartPan( event );
	}

	function handleTouchStartDollyRotate( event ) {
		if ( scope.enableZoom ) handleTouchStartDolly( event );
		if ( scope.enableRotate ) handleTouchStartRotate( event );
	}

	function handleTouchMoveRotate( event ) {
		if ( event.touches.length === 1 ) {
			rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

			rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

			var element = scope.domElement;

			rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

			rotateStart.copy( rotateEnd );

			scope.update();
		}
	}

	function handleTouchMovePan( event ) {
		if ( event.touches.length === 1 ) {
			panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

			pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

			scope.update();
		}
	}

	function handleTouchMoveDolly( event ) {
		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );

		dollyOut( dollyDelta.y );

		dollyStart.copy( dollyEnd );

		scope.update();
	}

	function handleTouchMoveDollyPan( event ) {
		if ( scope.enableZoom ) handleTouchMoveDolly( event );
		if ( scope.enablePan ) handleTouchMovePan( event );
	}

	function handleTouchMoveDollyRotate( event ) {
		if ( scope.enableZoom ) handleTouchMoveDolly( event );
		if ( scope.enableRotate ) handleTouchMoveRotate( event );
	}

	function handleTouchEnd( event ) {
		// no-op
	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {
		if ( scope.enabled === false ) return;

		// Prevent the browser from scrolling.
		event.preventDefault();

		// Manually set the focus since calling preventDefault above
		// prevents the browser from setting it automatically.

		scope.domElement.focus ? scope.domElement.focus() : window.focus();

		var mouseAction;

		switch ( event.button ) {
			case 0:
				mouseAction = scope.mouseButtons.LEFT;
				break;

			case 1:
				mouseAction = scope.mouseButtons.MIDDLE;
				break;

			case 2:
				mouseAction = scope.mouseButtons.RIGHT;
				break;

			default:
				mouseAction = - 1;
		}

		switch ( mouseAction ) {
			case THREE.MOUSE.ROTATE:
				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
					if ( scope.enablePan === false ) return;
					handleMouseDownPan( event );
					state = STATE.PAN;
				} else {
					if ( scope.enableRotate === false ) return;
					handleMouseDownRotate( event );
					state = STATE.ROTATE;
				}
				break;

			case THREE.MOUSE.PAN:
				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
					if ( scope.enableRotate === false ) return;
					handleMouseDownRotate( event );
					state = STATE.ROTATE;
				} else {
					if ( scope.enablePan === false ) return;
					handleMouseDownPan( event );
					state = STATE.PAN;
				}
				break;

			default:
				state = STATE.NONE;
		}

		if ( state !== STATE.NONE ) {
			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove, false );
			scope.domElement.ownerDocument.addEventListener( 'mouseup', onMouseUp, false );
		}
	}

	function onMouseMove( event ) {
		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {
			case STATE.ROTATE:
				if ( scope.enableRotate === false ) return;
				handleMouseMoveRotate( event );
				break;

			case STATE.DOLLY:
				if ( scope.enableZoom === false ) return;
				handleMouseMoveDolly( event );
				break;

			case STATE.PAN:
				if ( scope.enablePan === false ) return;
				handleMouseMovePan( event );
				break;
		}
	}

	function onMouseUp( event ) {
		if ( scope.enabled === false ) return;

		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;
	}

	function onMouseWheel( event ) {
		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();

		handleMouseWheel( event );
	}

	function onKeyDown( event ) {
		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );
	}

	function onTouchStart( event ) {
		if ( scope.enabled === false ) return;

		event.preventDefault();

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

		switch ( event.touches.length ) {
			case 1:
				switch ( scope.touches.ONE ) {
					case THREE.TOUCH.ROTATE:
						if ( scope.enableRotate === false ) return;
						handleTouchStartRotate( event );
						state = STATE.TOUCH_ROTATE;
						break;

					case THREE.TOUCH.PAN:
						if ( scope.enablePan === false ) return;
						handleTouchStartPan( event );
						state = STATE.TOUCH_PAN;
						break;

					default:
						state = STATE.NONE;
				}
				break;

			case 2:
				switch ( scope.touches.TWO ) {
					case THREE.TOUCH.DOLLY_PAN:
						if ( scope.enableZoom === false && scope.enablePan === false ) return;
						handleTouchStartDollyPan( event );
						state = STATE.TOUCH_DOLLY_PAN;
						break;

					case THREE.TOUCH.DOLLY_ROTATE:
						if ( scope.enableZoom === false && scope.enableRotate === false ) return;
						handleTouchStartDollyRotate( event );
						state = STATE.TOUCH_DOLLY_ROTATE;
						break;

					default:
						state = STATE.NONE;
				}
				break;

			default:
				state = STATE.NONE;
		}
	}

	function onTouchMove( event ) {
		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		switch ( event.touches.length ) {
			case 1:
				switch ( state ) {
					case STATE.TOUCH_ROTATE:
						if ( scope.enableRotate === false ) return;
						handleTouchMoveRotate( event );
						break;

					case STATE.TOUCH_PAN:
						if ( scope.enablePan === false ) return;
						handleTouchMovePan( event );
						break;

					default:
						state = STATE.NONE;
				}
				break;

			case 2:
				switch ( state ) {
					case STATE.TOUCH_DOLLY_PAN:
						if ( scope.enableZoom === false && scope.enablePan === false ) return;
						handleTouchMoveDollyPan( event );
						break;

					case STATE.TOUCH_DOLLY_ROTATE:
						if ( scope.enableZoom === false && scope.enableRotate === false ) return;
						handleTouchMoveDollyRotate( event );
						break;

					default:
						state = STATE.NONE;
				}
				break;

			default:
				state = STATE.NONE;
		}
	}

	function onTouchEnd( event ) {
		if ( scope.enabled === false ) return;

		state = STATE.NONE;
	}

	function onContextMenu( event ) {
		if ( scope.enabled === false ) return;

		event.preventDefault();
	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	scope.domElement.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};
