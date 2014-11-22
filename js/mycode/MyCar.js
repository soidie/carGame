/**
 * Created by Javer on 14-8-22.
 * 该类继承了THREE.Car,并且根据游戏需要添加汽车状态的其他值(这些值非THREE.Car所提供的)
 */

function MyCar() {
    //模拟继承Car
    THREE.Car.apply(this, arguments);
    //下面是默认设置
    this.body_path = './models/cars/Ferrari_Car/ferrari_body.js';
    this.wheel_path = './models/cars/Ferrari_Car/ferrari_wheel.js';
    this.pos = this.root.position;
    this.init_pos = {x: 0, y: 0, z: 0};
    this.pre_pos = {x: 0, y: 0, z: 0};
    this.can_move = true;
    this.lapNum = 0;//保持圈数
    //默认为黑色,该颜色和该车辆在地图上显示的点的颜色有关
    this.carColor = '#000000';
    //检测碰撞的正方体大小,该值将由THREE.computeingBoundingBox得到的Box3D.max确定,实现和模型相结合
    this.halfWidth = 0;
    this.halfLength = 0;
    this.is_correct_direction = true;
    //控制
    var dc = {moveForward: false, moveBackward: false, moveLeft: false, moveRight: false};
    this.direction_control = dc;

    /*
    初始化时车辆的位置
     */
    this.setCarPosition = function (x, y, z) {
        this.init_pos.x = x;
        this.init_pos.y = y;
        this.init_pos.z = z;
    };

    /**
     定义控制车运动时的键盘原始状态,可更改
      */
    this.appendKeyBoard = function (forwardNum, backNum, leftNum, rightNum) {
        window.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case forwardNum:
                    dc.moveForward = true;
                    break;
                case backNum:
                    dc.moveBackward = true;
                    break;
                case leftNum:
                    dc.moveLeft = true;
                    break;
                case rightNum:
                    dc.moveRight = true;
                    break;
            }
        }, false);

        window.addEventListener('keyup', function (event) {
            switch (event.keyCode) {
                case forwardNum:
                    dc.moveForward = false;
                    break;
                case backNum:
                    dc.moveBackward = false;
                    break;
                case leftNum:
                    dc.moveLeft = false;
                    break;
                case rightNum:
                    dc.moveRight = false;
                    break;
            }
        }, false);
    };

    var cam_x = 0;
    var cam_y = 20;
    var cam_z = -40;
    var cam_pos;
    //该方法与updateCamera联系,实现相机跟随汽车左摇右摆
    this.initView = function (camera) {
        this.root.add(camera);
        cam_pos = camera.position;
        camera.position.set(cam_x, cam_y, cam_z);
    };

    var camera_x_shake_speed = 0.3;
    var camera_x_back_speed = 0.5;
    var max_x_shake_pos = 10;
    var camera_z_shake_speed = 0.03;
    var camera_z_back_speed = 0.05;
    var max_z_shake_pos = -35;
    /*
    *该方法实现相机跟随汽车左摇右摆,应保持平滑的视觉效果(不抖动)
     */
    this.updateCamera = function () {
        if (cam_pos != undefined) {
            //about x
            //shake
            if (dc.moveLeft && dc.moveForward) {
                //是否正数小于10,是,相机继续往左移动,否,相机=10
                (cam_pos.x - max_x_shake_pos) < 0 ? cam_pos.x += camera_x_shake_speed : cam_pos.x = max_x_shake_pos;
            } else if (dc.moveRight && dc.moveForward) {
                //是否负数大于-10,是,相机往右移动,否,相机=-10;
                (cam_pos.x + max_x_shake_pos)  > 0 ? cam_pos.x -= camera_x_shake_speed : cam_pos.x = -max_x_shake_pos;
            }
            //back
            else if (cam_pos.x < cam_x) {
                Math.abs(cam_pos.x) < camera_x_back_speed ? cam_pos.x = cam_x : cam_pos.x += camera_x_back_speed;
            } else if (cam_pos.x > cam_x) {
                Math.abs(cam_pos.x) < camera_x_back_speed ? cam_pos.x = cam_x : cam_pos.x -= camera_x_back_speed;
            }

            //about z, similiar as x
            //shake
            if (dc.moveForward && (dc.moveLeft || dc.moveRight)) {
                cam_pos.z < max_z_shake_pos ? cam_pos.z += camera_z_shake_speed : cam_pos.z = max_z_shake_pos;
            }
            //back
            else {
                (cam_pos.z - cam_z) < camera_z_back_speed ? cam_pos.z = cam_z : cam_pos.z -= camera_z_back_speed;
            }
        }
    };

    /**
     * 当汽车碰上障碍物的表现
     */
    this.collision = function(){
        this.speed = 0;
    };
    //加速
    this.speedUp = function() {
        this.speed = this.MAX_SPEED;
    }
}