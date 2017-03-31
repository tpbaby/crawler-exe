
var http = require('http');

var Promise  = require('bluebird');

//类似于jquery的一个模块
var cheerio = require('cheerio');

var baseUrl = 'http://www.imooc.com/learn/';

//慕课网地址
var url = 'http://www.imooc.com/learn/348';

var videoIds = [348,259,197, 134, 75];


//---------这里的方法采用的是cheerio包里面的方法----------------//
function filterChapters(html){
    var $ = cheerio.load(html);
    
    var chapters = $('.chapter');
    
    var title = $('.hd h2').text();
    
    //console.log('课程名字'+ title);
    
    var number = $('.js-learn-num').text();
    
    //每一章里面会有很多内容，放到数组里面
    /*courseData = {
        title:title,
        number:number,
        videos:[{
            chapterTitle : '',
            videos : [
                title : '',
                id : '',
                ]

            }]
    }*/
    
    var courseData = {
        title : title,
        
        number : number,
        
        videos : []   
    }
    
    //对每一章进行遍历-------------一重循环--------//
    chapters.each(function(item){
        
        var chapter = $(this);
        
        var chapterTitile = chapter.find('strong').text();
        
        var videos = chapter.find('.video').children('li');
        
        var chapterData = {
            chapterTitle : chapterTitile,
            videos : []
        }
        
        
        //------------二重循环----------------//
        videos.each(function(item){
            var video = $(this).find('.J-media-item');
            var videoTitle = video.text();
            var id = video.attr('href').split('video/')[1];

            chapterData.videos.push({
                title:videoTitle,
                id:id
            })
        });
        
        courseData.videos.push(chapterData);
        
    });
    
    return courseData;
    
}



function printCourseInfo(coursesData){
    
    coursesData.forEach(function(courseData){
        console.log(courseData.number +  '人学过' + courseData.title + '\n')
    })
    
    coursesData.forEach(function(courseData){
        console.log('####' + courseData.title + '\n');
        
        courseData.videos.forEach(function(item){
            //console.log('####' + courseData.title + '\n');

            var chapterTitle = item.chapterTitle; 

            console.log(chapterTitle + '\n');

            item.videos.forEach(function(video){
                console.log('【' + video.id + '】' + video.title );
            });
        });
    });
}




function getPageAsync(url)
{
    return new Promise(function(resolve, reject){
        console.log('正在爬取' + url);
        

        http.get(url, function(res){

            var html = '';

            //res有data事件触发时，写一个回调函数data
            res.on('data',function(data){
                html += data;
            })

            res.on('end', function(){
               // console.log(html);
                resolve(html);  
                
                //将html作为一个参数传给一个function，让这个函数去做信息的过滤
                //var courseData =  filterChapters(html);

                //printCourseInfo(courseData);

            })
        }).on('error',function(e){
            
            //出错弹出信息
            reject(e);
            
            console.log('获取课程数据出错！');
        })
        
        
    })
}


//我希望爬出多个页面的章节，可以把多个promise对象都放入Promise里面

var fetchCourseArray = [];

videoIds.forEach(function(id){
    //爬到当前url下面的信息
    fetchCourseArray.push(getPageAsync(baseUrl + id));
})



Promise
    .all(fetchCourseArray)   //all里面是多个promise
    .then(function(pages){
        //对章节信息进行加工
        var coursesData = [];
    
        pages.forEach(function(html){
            
            var courses = filterChapters(html);
            
            coursesData.push(courses);
        })
        
        //排序
        coursesData.sort(function(a, b){
            return a.number < b.number;
        });
    
        printCourseInfo(coursesData);
    })
