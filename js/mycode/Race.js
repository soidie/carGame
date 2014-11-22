/**
 * created by javer on 14-8-13.
 * 注意:car是xz图,而该地图是xy图,要时刻注意两者的变换
 * 注意:x,y在某些场合,如取色素点,必须是整数值,又因为利用blender建造物体时,物体的坐标精确到0.00001,应对该值进行转化
 * 这个类大体上已实现了3个功能
 * 1.利用three.js 实现的相对简单的地图载入
 * 2.利用html内置api实现的色素点检测碰撞
 * 3.通过利用参考点及两向量求cos值判断方向
 */
var Race = function (scene, car_state) {
    //碰撞检测所需信息
    var coll_cxt, coll_image, coll_image_data;
    //针对特定地图的方向信息
    var race_points;
    //用来检测车的左右两边是否碰撞
    var carHalfWidth;
    var carHalfLength;
    //初始化汇总

    /**
     * 加载地图的各项内容
     * race_data : RaceData()的实例,详细信息请查阅RaceData
     */
    this.load = function(race_data){
        init3DModel(race_data.js_data, race_data.times);
        initCollisionMap(race_data.coll_data);
        car_state.setMap(race_data.map_data);
        race_points = race_data.direction_data;
    };

    /**
     * 加载碰撞检测的地图
     * @param coll_img  碰撞检测地图路径
     */
    function initCollisionMap(coll_img) {
        var collCan = document.createElement('canvas');
        coll_cxt = collCan.getContext('2d');
        coll_image = new Image();
        coll_image.src = coll_img;
        coll_image.onload = function() {
            collCan.width = coll_image.width;
            collCan.height = coll_image.height;
            coll_cxt.drawImage(coll_image, 0, 0);
            coll_image_data = coll_cxt.getImageData(0, 0, coll_image.width, coll_image.height);
        }
    }

    //画出真实的3d跑道模型
    function init3DModel(js_data, times) {
        var raceRoad;
        new THREE.JSONLoader().load(js_data, function (geometry, material) {
            raceRoad = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(material));
            raceRoad.position.set(0, 0, 0);
            if(times != undefined) {
                raceRoad.scale.set(times, times, times);
            }
            scene.add(raceRoad);
        });

    }

    //对于碰撞碰撞,返回前一次更新的位置,若否,更新前一次的位置
    //检测碰撞图上的点是否为黑色的点,若是黑色的点,代表与障碍物相碰
    this.isCollision = function (car) {
        if(coll_image_data != undefined) {
            //用于取点
            carHalfWidth = car.halfWidth;
            carHalfLength = car.halfLength;
            //因为汽车在平面上的坐标我是我们熟悉的xy而是xz,而且x的方向是与xy比是反的
            var tx = car.pos.x;
            var tz = car.pos.z;
            //代表汽车四个菱角
            var v1 = new THREE.Vector2(tx + carHalfWidth, tz + carHalfLength);//左上角
            var v2 = new THREE.Vector2(tx - carHalfWidth, tz + carHalfLength);//右上角
            var v3 = new THREE.Vector2(tx - carHalfWidth, tz - carHalfLength);//右下角
            var v4 = new THREE.Vector2(tx + carHalfWidth, tz - carHalfLength);//左下角
            //代表汽车四个菱角所接触的色图的颜色(RGBA),取点应该为整数,即经过Math.round()方法
            var d1 = getPixel(v1.x, v1.y);
            var d2 = getPixel(v2.x, v2.y);
            var d3 = getPixel(v3.x, v3.y);
            var d4 = getPixel(v4.x, v4.y);

            //碰撞上了物体
            return ((d1.r == 0 && d1.g == 0 && d1.b == 0) || (d2.r == 0 && d2.g == 0 && d2.b == 0) ||
                (d3.r == 0 && d3.g == 0 && d3.b == 0) || (d4.r == 0 && d4.g == 0 && d4.b == 0))
        }
    };

    /**
     * 根据坐标取值,但因为该值经过了Math.round()处理,导致了误差,比如,y应该是6.5,但
     * @param x x坐标
     * @param y y坐标
     * @returns {*}
     */
    function getPixel(x, y) {
        var temp_i;
        var i;
        if(coll_image_data == undefined || x < 0 || y < 0 || x> coll_image_data.width  || y > coll_image_data.height) {
            return {r : 0, g : 0, b : 0, a : 0} ;
        }else {
            //该值应该为整数
            i = (Math.round(y) * coll_image_data.width + Math.round(x)) * 4;
            return {
                r : coll_image_data.data[i],
                g : coll_image_data.data[i + 1],
                b : coll_image_data.data[i + 2],
                a : coll_image_data.data[i + 3]
            };
        }
    }

    var index = 0;
    var temp_point_b, temp_point_f;

    /**
     * 检测方向是否跑反
     * @param car
     */
    this.updateDirection = function(car) {
        if(race_points != undefined) {
            var car_pos = {x: Math.round(car.pos.x), y: Math.round(car.pos.z)};//xz->xy
            var temp_vec = car.root.localToWorld(new THREE.Vector3(0, 0, 50));//取值达到50,是因为但取值为10时,将出现car_pos与temp_vec相同的情况
            var car_ref = {x: Math.round(temp_vec.x), y: Math.round(temp_vec.z)};
//        var car_ref = {x: temp_vec.x, y: temp_vec.z};
            updatePointAndLaps(car_pos, car);
            car.is_correct_direction = isCorrectDirection(temp_point_b, temp_point_f, car_pos, car_ref);
        }
    }
    /**
     求向量 p1->p2, p3->p4 间的cos_theta,以此为依据判断角是否小于90°
     */
    function isCorrectDirection(p1, p2, p3, p4) {
        var x1 = p2.x - p1.x;
        var y1 = p2.y - p1.y;
        var x2 = p4.x - p3.x;
        var y2 = p4.y - p3.y;
        var cos_theta = (x1*x2 + y1*y2) / (Math.pow((x1*x1 + y1*y1), 1/2) * Math.pow((x2*x2 + y2*y2), 1/2));
        return cos_theta >= 0;
    }

    /**
     * 判断汽车是否进入下一个或上一个方向区间,注意:方向的直线应该贴近内线
     * 该方法还实现了圈数的计算
     * 调用该方法,将在下一次改变temp_point_b和temp_point_f的值(通过index);
     */
    function updatePointAndLaps(car_pos, car) {
        temp_point_b = race_points[index];
        if(index + 1 == race_points.length)
            temp_point_f = race_points[0];
        else
            temp_point_f = race_points[index+1];
        if(isChange(temp_point_b, temp_point_f, car_pos)) {
            index --;
            if(index < 0) {
                //因为从0号出发点到最尾的点,相当于从后一圈到前一圈,下同
                index = race_points.length - 1;
                car.lapNum--;
                console.log(car.lapNum);
            }
        }
        else if(isChange(temp_point_f, temp_point_b, car_pos)) {
            index++;
            if(index == race_points.length) {
                index = 0;
                car.lapNum++;
                console.log(car.lapNum);
            }
        }
    }

    /**
     判断p1->p2,p1->p3间的夹角是否近似180°
     该方法在赛道中用于辅助判断汽车现在的方向区间
     */
    function isChange(p1, p2, p3) {
        var x1 = p2.x - p1.x;
        var y1 = p2.y - p1.y;
        var x2 = p3.x - p1.x;
        var y2 = p3.y - p1.y;
        var cos_theta = (x1*x2 + y1*y2) / (Math.pow((x1*x1 + y1*y1), 1/2) * Math.pow((x2*x2 + y2*y2), 1/2));
        //满足近似180°的角,-1似乎比较难取到
        return(cos_theta < -0.9);
    }
};