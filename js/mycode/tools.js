/**
 * Created by Javer on 14-8-22.
 * 该类提供一些简单的方法
 */

//计算时间的规则
var minutes = seconds =  mills = 0;//所有time_div共用一个计时器
var t;
function countTime() {
    mills++;
    if(mills % 100 == 0) {
        mills = 0;
        seconds++;
        if(seconds % 60 == 0) {
            seconds = 0;
            minutes ++;
        }
    }
    t = setTimeout(countTime, 10);
}

//在不断循环中重复60次输出一次
var count_time = 0;
timeLog = function(string){
    if(count_time % 60 == 0) {
        console.log(string);
    }
    count_time++;
};

//计算游戏应有的窗口大小
var winWidth = 0;
var winHeight = 0;
function findDimensions() //函数：获取尺寸
{
    // 获取窗口宽度
    if (window.innerWidth)
        winWidth = window.innerWidth;
    else if ((document.body) && (document.body.clientWidth))
        winWidth = document.body.clientWidth;
    // 获取窗口高度
    if (window.innerHeight)
        winHeight = window.innerHeight;
    else if ((document.body) && (document.body.clientHeight))
        winHeight = document.body.clientHeight;

    // 通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
        winHeight = document.documentElement.clientHeight;
        winWidth = document.documentElement.clientWidth;
    }
}

//简单的load,不过如果要进行参数微调,不知如何得到load的对象
function load(scene, path, scaleNum) {
    //        var material = Race THREE.MeshBasicMaterial({color:0xff00, side:THREE.DoubleSide});
    //        var house = Race THREE.Mesh(geometry, material);
    new THREE.JSONLoader().load(path, function (geometry, material) {
        var temp = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(material));
        if (scaleNum > 0) {
            temp.scale.set(scaleNum, scaleNum, scaleNum);
        }
        scene.add(temp);
    });
}
//简单的四舍五入,到小数点后几位
function round(num, bit) {
    return Math.round(num * Math.pow(10, bit)) / Math.pow(10, bit);
}

/**
 * 该方法将根据所给的rect画出一个长方体,该方法是精确判断汽车碰撞的检测方法
 * @param rect
 * @returns {Line}
 */
function drawRect(rect) {
    var baseMaterial = new THREE.LineBasicMaterial({color : 0x0000ff});
    var height = 0;
    var tempG = new THREE.Geometry();
    tempG.vertices.push(
        new THREE.Vector3(rect[0], height, rect[1]),
        new THREE.Vector3(rect[0] + rect[2], height, rect[1]),
        new THREE.Vector3(rect[0] + rect[2], height, rect[1] - rect[3]),
        new THREE.Vector3(rect[0], height, rect[1] - rect[3]),
        new THREE.Vector3(rect[0], height, rect[1]));
    return new THREE.Line(tempG, baseMaterial);
}

