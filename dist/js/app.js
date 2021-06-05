function error(type, str) {
  $(type + '-error').text(str);
  $(type).addClass('err');
}

function clear() {
  $('#name-error').text("");
  $('#email-error').text("");
  $('#password-error').text("");
  $('#password2-error').text("");
  $('#name').removeClass('err');
  $('#email').removeClass('err');
  $('#password').removeClass('err');
  $('#password2').removeClass('err');
  $('#gender').removeClass('err');
$('#role').removeClass('err');

}

function check() {
  clear();
  var english = /^[A-Za-z0-9]+$/;
  var phonenumber = /^09[0-9]{8}$/
  const name = $('#name').val();
  const email = $('#email').val();
  const password = $('#password').val();
  const password2 = $('#password2').val();

  let ans = true;

  if (name == "") {
      error("#name", '此為必填欄位');
      ans = false;
  }

  if (email == "") {
      error("#email", '此為必填欄位');
      ans = false;
  }
  
  if (password == "") {
      error("#password", '此為必填欄位');
      ans = false;
  } else {
      if (!phonenumber.test(password)) {
          error("#password", '非台灣手機號碼格式');
          ans = false;
      }
  }
  if (password2 == "") {
      error("#password2", '此為必填欄位');
      ans = false;
  } else {
      if (password != password2) {
          error("#password2", '密碼與上方不符');
          ans = false;
      }
  }



  return ans;

}


//let fireCheck=0;
//let petCheck=0;
/*
$('#fire').click(function(){
    $('#fire').val('on')
    //fireCheck = 1; 
});
$('#pet').click(function(){
    $('#pet').val('off')
    //petCheck = 1;
});
*/

$('#data_submit').click((event) => {
    event.preventDefault()
    var pattern=5;
    // var img1 = document.getElementById('son').contentWindow.document.getElementById('T1').value;
    // var img2 = document.getElementById('son').contentWindow.document.getElementById('T3').value;
    // console.log(img1)
    // console.log(img2)
    if($('#house_type').val()=="0")
    {
        pattern=0;
    }
    else if($('#house_type').val()=="1")
    {
        pattern=1;
    }
    else if($('#house_type').val()=="2,3,4")
    {
        var str=$('input[name=type]').val();
        var str1=str.indexOf('衛');
        var str2=str.indexOf('套');
        var str3=str.indexOf('雅');
        if( (str1!=-1 || str2!=-1) && str3!=-1)
        {
            pattern=2;
        }
        else if(str3!=-1)
        {
            pattern=3;
        }
        else{
            pattern=4;
        }
        
    }


    $.get('/upload_house', {
        house_type: pattern,
        region: $('#region').val(),
        address: $('input[name=address]').val(),
        type: $('input[name=type]').val(),
        price:$('input[name=price]').val(),
        fire:fireCheck,
        pet:petCheck,
        house_info:$('#house_info').val(),
        // picture1:img1,
        // picture2:img2,

      }, (data) => {
        console.log(data)
        alert('上傳成功')
      })
})

$("#clear_btn").click(function(){
      
  $("#region").val(0);
  $("#house_type").val("不限");
  $('input[name=address]').val(""); 
  $('input[name=type]').val("");
  $('input[name=price]').val("");
  $('#house_info').val(""),
  $("#fire").attr("checked", false);
  $("#pet").attr("checked", false);

});