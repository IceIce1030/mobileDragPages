# mobileDragPages
dragePages


need jquery and link js
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="js/myDrag.js"></script>

// id，高度，寬度，跳頁按鈕
var myDrag = new dragenFun('#myDrag',"100vh - 50px","");

// 註冊menu事件
$('.menu > div').on('click',function(){
  let page = $(this).data("page");
  myDrag._jumpView(page);
});


# You can go to the page you want to go to
myDrag._jumpView(number);


# Will return to the current display page
myDrag.getcurrentIndex()
