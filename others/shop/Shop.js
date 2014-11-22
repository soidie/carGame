/**
 * Created by Javer on 14-8-25.
 */
var Shop = function () {
    var renderer, scene, camera;
    var container;
    var view_control;
    var stats;
    var width = screen.width;
    var height = screen.height;

    init();

    function init() {
        // 初始化
        initHTML();
        initRenderer();
        initScene();
        initLight();
        initCamera();
        //因为地图需要,car应该在之前先初始化
        initControl();
        initState();
    }


    function initHTML() {
        container = document.getElementById('shopCanvas');
        console.log('finish initHtml');
    }

    function initRenderer() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        console.log('finish init renderer')
    }

    function initScene() {
        scene = new THREE.Scene();
        console.log('finish init scene');
    }

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

    function initCamera() {
        camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 8000);
        camera.position.set(0, 2, -7);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        console.log('finish init camera');
    }

    function initControl() {
        // 鼠标控制，需要单独的js文件，从官网下载即可
        view_control = new THREE.OrbitControls(camera, renderer.domElement);
        view_control.userPan = false;
        view_control.userPanSpeed = 0.0;
        view_control.maxDistance = 5000.0;
        view_control.maxPolarAngle = Math.PI * 0.495;
        console.log('finish init control');
    }


    function initState() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        console.log('finish init state');
    }

    this.showCar = function(car_path) {
        load(scene, car_path);
    };

//显示
    this.start = function () {
        //  循环游戏
        startGame();
    };

    function startGame() {
        requestAnimationFrame(startGame);
        stats.update();
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }
};