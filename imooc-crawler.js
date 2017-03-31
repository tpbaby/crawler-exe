//---------------拿到源码-----------------//

var http = require('http');

//慕课网地址
var url = 'http://www.imooc.com/learn/348';

//http的事件触发机制是on

//1、url   2、回调的方法res
http.get(url, function(res){
    
    var html = '';
    
    //res有data事件触发时，写一个回调函数data
    res.on('data',function(data){
        html += data;
    })
    
    res.on('end', function(){
        console.log(html);
    })
}).on('error',function(){
    console.log('获取课程数据出错！');
})
