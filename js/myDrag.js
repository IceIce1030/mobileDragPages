
// new swiper start
// id，高度，寬度
function dragenFun(id,c_height,c_width,type){
  this.mainTag = id;                                        // 最外層tag id 或 classname
  this.window_h = c_height || $(window).height();           // 視窗高度
  this.window_w = c_width || $(window).width();             // 視窗寬度
  this.window_w_origin = c_width || $(window).width();      // 視窗寬度(原始寬度)
  this.customW = c_width != "" ? true : false;              // 是否自訂視窗寬
  this.customH = c_height != "" ? true : false;             // 是否自訂視窗高
  this.startPoint = [];                                     // 起始點
  this.endPoint = [];                                       // 結束點
  this.originLeft = 0;                                      // ul css 的 left translateX 移動距離
  this.view_index = 0;                                      // 目前頁數
  this.viewSum = 0;                                         // 總共頁數
  this.speed = 300;                                         // 設定畫面移動速度
  this.minMoveDistance = 100;                               // 至少移動多少才換頁，到頁首頁尾的最大距離
  this.moveTime = 30;                                       // 點擊或碰觸時間
  this.dragDuration = 0;                                    // 儲存計算觸碰時間
  this.timmerInter = "";                                    // 儲存timer 的 setInterval
  this.autoTimerInert = '';                                 // 儲存自動輪播的 setInterval
  this.infinite = false;                                    // 確認是否要無限上(下)頁
  this.MaxMoveDistance = 50;                                // 到第一頁(末頁)最大移動距離
  this.canMoving = true;																		// 判斷是否可以移動

  // 初始設定
  this.init = function(){

    // 設定viewbox
    $(this.mainTag).css({
      'height' : "calc(" + this.window_h + ")",
      'width' :  this.window_w,
      'overflow' : 'hidden',
      'position' : 'relative'
    });
    // 設定box
    $(this.mainTag + ' > ul').addClass('dragBoxContainer').css({
      'transition-duration' : 0 + 'ms',
      'position' : 'relative',
      'left' : 0,
      "-webkit-transform" : "translate3d(0,0,0)",
      "-moz-transform" : "translate3d(0,0,0)",
      "transform" : "translate3d(0,0,0)",
      "-webkit-transform-style" : "preserve-3d",
      "-moz-transform-style" : "preserve-3d",
      "transform-style" : "preserve-3d",
      "-webkit-transition-property" : "transform",
      "-moz-transition-property" : "transform",
      "transition-property" : "transform"
    });
    this._ulWidth();
    this._liWidth();
    this._resizeWidth(); // 註冊 resize 事件 重新設定寬高
    this.whatDevice(); // 判斷裝置宣告事件


    // simple:都沒有，prevnext:有上下一頁，dot:有小點點
    if( typeof(type) == 'object' ){ // 可能傳入多個功能
      for(var i = 0; i < type.length; i++){
        this.addControlElement(type[i]); // 新增控制按鈕
      }
    }else if(typeof(type) == 'string'){ // 只需要一個功能
      this.addControlElement(type); // 新增控制按鈕
    }

  };
  // 計時器
  this._timmer = function(doWhat){
    if(doWhat == 'start'){
      var self = this;
      self.dragDuration = 0;
      this.timmerInter = setInterval(function(){
      self.dragDuration++;
      },1);
    }else if(doWhat == 'end'){
      clearInterval(this.timmerInter);
    }
  };
  // 新增控制物件
  this.addControlElement = function(type){
    var self = this;
    if(type == "prevnext"){
      // 插入上下頁按鈕
      $(self.mainTag).append("<div class='prevpage'></div><div class='nextpage'></div>");
      // 註冊按鈕事件
      $(self.mainTag + ' .prevpage,'+ self.mainTag + ' .nextpage').click(function(){
        var className = $(this).attr('class');
        if(className == 'prevpage'){
        // 上一頁
          self._checkIndex('left');
        }else if(className == 'nextpage'){
        // 下一頁
          self._checkIndex('right');
        }
        self._jumpView(self.view_index);
      });
    }else if(type == "dot"){
      // 插入小點點
      // 計算幾個點點
      var spanDot = '';
      for(var i = 0; i < self.viewSum; i++){
        spanDot += '<span></span>';
      }
      $(self.mainTag).append("<div class='dotpage'>" + spanDot + "</div>");
      // 註冊 span 事件
      $( self.mainTag + " .dotpage > span").click(function(e){
        var i = $(e.target).index();
        self.view_index = i;
        self._jumpView(i);
      });
    }
  };
  // ul 寬度
  this._ulWidth = function(){
    // 取得 li 數量
    this.viewSum = $(this.mainTag + ' > ul > li').length;;
    var total_width = this.window_w;
    if(isNaN( total_width)){
      total_width = total_width.match(/([0-9]*)([^0-9]*)/i,'');
      total_width = (total_width[1] * this.viewSum) + total_width[2];
    }else{
      total_width = total_width * this.viewSum;
    }
    // 設定 ul 寬度
    $(this.mainTag + ' > ul').css({ "width" : total_width});
  };
  
  
  
  
  
  // li 寬度
  this._liWidth = function(){
    $(this.mainTag + ' > ul > li').css({
      'width' : this.window_w,
      'height' : "calc(" + this.window_h + ")",
      'float' : 'left',
      'overflow-y' : 'scroll'
      // 'outline' : '1px solid #f00', //測試用
    });
  };
  // 畫面 resize 事件
  this._resizeWidth = function(){
    var self = this;

    $(window).resize(function(){
        if(self.window_h != $(window).height()){

          // window_w_origin
          if(self.customW == false){ // 沒有有另外給寬度
            // 取得視窗寬度
            self.window_w = self.window_w == $(window).width() ? self.window_w_origin :  $(window).width();
          }
          if(self.customH == false){// 沒有有另外給高度
            // 取得視窗高度
            self.window_h = $(window).height();
          }

          self._ulWidth();
          self._liWidth();

          $(self.mainTag).css({
            'height' : self.window_h,
            'width' : self.window_w,
            'overflow' : 'hidden'
          });


          self._jumpView(self.view_index);
        }
    });
  };
  // 判斷裝置宣告事件
  this.whatDevice = function(){
    var userAgent = navigator.userAgent;
    console.log(userAgent)
    if(/Android/i.test(userAgent)){
      // 是否為Android
      this._addevent("android");
    }else if(/iPhone|iPad/i.test(userAgent)){
      // 是否為iPhone或iPad
      this._addevent("ios");
    }else{
      // 使否是用電腦觀看
      this._addevent("pc");
    }
  };
  // 計算
  this.calc = function(){
    this.startPoint[0]; //x
    this.startPoint[1]; //y
    this.endPoint[0]; //x
    this.endPoint[1]; //y
    var line_x = Math.abs(this.endPoint[0] - this.startPoint[0]);
    var line_y = Math.abs(this.endPoint[1] - this.startPoint[1]);
    // console.log(line_x,line_y);
    this.canMoving = line_x > line_y ? false : true;
  };
  
  
  
  
  
  
  // 註冊事件
  this._addevent = function(dev){
    var el = this.mainTag;
    var self = this;
    // pc
    if(dev === "pc"){
      $(el)
      .mousedown(function(event){
        // 按下-畫面要動
        _startEvent(event);
        // console.log("star");
        event.preventDefault();
      })
      .mouseup(function(event){
        // 起來-畫面停止，畫面校正
        _endEvent();
        // console.log("stop");
      })
      .mousemove(function(event){
        // 移動-抓取移動距離
        _moveEvent(event);
      });
    }
    // moblie
    else if(dev === "ios" || dev === "android"){
      $(el).on('touchstart',function(event){
        // 按下-畫面要動
        _startEvent(event);
        // console.log('start-m');
      })
      .on('touchend',function(event){
        // 起來-畫面停止，畫面擺正
        _endEvent();
        // console.log('stop-m');
      })
      .on('touchmove',function(event){
        // 移動-抓取移動距離
        if(self.startPoint.length > 0){
          _moveEvent(event);
        }
      });
    }

    // 取消事件
    function Cancelhandler() {
      event.preventDefault();
    }
    // 按下-畫面要動-funciotn
    function _startEvent(event){
      // event.preventDefault();
      self.startPoint[0] = event.pageX || event.originalEvent.touches[0].pageX;
      self.startPoint[1] = event.pageY || event.originalEvent.touches[0].pageY;
      self.originLeft = self._getUlLeft();
      self._timmer('start');// 計時開始
    }
    // 起來-動作停止，校正畫面
    function _endEvent(){
      var distance = (parseFloat(self.originLeft) -  self._getUlLeft()) * (-1);
      // distance < 0 往右一頁，distance > 0 往左一頁

      if(self.dragDuration < self.moveTime){
        // 滑動時間
        NewViewIndex(distance);
      }
      else if(Math.abs(distance) > (self.window_w / 4)){
        // 看畫面有沒有移動超過(1/4)
        NewViewIndex(distance);
      }
      function NewViewIndex(distance){
        if(distance < 0){ // 往右一頁
          // 是否是最後一頁
          self._checkIndex('right');
          // 左滑事件
          self.swipeLeft();
        }else if(distance > 0){ // 往左一頁
          // 是否是第一頁
          self._checkIndex('left');
          // 右滑事件
          self.swipeRight();
        }
      }
      self._jumpView(self.view_index);
      self.startPoint = [];
      self._timmer('end'); // 計時結束
      // console.log(self.dragDuration);
    }
    // 移動-抓取移動距離
    function _moveEvent(event){
      if(self.startPoint.length > 0){
        // event.pageX(左右) ， event.pageY(上下)
        var _x = event.pageX || event.originalEvent.touches[0].pageX;
        var _y = event.pageY || event.originalEvent.touches[0].pageY;
        self.endPoint[0] = _x;
        self.endPoint[1] = _y;
        // 移動位置 - 原本位置
        var moveDistance = _x - self.startPoint[0];


        if( Math.abs(_y - self.startPoint[1]) < 50 && Math.abs(moveDistance) > 50 ){
          self._MoveView(parseFloat(moveDistance));
        }
      }
      self.calc(); // todo

      if(!self.canMoving){
        event.preventDefault();
        // document.addEventListener('touchmove', Cancelhandler, false);
      }else{
        // document.removeEventListener('touchmove', Cancelhandler, false);
      }
    }
  };
  
  
  
  
  // 移動 ul
  this.ulMove = function(left, path){
    var translate = "translate3d(" + left + "px,0,0)";
    $(this.mainTag + ' > ul').css({
      "-webkit-transform" : translate,
      "-moz-transform" : translate,
      "transform" : translate
    });
  };
  
  
  
  // 跳轉頁面
  this._jumpView = function(page){
    this.view_index = page;
    var left = this.window_w * page * (-1);
    var translate = "translate3d(" + left + "px,0,0)";
    $(this.mainTag + ' > ul').css({
      "-webkit-transform" : translate,
      "-moz-transform" : translate,
      "transform" : translate,
      'transition-duration' : this.speed + 'ms'
    });
    var self = this;
    setTimeout(function(){
      $(self.mainTag + ' > ul').css({
        'transition-duration' : 0 + 'ms'
      });
    },this.speed);
  };

  // 取得 ul 的 css left translateX
  this._getUlLeft = function(){
    var $id_ul = $(this.mainTag + ' > ul');

    var trl = $id_ul.css('transform') || $id_ul.css('-webkit-transform') || $id_ul.css('-moz-transform');

    var transArr = [];
    var  mat = trl.match(/^matrix3d\((.+)\)$/);
    if(mat) return parseFloat(mat[1].split(', ')[13]);
    mat = trl.match(/^matrix\((.+)\)$/);

    var mat_s = mat[1].split(", ");
    return parseFloat(mat_s[4]);
  };
  this._MoveView = function(distance){
    var ul_left = this.originLeft;
    var path = "";

    if(this.view_index == 0 && distance > 0){
      // 第一頁
      if(distance > this.MaxMoveDistance){
        distance = this.MaxMoveDistance;
      }

      path = 'left';
    }else if(this.view_index == (this.viewSum - 1) && distance < 0){
      // 到末頁 最大移動距離 不要超出範圍
      path = 'right';
      if(distance < (-1) * this.MaxMoveDistance){
        distance = (-1) * this.MaxMoveDistance;
      }
    }

    ul_left = parseFloat(ul_left) + parseFloat(distance);
    this.ulMove(ul_left, path);
  };
  // 判斷是否到頁首或頁尾，設定view_index
  this._checkIndex = function(path){
    if(path == 'left'){
      // 前一頁
      if(this.view_index == 0){
        // 如果是第一頁就停在第一頁
        this.view_index = 0;
      }else{
        this.view_index--;
      }
    }else if(path == 'right'){
      // 下一頁
      if(this.view_index == this.viewSum - 1){
        // 如果是最後一頁就不再增加
        this.view_index = this.viewSum - 1;
      }else{
        this.view_index++;
      }
    }
  };
  // 回傳目前頁面 index
  this.getcurrentIndex = function(){
    return this.view_index;
  };
  // swipeLeft 事件
  this.swipeLeft = function(){
    console.log("swipeLeft");
  };
  // swipeRight 事件
  this.swipeRight = function(){
    console.log("swipeRight");
  };
  // 執行初始
  this.init();
}
/*
	鎖住往上到底事件
	ex: var plist_TouchEvent = new ToucheventLock('.plist-panel > div > div');
*/
function ToucheventLock(tagName){
	this.stp = [0,0]; 					// 起始點[x,y]
	this.edp = [0,0];						// 結束點[x,y]
	this.tagName = tagName; 		// scroll 位置

	// 執行內容
	this.run = function(){
		// 判斷裝置宣告事件
	  var userAgent = navigator.userAgent;
	  if(/Android/i.test(userAgent)){
	    // 是否為Android
	    this._addevent("android");
	  }else if(/iPhone|iPad/i.test(userAgent)){
	    // 是否為iPhone或iPad
	    this._addevent("ios");
	  }else if(/Windows/i.test(userAgent)){
	    // 使否是用電腦觀看
	    this._addevent("pc");
	  }
	};
	// 裝置事件註冊事件
	this._addevent = function(dev){
		var self = this;
		if(dev === 'ios' || dev === 'android'){
			// for mobile
			$(self.tagName)
			.on('touchstart',function(event){
				startEvent(event);
			}).on('touchmove',function(event){
				moveEvent(event);
			}).on('touchend',function(){
				// endEvent();
			});
		}else if(dev === "pc"){
			// for pc
      $(self.tagName)
      .mousedown(function(event){
        startEvent(event);
        event.preventDefault();
      })
      .mousemove(function(event){
        moveEvent(event);
      })
      .mouseup(function(){
        // endEvent();
      });
		}
		// 開始事件
		function startEvent(event){
			self.stp[0] = event.pageX || event.originalEvent.touches[0].pageX;
			self.stp[1] = event.pageY || event.originalEvent.touches[0].pageY;
		}
		// 正在移動事件
		function moveEvent(event){
			self.edp[0] = event.pageX || event.originalEvent.touches[0].pageX;
			self.edp[1] = event.pageY || event.originalEvent.touches[0].pageY;

			// 取得滾輪位置
			var tagScrollTop = $(self.tagName).scrollTop();
			// 取得方向 [上下,左右]
			var _path = calculate_path(self.stp,self.edp);

			if( tagScrollTop <= 0 && _path[0] === 'up' ){
				 event.preventDefault();
			}
		}
		// 結束事件
		function endEvent(){
		}
	};
	// 執行
	this.run();
}

/*
	menulist 移動的事件
 */
function myMenuFun(menuTag, _obj){
	this.menutag = menuTag;
	this.speed = 200;

	var self = this;
	this.menuMoveFun = function(listwidth){
		var _i = _obj.getcurrentIndex();
		var translate = "translate3d(" + (listwidth*_i) + "px,0,0)";
		$(menuTag + ' > .underline > div').width(listwidth).css({
			"-webkit-transform" : translate,
      "-moz-transform" : translate,
      "transform" : translate,
      "-webkit-transform-style" : "preserve-3d",
      "-moz-transform-style" : "preserve-3d",
      "transform-style" : "preserve-3d",
      "-webkit-transition-property" : "transform",
      "-moz-transition-property" : "transform",
      "transition-property" : "transform",
      'transition-duration' : this.speed + 'ms'
		});
	}
	$(this.menutag + ' > .my-menulist > div').click(function(){
		var _i = $(this).index();
		_obj._jumpView(_i);
		var _listWidth = $(this).width();
		self.menuMoveFun(_listWidth);
		selectChange("active",self.menutag + ' > .my-menulist > div',this);
	});
}