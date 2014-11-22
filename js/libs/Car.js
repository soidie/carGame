/**
 */
THREE.Car = function () {

	var scope = this;
    //模型尺寸
	this.modelScale = 1;
    //复制车轮后偏离的位置
	this.backWheelOffset = 0.5;
    //这个更改为false之后,轮子的位置将不固定,沿着车子中心做奇葩运动
	this.autoWheelGeometry = true;
    //轮子的位置
	this.wheelOffset = new THREE.Vector3();
    //车轮的直径,不过更改之后好像没神马用
	this.wheelDiameter = 0;

//常规中,控制车子性能的参数
    //能够达到的最大速度
	this.MAX_SPEED = 1;//1
    //倒车最大速度
	this.MAX_REVERSE_SPEED = -0.5;
    //车轮最大旋转的角度
	this.MAX_WHEEL_ROTATION = 0.6;

    //这个才是最基本的加速度,前后有别
	this.FRONT_ACCELERATION = 0.001;
	this.BACK_ACCELERATION = 0.0005;
    //角加速度
	this.WHEEL_ANGULAR_ACCELERATION = 100;
    //减速度
	this.FRONT_DECCELERATION = 0.001;
    //角减慢速度
	this.WHEEL_ANGULAR_DECCELERATION = 1.0;
    //转向半径比,同样不知何用
	this.STEERING_RADIUS_RATIO = 0.0023;//0.0002
    //两侧倾斜
	this.MAX_TILT_SIDES = 0.05;
	this.MAX_TILT_FRONTBACK = 0.015;

//  在车子运动时会真正用到的参数,具体值将结合上面性能参数
    //速度
	this.speed = 0;
    //加速度
	this.acceleration = 0;
    //车轮转的角度
	this.wheelOrientation = 0;
    //车转的角度
	this.carOrientation = 0;

	// 下面汽车机动参数设置

	this.root = new THREE.Object3D();

	this.frontLeftWheelRoot = new THREE.Object3D();
	this.frontRightWheelRoot = new THREE.Object3D();

//纹理材质等
	this.bodyMesh = null;

	this.frontLeftWheelMesh = null;
	this.frontRightWheelMesh = null;

	this.backLeftWheelMesh = null;
	this.backRightWheelMesh = null;

	this.bodyGeometry = null;
	this.wheelGeometry = null;

	this.bodyMaterials = null;
	this.wheelMaterials = null;

	this.loaded = false;

	this.meshes = [];

	// API

	this.enableShadows = function ( enable ) {

		for ( var i = 0; i < this.meshes.length; i ++ ) {

			this.meshes[ i ].castShadow = enable;
			this.meshes[ i ].receiveShadow = enable;

		}

	};

	this.setVisible = function ( enable ) {

		for ( var i = 0; i < this.meshes.length; i ++ ) {

			this.meshes[ i ].visible = enable;
			this.meshes[ i ].visible = enable;

		}

	};

	this.loadPartsJSON = function ( bodyURL, wheelURL ) {

		var loader = new THREE.JSONLoader();

		loader.load( bodyURL, function( geometry, materials ) { createBody( geometry, materials ) } );
		loader.load( wheelURL, function( geometry, materials ) { createWheels( geometry, materials ) } );

	};

	this.loadPartsBinary = function ( bodyURL, wheelURL ) {

		var loader = new THREE.BinaryLoader();

		loader.load( bodyURL, function( geometry, materials ) { createBody( geometry, materials ) } );
		loader.load( wheelURL, function( geometry, materials ) { createWheels( geometry, materials ) } );

	};

	// 更新汽车的状态,该方法为汽车的主要方法
    //delta作为一个总体的控制值,相当于总体评价一辆车的性能
    //controls相当于外界与该汽车模型连接的接口,可与键盘监听等联系起来

	this.updateCarModel = function ( delta, controls ) {

		// speed and wheels based on controls
        //下面为向前.向后对于速度,以及加速度的更改
		if ( controls.moveForward ) {

			this.speed = THREE.Math.clamp( this.speed + delta * this.FRONT_ACCELERATION, this.MAX_REVERSE_SPEED, this.MAX_SPEED );
			this.acceleration = THREE.Math.clamp( this.acceleration + delta, -1, 1 );

		}

		if ( controls.moveBackward ) {


			this.speed = THREE.Math.clamp( this.speed - delta * this.BACK_ACCELERATION, this.MAX_REVERSE_SPEED, this.MAX_SPEED );
			this.acceleration = THREE.Math.clamp( this.acceleration - delta, -1, 1 );

		}
        //线面是对向左,向右车子转速的控制
		if ( controls.moveLeft ) {

			this.wheelOrientation = THREE.Math.clamp( this.wheelOrientation + delta * this.WHEEL_ANGULAR_ACCELERATION, - this.MAX_WHEEL_ROTATION, this.MAX_WHEEL_ROTATION );

		}

		if ( controls.moveRight ) {

			this.wheelOrientation = THREE.Math.clamp( this.wheelOrientation - delta * this.WHEEL_ANGULAR_ACCELERATION, - this.MAX_WHEEL_ROTATION, this.MAX_WHEEL_ROTATION );

		}

		// speed decay
        //当车子不再加速的时候,会存在一定的速度延迟,即惯性作用
		if ( ! ( controls.moveForward || controls.moveBackward ) ) {

			if ( this.speed > 0 ) {

				var k = exponentialEaseOut( this.speed / this.MAX_SPEED );

				this.speed = THREE.Math.clamp( this.speed - k * delta * this.FRONT_DECCELERATION, 0, this.MAX_SPEED );
				this.acceleration = THREE.Math.clamp( this.acceleration - k * delta, 0, 1 );

			} else {

				var k = exponentialEaseOut( this.speed / this.MAX_REVERSE_SPEED );

				this.speed = THREE.Math.clamp( this.speed + k * delta * this.BACK_ACCELERATION, this.MAX_REVERSE_SPEED, 0 );
				this.acceleration = THREE.Math.clamp( this.acceleration + k * delta, -1, 0 );

			}


		}

		// steering decay
        //向左向右角度延迟,即惯性
		if ( ! ( controls.moveLeft || controls.moveRight ) ) {

			if ( this.wheelOrientation > 0 ) {

				this.wheelOrientation = THREE.Math.clamp( this.wheelOrientation - delta * this.WHEEL_ANGULAR_DECCELERATION, 0, this.MAX_WHEEL_ROTATION );

			} else {

				this.wheelOrientation = THREE.Math.clamp( this.wheelOrientation + delta * this.WHEEL_ANGULAR_DECCELERATION, - this.MAX_WHEEL_ROTATION, 0 );

			}

		}

		// car update
        //更新位置
		var forwardDelta = this.speed * delta;

		this.carOrientation += ( forwardDelta * this.STEERING_RADIUS_RATIO )* this.wheelOrientation;

		// displacement

		this.root.position.x += Math.sin( this.carOrientation ) * forwardDelta;
		this.root.position.z += Math.cos( this.carOrientation ) * forwardDelta;

		// steering

		this.root.rotation.y = this.carOrientation;

		// tilt

		if ( this.loaded ) {

			this.bodyMesh.rotation.z = this.MAX_TILT_SIDES * this.wheelOrientation * ( this.speed / this.MAX_SPEED );
			this.bodyMesh.rotation.x = - this.MAX_TILT_FRONTBACK * this.acceleration;

		}

		// wheels rolling

		var angularSpeedRatio = 1 / ( this.modelScale * ( this.wheelDiameter / 2 ) );

		var wheelDelta = forwardDelta * angularSpeedRatio;

		if ( this.loaded ) {

			this.frontLeftWheelMesh.rotation.x += wheelDelta;
			this.frontRightWheelMesh.rotation.x += wheelDelta;
			this.backLeftWheelMesh.rotation.x += wheelDelta;
			this.backRightWheelMesh.rotation.x += wheelDelta;

		}

		// front wheels steering

		this.frontLeftWheelRoot.rotation.y = this.wheelOrientation;
		this.frontRightWheelRoot.rotation.y = this.wheelOrientation;

	};

	// internal helper methods

	function createBody ( geometry, materials ) {

		scope.bodyGeometry = geometry;
		scope.bodyMaterials = materials;

		createCar();

	}

	function createWheels ( geometry, materials ) {

		scope.wheelGeometry = geometry;
		scope.wheelMaterials = materials;

		createCar();

	}

	function createCar () {

		if ( scope.bodyGeometry && scope.wheelGeometry ) {

			// 计算出轮子的各项参数

			if ( scope.autoWheelGeometry ) {

				scope.wheelGeometry.computeBoundingBox();

				var bb = scope.wheelGeometry.boundingBox;

				scope.wheelOffset.addVectors( bb.min, bb.max );
				scope.wheelOffset.multiplyScalar( 0.5 );

				scope.wheelDiameter = bb.max.y - bb.min.y;

				THREE.GeometryUtils.center( scope.wheelGeometry );

			}

			// 根据所计算的参数把car再次画出来

			var s = scope.modelScale,
				delta = new THREE.Vector3();

			var bodyFaceMaterial = new THREE.MeshFaceMaterial( scope.bodyMaterials );
			var wheelFaceMaterial = new THREE.MeshFaceMaterial( scope.wheelMaterials );

			// body

			scope.bodyMesh = new THREE.Mesh( scope.bodyGeometry, bodyFaceMaterial );
			scope.bodyMesh.scale.set( s, s, s );

			scope.root.add( scope.bodyMesh );

			// 左前轮

			delta.multiplyVectors( scope.wheelOffset, new THREE.Vector3( s, s, s ) );

			scope.frontLeftWheelRoot.position.add( delta );

			scope.frontLeftWheelMesh = new THREE.Mesh( scope.wheelGeometry, wheelFaceMaterial );
			scope.frontLeftWheelMesh.scale.set( s, s, s );

			scope.frontLeftWheelRoot.add( scope.frontLeftWheelMesh );
			scope.root.add( scope.frontLeftWheelRoot );

			// 右前轮

			delta.multiplyVectors( scope.wheelOffset, new THREE.Vector3( -s, s, s ) );//相当于x轴对称,下同

			scope.frontRightWheelRoot.position.add( delta );

			scope.frontRightWheelMesh = new THREE.Mesh( scope.wheelGeometry, wheelFaceMaterial );
			scope.frontRightWheelMesh.scale.set( s, s, s );
			scope.frontRightWheelMesh.rotation.z = Math.PI;

			scope.frontRightWheelRoot.add( scope.frontRightWheelMesh );
			scope.root.add( scope.frontRightWheelRoot );

			// back left wheel

			delta.multiplyVectors( scope.wheelOffset, new THREE.Vector3( s, s, -s ) );
			delta.z -= scope.backWheelOffset;

			scope.backLeftWheelMesh = new THREE.Mesh( scope.wheelGeometry, wheelFaceMaterial );

			scope.backLeftWheelMesh.position.add( delta );
			scope.backLeftWheelMesh.scale.set( s, s, s );

			scope.root.add( scope.backLeftWheelMesh );

			// back right wheel

			delta.multiplyVectors( scope.wheelOffset, new THREE.Vector3( -s, s, -s ) );
			delta.z -= scope.backWheelOffset;

			scope.backRightWheelMesh = new THREE.Mesh( scope.wheelGeometry, wheelFaceMaterial );

			scope.backRightWheelMesh.position.add( delta );
			scope.backRightWheelMesh.scale.set( s, s, s );
			scope.backRightWheelMesh.rotation.z = Math.PI;

			scope.root.add( scope.backRightWheelMesh );

			// cache meshes

			scope.meshes = [ scope.bodyMesh, scope.frontLeftWheelMesh, scope.frontRightWheelMesh, scope.backLeftWheelMesh, scope.backRightWheelMesh ];

			// callback

			scope.loaded = true;

			if ( scope.callback ) {

				scope.callback( scope );

			}

		}

	}

	function quadraticEaseOut( k ) { return - k * ( k - 2 ); }
	function cubicEaseOut( k ) { return --k * k * k + 1; }
	function circularEaseOut( k ) { return Math.sqrt( 1 - --k * k ); }
	function sinusoidalEaseOut( k ) { return Math.sin( k * Math.PI / 2 ); }
	function exponentialEaseOut( k ) { return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1; }

};
