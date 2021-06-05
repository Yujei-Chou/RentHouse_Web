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


let fireCheck=0;
let petCheck=0;
var lat;
var lng;

$("#fire").click(function(){
    fireCheck = 1; 
});
$("#pet").click(function(){
    petCheck = 1;
});
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

    $.ajax({
        type: "POST",
        url: "upload_house",
        data:{
        house_type: pattern,
        region: $('#region').val(),
        address: $('input[name=address]').val(),
        type: $('input[name=type]').val(),
        price:$('input[name=price]').val(),
        fire:fireCheck,
        pet:petCheck,
        house_info:$('#house_info').val(),
        picture1:$('#picURL').attr('url'),
        picture2:$('#picURL2').attr('url'),
        lat:lat,
        lng:lng
        },
        success: function (data){  
        console.log(data)
        alert('上傳成功')
        }
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

$('body').on('change', '#upload', function(){
    readURL(this)
  })
$('body').on('change', '#upload2', function(){
    readURL2(this)
  })

  function readURL(input){
	if(input.files && input.files[0]){

			
		var reader = new FileReader();
		
		reader.onload = function (e) {
            $("#picURL").attr('url', e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}
}
  function readURL2(input){
	if(input.files && input.files[0]){

			
		var reader = new FileReader();
		
		reader.onload = function (e) {
            $("#picURL2").attr('url', e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}
}

var geocoder;

function initMap() {
    geocoder = new google.maps.Geocoder();
}
    
function codeAddress() {
    var address = document.getElementById("address").value;
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // 緯度：results[0].geometry.location.lat()
            // 經度：results[0].geometry.location.lng()
            lat=results[0].geometry.location.lat();
            lng=results[0].geometry.location.lng();
            alert("lat=" + results[0].geometry.location.lat() + ",lng=" + results[0].geometry.location.lng());
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}