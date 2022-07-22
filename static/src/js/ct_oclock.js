odoo.define('odoo_oclock.ct_oclock', function (require) {
    var WINDOW_WIDTH = 1600;
    var WINDOW_HEIGHT = 768;
    var RADIUS = 8;
    var MARGIN_TOP = 60;
    var MARGIN_LEFT = 30;
    // const endTime = new Date(2022,6,17,18,19,14);
    var curShowTimeSeconds = 0;

    var balls = []
    const colors = [
        '#33B5E5','#0099CC','#AA66CC','#9933CC','#99CC00', '#669900',
        '#FF4444','#D4BFD0','#D9D4E2','#6C9D9C','#B4978E','#656845'
    ]

    window.onload = function(){
        /** @type {HTMLCanvasElement} */
        WINDOW_WIDTH = document.body.clientWidth;
        WINDOW_HEIGHT = document.body.clientHeight;
        MARGIN_LEFT = Math.round(WINDOW_WIDTH/10);
        RADIUS = Math.round(WINDOW_WIDTH*4/5/108) - 1;
        MARGIN_TOP = Math.round(WINDOW_HEIGHT / 8);
        var canvas = document.getElementById("canvas");
        canvas.width = WINDOW_WIDTH;
        canvas.height = WINDOW_HEIGHT;

        var context = canvas.getContext('2d');
        curShowTimeSeconds = getCurShowTimeSecond();
        setInterval(
            function(){
                render(context);
                update();
            },
            50
            );




    }

    function getCurShowTimeSecond(){
        var curTime = new Date();
        var ret = curTime.getHours() * 3600 + curTime.getMinutes()*60 + curTime.getSeconds();
        return ret;

    }

    function update(){

        var nexShowTimeSecond = getCurShowTimeSecond();

        var nextHours = parseInt(nexShowTimeSecond/3600);
        var nextMinutes = parseInt((nexShowTimeSecond-nextHours * 3600) / 60);
        var nextSeconds = nexShowTimeSecond % 60;

        var curHours = parseInt(curShowTimeSeconds/3600);
        var curMinutes = parseInt((curShowTimeSeconds-curHours * 3600) / 60);
        var curSeconds = curShowTimeSeconds % 60;

        if(nexShowTimeSecond != curSeconds){
            // 生成小球
            if (parseInt(curHours/10)!=parseInt(nextHours/10)) {
                addBalls(MARGIN_LEFT + 0, MARGIN_TOP, parseInt(curHours/10))
            }
            if (parseInt(curHours%10)!=parseInt(nextHours%10)) {
                addBalls(MARGIN_LEFT + 15*(RADIUS+1), MARGIN_TOP, parseInt(curHours%10))
            }
            if (parseInt(curMinutes/10)!=parseInt(nextMinutes/10)) {
                addBalls(MARGIN_LEFT + 39*(RADIUS+1), MARGIN_TOP, parseInt(curMinutes/10))
            }
            if (parseInt(curMinutes%10)!=parseInt(nextMinutes%10)) {
                addBalls(MARGIN_LEFT + 54*(RADIUS+1), MARGIN_TOP, parseInt(curMinutes%10))
            }
            if (parseInt(curSeconds/10)!=parseInt(nextSeconds/10)) {
                addBalls(MARGIN_LEFT + 78*(RADIUS+1), MARGIN_TOP, parseInt(curSeconds/10))
            }
            if (parseInt(curSeconds%10)!=parseInt(nextSeconds%10)) {
                addBalls(MARGIN_LEFT + 93*(RADIUS+1), MARGIN_TOP, parseInt(curSeconds%10))
            }
            curShowTimeSeconds = nexShowTimeSecond;
            updateBalls();

        }
    }

    function updateBalls(){
        for (let i = 0; i < balls.length; i++) {
            balls[i].x += balls[i].vx;
            balls[i].y += balls[i].vy;
            balls[i].vy += balls[i].g;
            if (balls[i].y >= WINDOW_HEIGHT - RADIUS) {
                balls[i].y = WINDOW_HEIGHT - RADIUS;
                balls[i].vy = -balls[i].vy * 0.7
            }
        }
        var cnt = 0;
        for (let i = 0; i < balls.length; i++) {
            if (balls[i].x + RADIUS > 0 && balls[i].x - RADIUS < WINDOW_WIDTH) {
                balls[cnt++] = balls[i];
            }
        }
        while(balls.length>cnt){
            balls.pop();
        }
        console.log(balls.length);
    }

    function addBalls(x, y, num){
        for (var i=0; i<digit[num].length;i++){
            for(var j=0; j<digit[num][i].length; j++){
                if (digit[num][i][j] == 1){
                    var aBall = {
                        x:x+j*2*(RADIUS+1)+(RADIUS+1),
                        y:y+i*2*(RADIUS+1)+(RADIUS+1),
                        g:1.5+Math.random(),
                        vx:(Math.random() >= 0.5?1:-1) * 4,
                        vy:-10 * Math.random(),
                        colors: colors[Math.floor(Math.random() * colors.length)]
                    }
                    balls.push(aBall)

                }
            }
        }
    }

    function render(cxt){
        cxt.clearRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT);
        var hours = parseInt(curShowTimeSeconds/3600);
        var minutes = parseInt((curShowTimeSeconds-hours * 3600) / 60);
        var seconds = curShowTimeSeconds % 60;

        // 小时
        renderDigit(MARGIN_LEFT,MARGIN_TOP,parseInt(hours / 10), cxt);
        renderDigit(MARGIN_LEFT + 15*(RADIUS+1), MARGIN_TOP,parseInt(hours % 10), cxt);
        renderDigit(MARGIN_LEFT + 30*(RADIUS+1),MARGIN_TOP, 10, cxt);

        renderDigit(MARGIN_LEFT+ 39*(RADIUS+1), MARGIN_TOP,parseInt(minutes / 10), cxt);
        renderDigit(MARGIN_LEFT + 54*(RADIUS+1), MARGIN_TOP,parseInt(minutes % 10), cxt);
        renderDigit(MARGIN_LEFT + 69*(RADIUS+1),MARGIN_TOP, 10, cxt);

        renderDigit(MARGIN_LEFT + 78*(RADIUS+1),MARGIN_TOP,parseInt(seconds / 10), cxt);
        renderDigit(MARGIN_LEFT + 93*(RADIUS+1), MARGIN_TOP,parseInt(seconds % 10), cxt);
        // renderDigit(MARGIN_LEFT + 69*(RADIUS+1),MARGIN_TOP,10, cxt);
        for (let i = 0; i < balls.length; i++) {
            cxt.beginPath();
            cxt.fillStyle = balls[i].colors;
            cxt.arc(balls[i].x, balls[i].y, RADIUS, 0, 2 * Math.PI, true);
            cxt.closePath();
            cxt.fill();
        }
    }

    function renderDigit(x,y,num,cxt){
        cxt.fillStyle = "rgb(0,102,153)";
        for (var i=0; i<digit[num].length;i++){
            for(var j=0; j<digit[num][i].length; j++){
                if (digit[num][i][j] == 1){
                    cxt.beginPath();
                    cxt.arc(x+j*2*(RADIUS+1)+(RADIUS+1), y+i*2*(RADIUS+1)+(RADIUS+1), RADIUS, 0, 2*Math.PI);
                    cxt.closePath();
                    cxt.fill();
                }
            }
        }
    }
})
