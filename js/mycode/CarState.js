/**
 * Created by Javer on 14-8-19.
 * 作为一个div覆盖在原本的three.js的画面上,以2d显示地图,汽车状态,时间圈数等竞技信息等功能
 * 该类采取的方法粗糙,而且有待美化
 */
function CarState(top, left, width, height) {
    var utils_div;
    //显示小地图
    var map_proportion = 1;
    var map_cxt;
    //计算时间
    var time_div;
    //显示速度
    var speed_cxt;
    var bar_width;
    var bar_height;
    //显示红绿灯
    var light_div;
    var light_canvas;
    var light_cxt;
    //用于控制的布尔值,当对应的布尔值为false时,将不再图上显示该参数
    this.is_state_ready = true;
    var is_map_ready = false;
    var is_time_ready = true;
    var is_speed_ready = true;
    var is_light_ready = true;

    /**
     * 初始化该类,实现在3d界面上覆盖一层2d界面以达到显示非3d的信息
     */
    this.init = function() {
        if(this.is_state_ready) {
            utils_div = document.createElement('div');
            utils_div.style.position = 'absolute';

            if (top == undefined) {
                utils_div.style.top = 0 + 'px';
                utils_div.style.left = 0 + 'px';
                utils_div.style.width = window.innerWidth + 'px';
                utils_div.style.height = window.innerHeight + 'px';
            } else {
                utils_div.style.top = top + 'px';
                utils_div.style.left = left + 'px';
                utils_div.style.width = width + 'px';
                utils_div.style.height = height + 'px';
            }
            document.body.appendChild(utils_div);
        }
    };

    /**
     * 加载跑道的小地图
     * @param map_path 小地图的路径
     */
    this.setMap = function (map_path) {
        if(this.is_state_ready) {
            var map_div = document.createElement('div');
            var map_canvas = document.createElement('canvas');
            //一切小地图的默认长都是200
            map_div.style.position = 'absolute';
            map_div.style.top = top + 'px';
            map_div.style.left = left + width - 200 + 'px';//居右
            map_canvas.width = 200;
            map_cxt = map_canvas.getContext('2d');
            //设定相对的固定位置
            var map_img = new Image();
            map_img.src = map_path;
            map_img.onload = function () {
                map_canvas.height = map_img.height / map_img.width * map_canvas.width;
                map_cxt.drawImage(map_img, 0, 0);
            };
            map_div.appendChild(map_canvas);
            utils_div.appendChild(map_div);
            is_map_ready = true;
        }
    };

    /**
     * 加载计量时间的计时器,
     */
    this.setTimeCounter = function () {
        if(this.is_state_ready) {
            time_div = document.createElement('div');
            time_div.className = 'timeCounter';
            time_div.style.position = 'absolute';
            time_div.style.top = top + 'px';
            time_div.style.left = (left + width) / 2 + 'px';
            time_div.style.backgroundColor = 'none';
            time_div.innerHTML = minutes + ': ' + seconds + ' : ' + mills;
            utils_div.appendChild(time_div);
            is_time_ready = true;
        }
    };

    /**
     * 加载显示汽车速度的速度条
     */
    this.setSpeedBar = function () {
        if(this.is_state_ready) {
            var speed_div = document.createElement('div');
            speed_div.style.position = 'absolute';
            speed_div.style.top = top + height - 100 + 'px';
            speed_div.style.left = (left + width) / 2 - 400 + 'px';
            var speed_canvas = document.createElement('canvas');
            bar_width = speed_canvas.width = 800;
            bar_height = speed_canvas.height = 10;
            speed_cxt = speed_canvas.getContext('2d');
            speed_div.appendChild(speed_canvas);
            utils_div.appendChild(speed_div);
            is_speed_ready = true;
        }
    };

    /**
     * 设置模拟的红绿灯
     */
    this.setLightBar = function () {
        if(this.is_state_ready) {
            light_div = document.createElement('div');
            light_div.style.position = 'absolute';
            light_div.style.top = top + 200 + 'px';
            light_div.style.left = width / 2 - 200 + 'px';
            light_canvas = document.createElement('canvas');
            light_canvas.width = 400;
            light_canvas.height = 100;
            light_cxt = light_canvas.getContext('2d');
            light_div.appendChild(light_canvas);
            utils_div.appendChild(light_div);
            is_light_ready = true;
        }
    };

    var i = -1;
    var t;
    var temp_car;
    /**
     * 该方法只是模拟红绿灯的倒计时
     * 以后应该以图片取代
     * @param car
     */
    this.startLightCount = function (car) {
        if(is_light_ready) {
            car.can_move = false;
            temp_car = car;
            t = setInterval(startLightCount, 1000);
        }
    };
    function startLightCount() {
        switch (i) {
            case -1:
                //之所以为-1是为了在汽车加载完毕后一秒才进行画图
                i++;break;
            case 0:
            case 1:
            case 2:
                light_cxt.fillStyle = '#FF0000';
                light_cxt.beginPath();
                light_cxt.arc(100 * i + 75, 50, 25, 0, Math.PI * 2, true);
                light_cxt.closePath();
                light_cxt.fill();
                i++;
                break;
            case 3:
                light_cxt.fillStyle = '#FFFF00';
                light_cxt.beginPath();
                light_cxt.arc(100 * i + 75, 50, 25, 0, Math.PI * 2, true);
                light_cxt.closePath();
                light_cxt.fill();
                i++;
                break;
            case 4:
                light_cxt.clearRect(0, 0, light_canvas.width, light_canvas.height);
                light_cxt.fillStyle = '#FFFF00';
                light_cxt.font = '30px Arial';//没有逗号
//                light_cxt.align = 'center';
                light_cxt.fillText('Ready?', light_canvas.width / 2, light_canvas.height / 2);
                i++;
                break;
            case 5:
                light_cxt.clearRect(0, 0, light_canvas.width, light_canvas.height);
                light_cxt.fillStyle = '#00FF00';
                light_cxt.font = '50px Arial';
                light_cxt.fillText('GO!', light_canvas.width / 2, light_canvas.height / 2);
                i++;
                break;
            case 6:
                //清除所有痕迹
                light_cxt.clearRect(0, 0, light_canvas.width, light_canvas.height);
                light_div.removeChild(light_canvas);
                utils_div.removeChild(light_div);
                clearInterval(t);
                //开始计时
                temp_car.can_move = true;
                countTime();
        }
    }

    var isDraw = false;
    var isText = false;
    var tips_div;
    var tips_canvas;
    var tips_cxt;
    /**
     * 提示方向是否跑反,该方法仅用于显示,不包含判断的逻辑内容
     * @param is_direction
     * is_direction :true 则表示汽车为正确方向; false:汽车方向跑反
     *
     */
    this.updateTips = function (is_direction) {
            //提示
            if (!is_direction) {
                //创建提示
                if(!isDraw) { //创建div
                    tips_div = document.createElement('div');
                    tips_div.position = 'absolute';
                    tips_div.style.top = top  + 100  + 'px';
                    tips_div.style.left = (top + width) / 2 - 200 + 'px';
                    tips_canvas = document.createElement('canvas');
                    tips_canvas.width = 400;
                    tips_canvas.height = 100;
                    tips_cxt = tips_canvas.getContext('2d');
                    tips_div.appendChild(tips_canvas);
                    utils_div.appendChild(tips_div);
                    isDraw = true;
                } else if(!isText){//没有写字
                    tips_cxt.fillStyle = '#FF0000';
                    tips_cxt.font = '20px Arial';
                    tips_cxt.fillText('Wrong Direction', tips_canvas.width/2, tips_canvas.height/2);
                    isText = true;
                    //下面这部分代码是一种很粗劣实现闪烁的方法
                    setTimeout(function() {tips_cxt.clearRect(0, 0, tips_canvas.width, tips_canvas.height)}, 500);
                    setTimeout(function() {isText=false}, 1000);
                }
            } else if (is_direction && isDraw) {
                if(tips_div!=undefined) {
                    tips_cxt.clearRect(0, 0, tips_canvas.width, tips_canvas.height);
                    tips_div.removeChild(tips_canvas);
                    utils_div.removeChild(tips_div);
                    isDraw = false;
                }
            }
    };

    /**
     * 更新汽车在地图中的位置
     * @param car 要更新的汽车引用
     */
    this.updateMap = function (car) {
        if(is_map_ready) {
            //用白的颜色去除原来的颜色
            map_cxt.fillStyle = '#FFFFFF';//white;
            map_cxt.fillRect(Math.round(car.pre_pos.x / map_proportion), Math.round(car.pre_pos.z / map_proportion), 2, 2);
            //用car的颜色来画上现在的位置
            map_cxt.fillStyle = car.carColor;
    //        timeLog(carColor);
            map_cxt.fillRect(Math.round(car.pos.x / map_proportion), Math.round(car.pos.z / map_proportion), 2, 2);
            map_cxt.stroke();
        }
    };

    /**
     * 更新时间,为了达到双人同步更新,所以计算时间的方法并不属于CarState,而是在tools中
     */
    this.updateTime = function () {
        if(is_time_ready) {
            time_div.innerHTML = minutes + ' : ' + seconds + ' : ' + mills;
        }
    };

    /**
     * 该方法仅用于显示速度条
     * @param percent :  speed / max_speed,即赛车在最大速度上的百分比
     */
    this.updateSpeed = function (percent) {
        if(is_speed_ready) {
            speed_cxt.clearRect(0, 0, bar_width, bar_height);
            speed_cxt.fillRect(0, 0, bar_width * Math.round(percent * 100) / 100, bar_height);//100相当于精确到0.01,也就是将速度条100等分
            speed_cxt.stroke();
        }
    };

    /**
     * 一键更新汽车状态
     */
    this.updateAll = function(car) {
        if(this.is_state_ready) {
            this.updateTime();
            this.updateMap(car);
            this.updateSpeed(car.speed/car.MAX_SPEED);
            this.updateTips(car.is_correct_direction);
        }
    }
}


