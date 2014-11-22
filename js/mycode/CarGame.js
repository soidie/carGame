/**
 * 该类作为一个总体控制类而存在
 * @param divName
 * @param width
 * @param height
 * @param doubleModel
 * @constructor
 */
var CarGame = function (divName, width, height, doubleModel) {
    // 环境变量
    var race;
    var renderer, scene, camera;
    var container;
    var view_control;
    var car_state;
    var stats;
    var main_car;
    var cars = [];

    init();

    /**
     * 执行游戏的初始化工作
     */
    function init() {
        initHTML();
        //初始化渲染器和布局
        initRenderer();
        initScene();
        initCarState();
        //初始化地图的其他部分
        initCamera();
        initLight();
//        initControl();
        initState();
    }

    /**
     * 初始化天空的背景
     */
    this.initSky = function() {
        // 加载sky，生成文理对象，用来加载。参数很多，可选
        var cubeMap = new THREE.Texture( [] );
        cubeMap.format = THREE.RGBFormat;//默认RGB为纹理格式
        cubeMap.flipY = false;
        // 默认为false，将其设置为true，如果纹理需要进行垂直翻转。
        var loader = new THREE.ImageLoader();
        loader.load( './models/map_texture/sky.png', function (image) {
            // 设置一个函数，下面会调用
            var getSide = function ( x, y ) {
                var size = 1024;
                var canvas = document.createElement( 'canvas' );
                canvas.width = size;
                canvas.height = size;
                var context = canvas.getContext( '2d' );
                context.drawImage(image, - x * size, - y * size );
                return canvas;

            };
            // 在回调函数中，创建了getSide函数来获取skybox立方体六个面的图案。
            //文件本身是4096 × 3072大小的图片，利用HTML画布的绘图函数来返回每一个面图形信息
            cubeMap.image[ 0 ] = getSide( 2, 1 );
            cubeMap.image[ 1 ] = getSide( 0, 1 );
            cubeMap.image[ 2 ] = getSide( 1, 0 );
            cubeMap.image[ 3 ] = getSide( 1, 2 );
            cubeMap.image[ 4 ] = getSide( 1, 1 );
            cubeMap.image[ 5 ] = getSide( 3, 1 );
            cubeMap.needsUpdate = true;

        } );
        // Three.js自带的着色器为整个天空的skybox着色
        var cubeShader = THREE.ShaderLib['cube'];
        cubeShader.uniforms['tCube'].value = cubeMap;

        // 利用生成的着色器创建skybox的材质
        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });
        // 创建skybox物体并添加到场景当中去
        var skyBox = new THREE.Mesh(
            new THREE.BoxGeometry( 20000, 20000, 20000),
            skyBoxMaterial
        );

        scene.add( skyBox );
        console.log('init sky');
    };

    /**
     * 初始化草坪
     */
    this.initGlass = function() {
        // 增加地面的草坪,但草坪的面积比较小
        var grassTex = THREE.ImageUtils.loadTexture('./models/map_texture//grass.png');
        // wrapS和wrapT的值都设为真，
        grassTex.wrapS = THREE.RepeatWrapping;
        grassTex.wrapT = THREE.RepeatWrapping;
        // 设置在x，和y，方向上均需要重复256次
        grassTex.repeat.x = 256;
        grassTex.repeat.y = 256;
        var groundMat = new THREE.MeshBasicMaterial({map:grassTex});
        // 显示草坪的长和宽
        var groundGeo = new THREE.PlaneGeometry(20000,20000);

        // 地面的geometry由THREE.PlaneGeometry创建，并且在y轴上往负方向平移了－3个单位，给车的模型留出空位
        ground = new THREE.Mesh(groundGeo,groundMat);
        ground.position.y = -3;
        ground.rotation.x = -Math.PI/2;
        // 之所以绕着x轴旋转90度是因为原始平面是沿着x，y轴平面的，需要旋转至x，z轴平面。
        ground.doubleSided = true;
        ground.receivedShadow = true;
        scene.add(ground);
        console.log('init glass')
    };

    /**
     * 初始化html的div
     */
    function initHTML() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            document.getElementById('container').innerHTML = "";
        }
        container = document.getElementById(divName);
        console.log('finish initHtml');
    }

    /**
     * 初始化渲染器
     */
    function initRenderer() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        console.log('finish init renderer')
    }

    /**
     * 初始化场景
     */
    function initScene() {
        scene = new THREE.Scene();
        console.log('finish init scene');
    }

    /**
     * 初始化相机
     */
    function initCamera() {
        camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 20000);
        camera.position.set(0, 200, -700);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        console.log('finish init camera');
    }

    /**
     * 初始化光
     */
    function initLight() {
        //光。多种光加载，显得更加真实
        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        directionalLight.position.set( 0, 500, -500 );
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        directionalLight.position.set( - 500, 500, 500 );
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 500, 500, 500 );
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 0, 50000, 0 );
        scene.add( directionalLight );
        console.log('finish init light');
    }


    /**
     * 初始化跑道
     */
    this.initRace = function(race_data) {
        race = new Race(scene, car_state);
        race.load(race_data);
    };

    /**
     * 初始化视觉控制,该方法将使鼠标的移动改变视觉控制
     */
    function initControl() {
        // 鼠标控制，需要单独的js文件，从官网下载即可
        view_control = new THREE.OrbitControls(camera, renderer.domElement);
        view_control.userPan = false;
        view_control.userPanSpeed = 0.0;
        view_control.maxDistance = 5000.0;
        view_control.maxPolarAngle = Math.PI * 0.495;
        console.log('finish init control');
    }

    /**
     * 初始化状态显示
     */
    function initState() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        console.log('finish init state');
    }

    /**
     * 添加拥有主视角的汽车
     * 该方法将callback执行主视角汽车执行完毕后,执行其他初始化或控制流程的工作
     * @param car 拥有主视角汽车的data
     */
    this.addMyCar = function (car) {
        // Car.js会自己计算剩下的三个轮子的座标，保证[左前轮]在左前轮位置，而不是坐标原点。
        car.loadPartsJSON(car.body_path, car.wheel_path);
        //初始化位置
        car.pos.set(car.init_pos.x, car.init_pos.y, car.init_pos.z);
        car.setVisible(true);

        main_car = car;
        scene.add(car.root);

        //该callback函数用于精确定位3d汽车模型的碰撞4个顶点,
        //因为汽车模型是在稍后加载的,所有只有当加载时才会确定最大的顶点
        car.callback = function(object) {
            //相机
            object.initView(camera);
            //碰撞
            object.bodyGeometry.computeBoundingBox();
            var box = object.bodyGeometry.boundingBox;
            object.halfWidth = box.max.x;
            object.halfLength = box.max.z;
            //测试
            var rect = [-box.max.x, box.max.z, 2 * box.max.x, 2 * box.max.z];
            var rl = drawRect(rect);
            main_car.root.add(rl);
        }
    };

    /**
     * 加入其他车子,该方法是为了在双人(或多人)模式下,将不同视图相同的车子进行绑定的方法
     * @param other_car MyCar.js的实例化对象
     */
    this.addOtherCar = function(other_car) {
        var tempCar = new MyCar();
        tempCar.loadPartsJSON(other_car.body_path, other_car.wheel_path);
        //初始化位置
        tempCar.pos.set(other_car.init_pos.x, other_car.init_pos.y, other_car.init_pos.z);
        //应该将索引联系在一起,而不是复制
        tempCar.direction_control = other_car.direction_control;
        tempCar.pos = other_car.pos;

        tempCar.setVisible(true);

        cars.push(tempCar);
        scene.add(tempCar.root);//记得root才是scene的元素
    };
    /**
     * 该方法将初始化汽车状态显示的2d界面
     */
    function initCarState() {
        if (doubleModel)
            car_state = new CarState(height / 2, 0, width, height);
        else
            car_state = new CarState(0, 0, width, height);

//        car_state.is_state_ready = false;   //不显示2d状态
        car_state.init();
        car_state.setTimeCounter();
        car_state.setLightBar();
        car_state.setSpeedBar();
    }

    this.start =function() {
        startGame();
        //绿灯通行
        car_state.startLightCount(main_car);
    };
    function startGame() {
        requestAnimationFrame(startGame);
        stats.update();
        if(main_car.can_move) {
            car_state.updateAll(main_car);
            main_car.updateCarModel(10, main_car.direction_control);
            if(race.isCollision(main_car))
                main_car.collision();
            race.updateDirection(main_car);
            main_car.updateCamera();
//更新其他车辆状态
            for(var i= 0,l=cars.length; i<l; i++) {
                var tempCar = cars[i];
                tempCar.updateCarModel(10, tempCar.direction_control);
                if(race.isCollision(tempCar))
                    tempCar.collision();
            }
        }
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }
};