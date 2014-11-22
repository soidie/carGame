/**
 * Created by Javer on 14-9-6.
 */
/**
 * 该类将构造不同的RaceData,要想获取不同的地图信息
 * 请调用getRaceData(race_data_id);
 * race_data_id 为该类的常量,如SIMPLE_RACE
 * @constructor
 */
function RaceCollection() {
    this.SIMPLE_RACE = 0;
    this.DIFFICULT_RACE = 1;
    this.NORMAL_RACE = 2;
    this.getRaceData = function(race_data_id){
        switch(race_data_id) {
            case this.SIMPLE_RACE:
                return new RaceData('./models/race_models/simple_race/p1.json',
                './models/race_models/simple_race/p1_collision.jpg');break;
            case this.DIFFICULT_RACE:
                return new RaceData('./models/race_models/difficult_race/p2.json',
                './models/race_models/difficult_race/p2_collision.jpg');break;
            case this.NORMAL_RACE:
                return new RaceData('./models/race_models/normal_race/p3.json',
                './models/race_models/normal_race/collision.jpg',
                null,
                    [{x:500, y:500},{x:500, y:3500},{x:3500, y:3500},{x:3500,y:500}], 500);
            default :
                return null;
        }
    }
}

/**
 * 存储地图所有信息的类
 * @param js_data 3d地图.js的路径
 * @param coll_data 碰撞地图.jpg的路径
 * @param map_data 小地图.jpg的路径
 * @param direction_data 包揽一系列检测方向的点
 * @param times 放大的倍数
 * @returns {{js_data: *, coll_data: *, map_data: *, direction_data: *}}
 * @constructor
 */
function RaceData(js_data, coll_data, map_data, direction_data, times) {
    return {js_data : js_data, coll_data : coll_data, map_data : map_data, direction_data :direction_data, times:times};
}