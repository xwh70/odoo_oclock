odoo.define('odoo_oclock', function (require) {

    var AbstractAction = require('web.AbstractAction');
    var digit = require('odoo_oclock.digits')
    var core = require('web.core');
    var ajax = require('web.ajax');

    var oclock = AbstractAction.extend({
        // 对应xml中t-name
        template: 'odoo_oclock.oclock_template',
        clockSetInterval: 0,
        destroy: function() {
            clearInterval(this.clockSetInterval);
            this._super.apply(this, arguments);
        },
        init: function(parent, data){
            this.WINDOW_WIDTH = 1600;
            this.WINDOW_HEIGHT = 768;
            this.RADIUS = 8;
            this.MARGIN_TOP = 60;
            this.MARGIN_LEFT = 30;
            // const endTime = new Date(2022,6,17,18,19,14);
            this.curShowTimeSeconds = 0;

            this.balls = []
            this.colors = [
                '#33B5E5','#0099CC','#AA66CC','#9933CC','#99CC00', '#669900',
                '#FF4444','#D4BFD0','#D9D4E2','#6C9D9C','#B4978E','#656845'
            ]
            return this._super.apply(this, arguments);
        },

        // willStart是执行介于init和start中间的一个异步方法，一般会执行向后台请求数据的请求，并储存返回来的数据。
        // 其中ajax.loadLibs(this)会帮加载定义在cssLibs，jsLibs的js组件。
        willStart: function() {
            var self = this;
            return $.when(ajax.loadLibs(this), this._super()).then(function() {
                // console.log("in action willStart!");
            });
        },
        // start方法会在渲染完template后执行，此时可以做任何需要处理的事情。
        // 比如根据willStart返回来数据，初始化引入的第三方js库组件
        start: function() {
            var self = this;
            self.WINDOW_WIDTH = document.body.clientWidth;
            self.WINDOW_HEIGHT = document.body.clientHeight;
            self.MARGIN_LEFT = Math.round(self.WINDOW_WIDTH/10);
            self.RADIUS = Math.round(self.WINDOW_WIDTH*4/5/108) - 1;
            self.MARGIN_TOP = Math.round(self.WINDOW_HEIGHT / 8);
            self.canvas = self.$el.find('#oclock_canvas')[0];
            self.canvas.width = self.WINDOW_WIDTH;
            self.canvas.height = self.WINDOW_HEIGHT;

            var context = self.canvas.getContext('2d');
            self.curShowTimeSeconds = self.getCurShowTimeSecond();
            this.clockSetInterval = setInterval(
                function(){
                    self.render(context);
                    self.update();
                },
                50
                );

            // return this._super().then(function() {
            //     console.log("in action start!");
            //     self.WINDOW_WIDTH = document.body.clientWidth;
            //     self.WINDOW_HEIGHT = document.body.clientHeight;
            //     self.MARGIN_LEFT = Math.round(self.WINDOW_WIDTH/10);
            //     self.RADIUS = Math.round(self.WINDOW_WIDTH*4/5/108) - 1;
            //     self.MARGIN_TOP = Math.round(self.WINDOW_HEIGHT / 8);
            //     self.canvas = self.$el.find('#oclock_canvas')[0];
            //     self.canvas.width = self.WINDOW_WIDTH;
            //     self.canvas.height = self.WINDOW_HEIGHT;
            //
            //     var context = self.canvas.getContext('2d');
            //     self.curShowTimeSeconds = self.getCurShowTimeSecond();
            //     this.clockSetInterval = setInterval(
            //         function(){
            //             self.render(context);
            //             self.update();
            //         },
            //         50
            //         );
            //
            // });
        },
        getCurShowTimeSecond:function (){
            this.curTime = new Date();
            var ret = this.curTime.getHours() * 3600 + this.curTime.getMinutes()*60 + this.curTime.getSeconds();
            return ret;

        },

        update: function(){
            var self = this;
            self.nexShowTimeSecond = self.getCurShowTimeSecond();

            self.nextHours = parseInt(self.nexShowTimeSecond/3600);
            self.nextMinutes = parseInt((self.nexShowTimeSecond-self.nextHours * 3600) / 60);
            self.nextSeconds = self.nexShowTimeSecond % 60;

            self.curHours = parseInt(self.curShowTimeSeconds/3600);
            self.curMinutes = parseInt((self.curShowTimeSeconds-self.curHours * 3600) / 60);
            self.curSeconds = self.curShowTimeSeconds % 60;

            if(self.nexShowTimeSecond != self.curSeconds){
                // 生成小球
                if (parseInt(self.curHours/10)!=parseInt(self.nextHours/10)) {
                    self.addBalls(self.MARGIN_LEFT + 0, self.MARGIN_TOP, parseInt(self.curHours/10))
                }
                if (parseInt(self.curHours%10)!=parseInt(self.nextHours%10)) {
                    self.addBalls(self.MARGIN_LEFT + 15*(self.RADIUS+1), self.MARGIN_TOP, parseInt(self.curHours%10))
                }
                if (parseInt(self.curMinutes/10)!=parseInt(self.nextMinutes/10)) {
                    self.addBalls(self.MARGIN_LEFT + 39*(self.RADIUS+1), self.MARGIN_TOP, parseInt(self.curMinutes/10))
                }
                if (parseInt(self.curMinutes%10)!=parseInt(self.nextMinutes%10)) {
                    self.addBalls(self.MARGIN_LEFT + 54*(self.RADIUS+1), self.MARGIN_TOP, parseInt(self.curMinutes%10))
                }
                if (parseInt(self.curSeconds/10)!=parseInt(self.nextSeconds/10)) {
                    self.addBalls(self.MARGIN_LEFT + 78*(self.RADIUS+1), self.MARGIN_TOP, parseInt(self.curSeconds/10))
                }
                if (parseInt(self.curSeconds%10)!=parseInt(self.nextSeconds%10)) {
                    self.addBalls(self.MARGIN_LEFT + 93*(self.RADIUS+1), self.MARGIN_TOP, parseInt(self.curSeconds%10))
                }
                self.curShowTimeSeconds = self.nexShowTimeSecond;
                self.updateBalls();

            }
        },

        updateBalls:function (){
            var self = this;
            for (let i = 0; i < self.balls.length; i++) {
                self.balls[i].x += self.balls[i].vx;
                self.balls[i].y += self.balls[i].vy;
                self.balls[i].vy += self.balls[i].g;
                if (self.balls[i].y >= self.WINDOW_HEIGHT - self.RADIUS) {
                    self.balls[i].y = self.WINDOW_HEIGHT - self.RADIUS;
                    self.balls[i].vy = -self.balls[i].vy * 0.7
                }
            }
            let cnt = 0;
            for (let i = 0; i < self.balls.length; i++) {
                if (self.balls[i].x + self.RADIUS > 0 && self.balls[i].x - self.RADIUS < self.WINDOW_WIDTH) {
                    self.balls[cnt++] = self.balls[i];
                }
            }
            while(self.balls.length>cnt){
                self.balls.pop();
            }
        },

        addBalls:function (x, y, num){
            var self = this;
            for (var i=0; i<digit[num].length;i++){
                for(var j=0; j<digit[num][i].length; j++){
                    if (digit[num][i][j] === 1){
                        var aBall = {
                            x:x+j*2*(self.RADIUS+1)+(self.RADIUS+1),
                            y:y+i*2*(self.RADIUS+1)+(self.RADIUS+1),
                            g:1.5+Math.random(),
                            vx:(Math.random() >= 0.5?1:-1) * 4,
                            vy:-10 * Math.random(),
                            colors: self.colors[Math.floor(Math.random() * self.colors.length)]
                        }
                        self.balls.push(aBall)

                    }
                }
            }
        },

        render:function (cxt){
            var self = this;
            cxt.clearRect(0,0,self.WINDOW_WIDTH,self.WINDOW_HEIGHT);
            const hours = parseInt(self.curShowTimeSeconds / 3600);
            const minutes = parseInt((self.curShowTimeSeconds - hours * 3600) / 60);
            const seconds = self.curShowTimeSeconds % 60;

            // 小时
            self.renderDigit(self.MARGIN_LEFT,self.MARGIN_TOP,parseInt(hours / 10), cxt);
            self.renderDigit(self.MARGIN_LEFT + 15*(self.RADIUS+1), self.MARGIN_TOP,parseInt(hours % 10), cxt);
            self.renderDigit(self.MARGIN_LEFT + 30*(self.RADIUS+1),self.MARGIN_TOP, 10, cxt);

            self.renderDigit(self.MARGIN_LEFT+ 39*(self.RADIUS+1), self.MARGIN_TOP,parseInt(minutes / 10), cxt);
            self.renderDigit(self.MARGIN_LEFT + 54*(self.RADIUS+1), self.MARGIN_TOP,parseInt(minutes % 10), cxt);
            self.renderDigit(self.MARGIN_LEFT + 69*(self.RADIUS+1),self.MARGIN_TOP, 10, cxt);

            self.renderDigit(self.MARGIN_LEFT + 78*(self.RADIUS+1),self.MARGIN_TOP,parseInt(seconds / 10), cxt);
            self.renderDigit(self.MARGIN_LEFT + 93*(self.RADIUS+1), self.MARGIN_TOP,parseInt(seconds % 10), cxt);
            // renderDigit(MARGIN_LEFT + 69*(RADIUS+1),MARGIN_TOP,10, cxt);
            for (let i = 0; i < self.balls.length; i++) {
                cxt.beginPath();
                cxt.fillStyle = self.balls[i].colors;
                cxt.arc(self.balls[i].x, self.balls[i].y, self.RADIUS, 0, 2 * Math.PI, true);
                cxt.closePath();
                cxt.fill();
            }
        },

        renderDigit: function (x,y,num,cxt){
            var self = this;
            cxt.fillStyle = "yellow";
            for (var i=0; i<digit[num].length;i++){
                for(var j=0; j<digit[num][i].length; j++){
                    if (digit[num][i][j] === 1){
                        cxt.beginPath();
                        cxt.arc(x+j*2*(self.RADIUS+1)+(self.RADIUS+1), y+i*2*(self.RADIUS+1)+(self.RADIUS+1), self.RADIUS, 0, 2*Math.PI);
                        cxt.closePath();
                        cxt.fill();
                    }
                }
            }
        },


    });
    // 对应client_action中的tag
    core.action_registry.add('odoo_oclock.load_clock', oclock);
    return oclock;
})