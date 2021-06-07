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
function clear_upload(){
    $('#picURL-error').text("");
    $('#picURL2-error').text("");
    $('#region-error').text("");
    $('#house_type-error').text("");
    $('#address-error').text("");
    $('#type-error').text("");
    $('#price-error').text("");
    $('#price-error').text("");
    $('#house_info-error').text("");
}
function check_upload(){
    let ans = true;
    clear_upload();
    const region=$('#region').val();
    const house_type=$('#house_type').val();
    const address=$('#address').val();
    const type= $('#type').val();
    const price= $('#price').val();
    const house_info= $('#house_info').val();
    const picURL=$('#picURL').attr('url')
    const picURL2=$('#picURL2').attr('url')

    if(picURL=="")
    {
      error("#picURL", '請上傳房屋圖片1');
      ans = false;
    }
    if(picURL2=="")
    {
      error("#picURL2", '請上傳房屋圖片2');
      ans = false;
    }
    if(region=="台南")
    {
      error("#region", '此為必選欄位');
      ans = false;
    }
    if(house_type=='0,1,2,3,4')
    {
      error("#house_type", '此為必選欄位');
      ans = false;
    }
    if(address=="")
    {
      error("#address", '此為必填欄位');
      ans = false;
    }
    if(type=="")
    {
      error("#type", '此為必填欄位');
      ans = false;
    }
    if(price=="")
    {
      error("#price", '此為必填欄位');
      ans = false;
    }
    if(house_info=="")
    {
      error("#house_info", '此為必填欄位');
      ans = false;
    }

    return ans;
}





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


function initMap() {
    geocoder = new google.maps.Geocoder();
    return geocoder
}

function upload() {
    if(check_upload())
    { 
        initMap().geocode({
            'address': $('input[name=address]').val()
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {   
                        
                let pattern=5
                if($('#house_type').val()=='0')
                {
                    pattern=0
                }
                else if($('#house_type').val()=='1')
                {
                    pattern=1
                }
                else if($('#house_type').val()=='2,3,4')
                {
                    var str=$('input[name=type]').val()
                    var str1=str.indexOf('衛')
                    var str2=str.indexOf('套')
                    var str3=str.indexOf('雅')
                    if( (str1!=-1 || str2!=-1) && str3!=-1)
                    {
                        pattern=2
                    }
                    else if(str3!=-1)
                    {
                        pattern=3
                    }
                    else{
                        pattern=4
                    }
                    
                }

                if($('input[name=fire]').prop( "checked" )){
                    $('input[name=fire]').val('1')
                }

                if($('input[name=pet]').prop( "checked" )){
                    $('input[name=pet]').val('1')
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
                        fire:$('input[name=fire]').val(),
                        pet:$('input[name=pet]').val(),
                        house_num:$('input[name=house_num]').val(),                        
                        house_info:$('#house_info').val(),
                        picture1:$('#picURL').attr('url'),
                        picture2:$('#picURL2').attr('url'),
                        cond:$('#clearPic_btn').attr('cond'),
                        lat:results[0].geometry.location.lat(),
                        lng:results[0].geometry.location.lng()
                    },
                    success: function (data){  
                        alert('上傳成功')
                        $('#clear_btn').trigger('click')
                        clearPage()
                    }
                })
            } else {
                alert('錯誤地址')
            }
        })
    }
}