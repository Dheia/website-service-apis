/* Add your custom JavaScript/jQuery functions here. It will be automatically included in every page. */

let user_id = user_details = null;
let timeStamp = Math.floor(Date.now() / 1000);

var website_info = function () {
  var tmp = null;
  $.ajax({
      'async': false,
      'type': "GET",
      'global': false,
      'dataType': 'json',
      'url': "./assets/project-details.json?t="+timeStamp,
      'success': function (data) {
          tmp = data;
      }
  });
  return tmp;
}();

var website_settings = website_info[0];
//console.log("website_settings",website_settings);
var project_settings = website_settings.project_settings;

// console.log("website_settings",website_settings);
async function getProductDetailById(id) {
      var returnData = null;
    	await axios({
    			method: 'GET',
    			url: project_settings.product_api_url+"?_id="+id,
    			headers: {'vid' : website_settings.Projectvid.vid},
    		})
    	.then(response => {
         productData = response.data;
        //  console.log("productData",productData);
         if(typeof productData.hits.hits[0] != "undefined")
         {
          returnData = productData.hits.hits[0]._source;
         }
    		 return returnData
    	})
    	.catch(function (error){

    	})
    	return returnData;
}


Y({
  db: {
  name: 'indexeddb'
  },
  connector: {
  name: 'webrtc',
  room: 'wishList-example'+website_settings['projectID']+website_settings.Projectvid.vid
  // room: 'wishList-example'+website_settings['projectID']
  },
  sourceDir: null,
  share: {
      wishList: 'Array',
      compareList: 'Array',
      wishListRegister: 'Array',
      compareListRegister: 'Array'
  }
}).then(function (y) {
  window.yList = y
  // whenever content changes, make sure to reflect the changes in the DOM
  y.share.wishList.observe(function (event) {
      if (event.type === 'insert') {
        showWishList();
      } else if (event.type === 'delete') {
        $("#myWishList .listing .product-"+event._content[0].val.product_id).remove();

        if(window.yList.share.wishList._content != null && window.yList.share.wishList._content.length == 0)
        {
          $('#myWishList .listing').html('No records found.');
          document.getElementById("wishlistCount").innerHTML =  0;
        }
        else{
          document.getElementById("wishlistCount").innerHTML =  window.yList.share.wishList._content.length;
        }
        // showWishList();
      }
  })

  if(user_details != null){
    y.share.wishListRegister.observe(function (event) {
      if (event.type === 'insert') {
        showWishList();
      } else if (event.type === 'delete') {
        // console.log('event',event)
        $("#myWishList .listing .product-"+event._content[0].val.id).remove();

        updateShoppingDatabaseCount(1,'-');

        if(document.getElementById("wishlistCount").innerHTML == 0)
        {
          $('#myWishList .listing').html('No records found.');
          // document.getElementById("wishlistCount").innerHTML =  0;
        }
        // showWishList();
      }
    })

    y.share.compareListRegister.observe(function (event) {
      if (event.type === 'insert') {
        showCompareList();
      } else if (event.type === 'delete') {
        $("#myCompareList #listing .product-"+event._content[0].val.id).remove();

        updateShoppingDatabaseCount(3,'-');

        if(document.getElementById("comparedCount").innerHTML == 0)
        {
          $("#myCompareList #listing div:first").addClass("hide");
          if($('#myCompareList #listing .js-no-records').length == 0)
          {
              $('#myCompareList #listing').append('<span class="js-no-records">No records found.</span>')
          }
          else{
              $('#myCompareList #listing .js-no-records').html('No records found.')
          }
          document.getElementById("comparedCount").innerHTML =  0;
        }
        else
        {
          if(parseInt(document.getElementById("comparedCount").innerHTML)>4)
          {
            $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*parseInt(document.getElementById("comparedCount").innerHTML)+'px')
          }
          else{
            $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*5+'px')
          }
          // document.getElementById("comparedCount").innerHTML =  window.yList.share.compareListRegister._content.length;
        }
        // showCompareList();
      }
    })
  }
  y.share.compareList.observe(function (event) {
      if (event.type === 'insert') {
        showCompareList();
      } else if (event.type === 'delete') {
        $("#myCompareList #listing .product-"+event._content[0].val.product_id).remove();

        if(window.yList.share.compareList._content != null && window.yList.share.compareList._content.length == 0)
        {
          $("#myCompareList #listing div:first").addClass("hide");
          if($('#myCompareList #listing .js-no-records').length == 0)
          {
              $('#myCompareList #listing').append('<span class="js-no-records">No records found.</span>')
          }
          else{
              $('#myCompareList #listing .js-no-records').html('No records found.')
          }
          document.getElementById("comparedCount").innerHTML =  0;
        }
        else
        {
          if(window.yList.share.compareList._content.length>4)
          {
            $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*window.yList.share.compareList._content.length+'px')
          }
          else{
            $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*5+'px')
          }
          document.getElementById("comparedCount").innerHTML =  window.yList.share.compareList._content.length;
        }
        // showCompareList();
      }
  })

  $(document).ready(function() {
    init();
    if(user_id != null) {
      $('.fullname-word').text(user_details.fullname);
      if($(".my-account-left").length > 0 && admin_role_flag == 1 ){
          $(".my-account-left .js_my_inquiry").html('<i class="fa fa-share-alt"></i> Received Inquiries List')
          $(".my-account-left .js_my_order").html('<i class="fa fa-file-text"></i> Received Order List')
      }
    }
  })
})

if(getParameterByName('token')) {
  document.cookie = "auth_token="+getParameterByName('token');
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function validateEmail(sEmail) {
 var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
 if (filter.test(sEmail)) {
   return true;
 }
 else {
   return false;
 }
}

function getCookie(name) {
  var re = new RegExp(name + "=([^;]+)");
  var value = re.exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
}

let userToken = getCookie('auth_token');
let userFrontId = getCookie('user_id');

if(userToken != null && userFrontId != null) {
    var user_details = function () {
      var tmp = null;
      $.ajax({
          'async': false,
          'type': "GET",
          'url': project_settings.user_detail_api,
          'headers': {"Authorization": userToken},
          'success': function (res) {
              tmp = res.data;
              user_id = tmp._id;
            }
        });
      return tmp;
    }();
}

let admin_role_flag = 0;

if (user_id != null ) {
      if(user_details.package != undefined && !isEmpty(user_details.package)){
          //console.log("user_details",user_details);
          $.ajax({
            'async': false,
            'type': "GET",
            'url': project_settings.projcet_configuration_api_url+"/"+website_settings['projectID'],
            'success': function (response) {
                // console.log("website response",response);
                //console.log("subscriptionId",response.subscriptionId);
                if(user_details.package[response.subscriptionId] != undefined && user_details.package[response.subscriptionId].role == "admin"){
                      admin_role_flag = 1;
                }
              }
          });
      }
}

//alert(admin_role_flag)

function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace(
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;
	}
	return vars;
}

function validateEmail(sEmail) {
  var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  if (filter.test(sEmail)) {
    return true;
  }
  else {
    return false;
  }
}

function getUserInfo(){
  var userDetail = {};
  $.ajax({
    'async': false,
    'type': "GET",
    'url': project_settings.user_account_api_url+'?userEmail='+user_details.email+'&websiteId='+website_settings['projectID'],
    'success': function (response) {
      if( response.data.length > 0){
        userDetail = response.data[0];
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
    }
  });
  return userDetail;
}

let wishlist_values = "";

let compare_values = "";


$(document).on("click", ".smooth-scroll", function(event){event.preventDefault(); $("html, body").animate({scrollTop: $($.attr(this, "href")).offset().top}, 500);});
/*JS code for custom gform building*/


var init = function() {

  if(user_details != null)
  {
    if($("#myWishList").length > 0 || $("#myCompareList").length > 0)
    {
      showPageAjaxLoading();
    }

    setTimeout(function()
    {
      let values = window.yList.share.wishListRegister._content;
      try {
        for(let i = 0; i < values.length;) {
          window.yList.share.wishListRegister.delete(0)
        }
      }catch(e){}

      if(window.yList.share.wishListRegister._content.length == 0)
      {
        wishlist_values = function () {
            var tmp = null;
            $.ajax({
                'async': false,
                'type': "GET",
                'global': false,
                'dataType': 'json',
                // 'url': project_settings.shopping_api_url,
                'url': project_settings.shopping_api_url+"?type=1&user_id="+user_id+'&website_id='+website_settings['projectID'],
                'success': function (data) {
                    tmp = data;
                }
            });
            return tmp;
          }();

          if(wishlist_values !== null)
          {
            var recentAddedInWishlist = [];

            for(let item in wishlist_values)
            {
              recentAddedInWishlist.push(wishlist_values[item]);
            }
            window.yList.share.wishListRegister.push(recentAddedInWishlist);
          }
      }

      let compareListvalues = window.yList.share.compareListRegister._content;
      try {
        for(let i = 0; i < compareListvalues.length;) {
          window.yList.share.compareListRegister.delete(0)
        }
      }catch(e){}

      if(window.yList.share.compareListRegister._content.length == 0)
      {
        compare_values = function () {
          var tmp = null;
          $.ajax({
              'async': false,
              'type': "GET",
              'global': false,
              'dataType': 'json',
              'url': project_settings.shopping_api_url+"?type=3&user_id="+user_id+'&website_id='+website_settings['projectID'],
              'success': function (data) {
                  tmp = data;
              }
          });
          return tmp;
        }();
        // console.log('compare_values.length',compare_values.length)
        // console.log('compare_values',compare_values)
        if(compare_values !== null)
        {
          var recentAddedInComparelist = [];

          for(let item in compare_values)
          {
            recentAddedInComparelist.push(compare_values[item]);
          }
          window.yList.share.compareListRegister.push(recentAddedInComparelist);
        }
        // console.log('window.yList.share.compareListRegister',window.yList.share.compareListRegister)
      }
      if($("#myWishList").length > 0 || $("#myCompareList").length > 0)
      {
        hidePageAjaxLoading();
      }
    }, 300);

    if(user_id!=null) {
      let userDetail = {};
      let userinfo = getUserInfo();
      if(userinfo!=''){
        userDetail = userinfo;
      }
      user_details = Object.assign(user_details, userDetail);
    }
  }

  let type;
  //console.log("user_details",user_details);
  // login-logout start
  if(user_details != null){
    $(".logout-show").removeClass('hide');
    let userName = 'user'
    if(admin_role_flag == 1){
       userName = 'Admin'
    }

    if(user_details.fullname != undefined ) userName = user_details.fullname
    $('.username-text').text('welcome '+userName);
  }
  else {
     document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
     $(".login-show").removeClass('hide');
     $('.username-text').text('');
   }

 $('.login-text-check').on('click',function() {
  //  delete_cookie("auth_token",window.location.hostname)
  //  delete_cookie("user_id",window.location.hostname)
   document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
   document.cookie = 'user_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
   location.reload();
 });
  // login-logout end

  // Compare, whishlist and cart count in header
  if(window.yList.share.compareList._content != null && user_id == null){
    document.getElementById("comparedCount").innerHTML =  window.yList.share.compareList._content.length ;;//JSON.parse(localStorage.getItem("savedCompared")).length;
  }

  // if(window.yList.share.compareListRegister._content != null && user_id != null){
  //   document.getElementById("comparedCount").innerHTML =  window.yList.share.compareListRegister._content.length ;;//JSON.parse(localStorage.getItem("savedCompared")).length;
  // }

  if(window.yList.share.wishList._content != null && user_id == null){
    document.getElementById("wishlistCount").innerHTML = window.yList.share.wishList._content.length ;
  }

  // if(window.yList.share.wishListRegister._content != null && user_id != null){
  //   document.getElementById("wishlistCount").innerHTML = window.yList.share.wishListRegister._content.length ;
  // }

  if(localStorage.getItem("savedCart") != null && user_id != null){
    document.getElementById("cartCount").innerHTML = JSON.parse(localStorage.getItem("savedCart")).length ;
  }

  if($("#myWishList").length > 0)
  {
    showPageAjaxLoading();
    setTimeout(function()
    {
      showWishList();
      hidePageAjaxLoading();
    }, 300);
  }
  else{
    showWishList();
  }

  if($("#myCompareList").length > 0)
  {
    showPageAjaxLoading();
    setTimeout(function()
    {
      showCompareList();
      hidePageAjaxLoading();
    }, 300);
  }
  else{
    showCompareList();
  }

  let myarr = [];
  // Auto sugession for search in header
  $('input[name="search"]').keyup(function(){
      let val = $('input[name="search"]').val();
      let settings = {
        "async": true,
        "crossDomain": true,
        "url": project_settings.search_api_url,
        "method": "POST",
        "headers": {
          "authorization": project_settings.search_api_auth_token,
          "content-type": "application/json",
          "cache-control": "no-cache",
          "postman-token": "0fe82014-49ea-eca8-1432-1f3b9fffc910"
        },
        "data": " {\n  \"query\": {\n    \"bool\": {\n      \"must\": {\n        \"match_all\": {\n         \n        }\n      },\n      \"filter\": {\n        						\"match\": {\n          \"search_keyword\": \" "+ val +" \"\n        }\n      }\n    }\n  }\n}\u0001"
      }
      $.ajax(settings).done(function (data) {
          $.each(data.hits.hits,  function( index, value ) {
            value._source.search_keyword.forEach(function(item,index) {
              myarr.push(item);
            });
          });
      });
  });

  $('input[name="search"]').autocomplete({
    source: myarr
  });

  $('.header-search-col').find('.btn-search').click(function(){
    if($.trim($('input[name="search"]').val()) != '') {
      window.location.href = website_settings.BaseURL+'search.html?SearchSensor="' + $('input[name="search"]').val()+'"'
    }
    else {
      window.location.href = website_settings.BaseURL+'search.html';
    }
    return false;
  })

  $('input[name="search"]').keyup(function(event){
        if(event.which==13){
            $(this).closest('.header-search-col').find('.btn-search').trigger( "click" );
            return false;
        }
    });
}

//add in to Compare, Wishlist and Cart
$(document).on('click', '.js-add-to-wishlist', function(e) {
  e.preventDefault();
  let product_id = $(this).data('id');
  addInTransaction(1,product_id); // 1 for WishList
});

$(document).on('click', '.js-add-to-cart', function(e) {
  e.preventDefault();
  if (user_id == null ) {
    location.href = website_settings.BaseURL+'login.html';
  }
  else {
    let product_id = $(this).data('id');
    location.href = website_settings.BaseURL+'productdetail.html?locale='+project_settings.default_culture+'&pid='+product_id; // 2 for Cart
  }
});

$(document).on('click', '.js-add-to-compare', function(e) {
  e.preventDefault();
  let product_id = $(this).data('id');
  addInTransaction(3,product_id); // 3 for Compare
});

$(document).on('click', '.js-add-to-transaction', function(e) {
    e.preventDefault();
    let product_id = $(this).data('id');

    if (e.target.classList.contains("ecomm-cart")) {
      type=1;
    }else if(e.target.classList.contains("ecomm-wishlist")) {
      type=2;
    }else if(e.target.classList.contains("ecomm-compare")) {
      type=3;
    }
    addInTransaction(type,product_id)
})

function addInTransaction(type,product_id){
  if (user_id == null ) {
    dataSaveToLocal(type,product_id)
  } else {
    dataSaveToDatabase(type,product_id,user_id)
  }
}

function dataSaveToLocal(type,product_id,show_msg=true){
  let decideLocalStorageKey = decide_localStorage_key(type)
  if (localStorage.getItem(decideLocalStorageKey) != null) {
    let values = JSON.parse(localStorage.getItem(decideLocalStorageKey));
    let wishlistDataSaveToLocalhost = checkIfExist(type, product_id, values, decideLocalStorageKey,show_msg); // pass all the params and the last one is the array
    // localStorage.setItem(decideLocalStorageKey , JSON.stringify(wishlistDataSaveToLocalhost))
    if(show_msg != false) {
      // updateShoppingLocalCount(values.length , type);
    }

  }else{
    var data = [];
    data.push({ 'type': type,'product_id': product_id });
    localStorage.setItem(decideLocalStorageKey , JSON.stringify(data))

    var recentAddedInWishlist = [];
    recentAddedInWishlist.push({ 'type': type,'product_id': product_id,'id': product_id,'website_id':website_settings['projectID']});
    // localStorage.setItem(decideLocalStorageKey+'Recent' , JSON.stringify(recentAddedInWishlist))

    if(decideLocalStorageKey == "savedCompared")
    {
      window.yList.share.compareList.push(recentAddedInWishlist)
    }
    else{
      window.yList.share.wishList.push(recentAddedInWishlist)
    }
    var addedTo = "";
    if(type == 1)
    {
      addedTo = " to wishlist";
    }
    else if(type == 3)
    {
      addedTo = " to compare list";
    }

    if(show_msg != false) {
      // updateShoppingLocalCount(JSON.parse(localStorage.getItem(decideLocalStorageKey)).length , type);
      showSuccessMessage("item successfully added"+addedTo);
    }
  }
}

function deleteFromLocal(type,product_id){
  if(type == 1) {
    let values = window.yList.share.wishList._content;
    // console.log('values',values)
    for (i in values){
      if(window.yList.share.wishList._content[i].val.product_id == product_id)
      {
        // console.log("----------values[i]-----------",values[i])
        // localStorage.setItem("savedWishlistDelete" , JSON.stringify(values[i]))
        // values.splice(i, 1);
        window.yList.share.wishList.delete(parseInt(i))
        $("#myWishList .listing .product-"+product_id).remove();
      }
    }
    // localStorage.setItem("savedWishlist" , JSON.stringify(values))

    if(window.yList.share.wishList._content != null && window.yList.share.wishList._content.length == 0)
    {
      // localStorage.removeItem('savedWishlist');
      // window.yList.share.wishList.delete(0)
      $('#myWishList .listing').html('No records found.');
      // location.reload();
    }
    else
    {
      document.getElementById("wishlistCount").innerHTML =  window.yList.share.wishList._content.length;
      // window.yList.share.wishList.delete(0)
    }
  }
  if(type == 3) {
    let values = window.yList.share.compareList._content; // JSON.parse(localStorage.getItem("savedCompared"));

    for (i in values){
      if(window.yList.share.compareList._content[i].val.product_id == product_id)
      {
        // console.log("----------values[i]-----------",values[i])
        // localStorage.setItem("savedWishlistDelete" , JSON.stringify(values[i]))
        // values.splice(i, 1);
        window.yList.share.compareList.delete(parseInt(i))
        $("#myCompareList #listing .product-"+product_id).remove();
      }
    }

    // localStorage.setItem("savedCompared" , JSON.stringify(values))

    if(window.yList.share.compareList._content != null && window.yList.share.compareList._content.length == 0)
    {
      // localStorage.removeItem('savedCompared');
      // window.yList.share.compareList.delete(0)
      $("#myCompareList #listing div:first").addClass("hide");
      if($('#myCompareList #listing .js-no-records').length == 0)
      {
          $('#myCompareList #listing').append('<span class="js-no-records">No records found.</span>')
      }
      else{
          $('#myCompareList #listing .js-no-records').html('No records found.')
      }
      // location.reload();
    }
    else
    {
      if(window.yList.share.compareList._content.length>4)
      {
        $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*window.yList.share.compareList._content.length+'px')
      }
      else{
        $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*5+'px')
      }
      // window.yList.share.compareList.delete(0)
      document.getElementById("comparedCount").innerHTML =  window.yList.share.compareList._content.length;
    }
  }
  hidePageAjaxLoading();
}

function dataSaveToDatabase(type,product_id,user_id,show_msg=true){
  var data = { 'type': type,'product_id': product_id,'user_id' : user_id,'website_id':website_settings['projectID'] };
  $.ajax({
    type : 'POST',
    url : project_settings.shopping_api_url,
    data : data,
    dataType : 'json',
    success : function(response_data) {
      if(response_data.status == 200) {
        if(show_msg != false) {
          updateShoppingDatabaseCount(type,'+');
        }

        var recentAddedInWishlist = [];
        data['id'] = response_data.data.id;
        recentAddedInWishlist.push(data);

        if(type == 1)
        {
          // localStorage.setItem('savedWishlistRecent' , JSON.stringify(recentAddedInWishlist))
          window.yList.share.wishListRegister.push(recentAddedInWishlist)
        }
        else if(type == 3)
        {
          // localStorage.setItem('savedComparedRecent' , JSON.stringify(recentAddedInWishlist))
          window.yList.share.compareListRegister.push(recentAddedInWishlist)
        }
      }
      if(show_msg != false) {
        if(response_data.status == 200) {
          var addedTo = "";
          if(type == 1)
          {
            addedTo = " to wishlist";
          }
          else if(type == 3)
          {
            addedTo = " to compare list";
          }
          showSuccessMessage(response_data.message+addedTo)
        }
        else{
          var alreadyAddedIn = "";
          if(type == 1)
          {
            alreadyAddedIn = " in wishlist";
          }
          else if(type == 3)
          {
            alreadyAddedIn = " in compare list";
          }
          showErrorMessage(response_data.message+alreadyAddedIn)
        }
      }
    }
  })
}

function deleteFromDatabase(type,id,user_id){
  //var data = { 'type': type,'product_id': product_id,'user_id' : user_id };
  $.ajax({
    type : 'DELETE',
    //url : project_settings.shopping_api_url+"?type="+type+"&product_id="+product_id+"&user_id="+user_id,
    url : project_settings.shopping_api_url+"/"+id,
    //data : data,
    dataType : 'json',
    success : function(response_data) {
      // if(response_data.status == 200) {
      if(response_data != '') {
        // updateShoppingDatabaseCount(type,'-');

        // var recentAddedInWishlist = data;
        // recentAddedInWishlist.push(data);
        // localStorage.removeItem('savedWishlistRecent');
        if(type == 1)
        {
          // localStorage.setItem('savedWishlistDelete' , JSON.stringify(recentAddedInWishlist))
          let values = window.yList.share.wishListRegister._content;
          // console.log('values',values)
          for (i in values){
            if(window.yList.share.wishListRegister._content[i].val.id == id)
            {
              // console.log("----------values[i]-----------",values[i])
              // localStorage.setItem("savedWishlistDelete" , JSON.stringify(values[i]))
              // values.splice(i, 1);
              window.yList.share.wishListRegister.delete(parseInt(i))
              $("#myWishList .listing .product-"+id).remove();
            }
          }
        }
        else if(type == 3)
        {
          // localStorage.setItem('savedComparedDelete' , JSON.stringify(recentAddedInWishlist))
          let values = window.yList.share.compareListRegister._content;
          // console.log('values',values)
          for (i in values){
            if(window.yList.share.compareListRegister._content[i].val.id == id)
            {
              // console.log("----------values[i]-----------",values[i])
              // localStorage.setItem("savedWishlistDelete" , JSON.stringify(values[i]))
              // values.splice(i, 1);
              window.yList.share.compareListRegister.delete(parseInt(i))
              $("#myCompareList #listing .product-"+id).remove();
            }
          }
        }
        hidePageAjaxLoading();
      }
      // $(".product-"+id).remove();
    }
  })
}

$(document).on('click', '.js-remove-wishlist', function(e) {
  e.preventDefault();
  let product_id = $(this).data('id');

  bootbox.confirm("Are you sure want to delete?", function(result)
    {
      if(result)
        {
            showPageAjaxLoading();
            setTimeout(function()
            {
              if (user_id == null ) {
                deleteFromLocal(1,product_id);
              }
              else {
                deleteFromDatabase(1,product_id,user_id)
              }
              showSuccessMessage("Product(s) have been successfully removed from wishlist.");

            }, 300);
        }
    });
});

$(document).on('click', '.js-remove-compare', function(e) {
  e.preventDefault();
  let product_id = $(this).data('id');
  bootbox.confirm("Are you sure want to delete?", function(result)
  {
    if(result)
      {
        showPageAjaxLoading();

        setTimeout(function()
        {
          if (user_id == null ) {
            deleteFromLocal(3,product_id);
          }
          else {
            deleteFromDatabase(3,product_id,user_id)
          }
          showSuccessMessage("Product(s) have been successfully removed from compare list.");

        }, 300);
      }
  });
});

function updateShoppingLocalCount(count , type) {
  if (type == 1) {
    document.getElementById("wishlistCount").innerHTML = count;
  }
  if(type == 2){
    document.getElementById("cartCount").innerHTML = count;
  }
  if(type == 3){
    document.getElementById("comparedCount").innerHTML = count;
  }
}

function updateShoppingDatabaseCount(type, operation) {
  if (type == 1) {
    let wishCount = eval(parseInt(document.getElementById("wishlistCount").innerHTML)+operation+1);
    document.getElementById("wishlistCount").innerHTML = Math.max(0, wishCount);
  }
  if(type == 2){
    let cartCount = eval(parseInt(document.getElementById("cartCount").innerHTML)+operation+1);
    document.getElementById("cartCount").innerHTML = Math.max(0, cartCount);
  }
  if(type == 3){
    let compareCount = eval(parseInt(document.getElementById("comparedCount").innerHTML)+operation+1);
    document.getElementById("comparedCount").innerHTML = Math.max(0, compareCount);
  }
}

function decide_localStorage_key(type){
  if (type == 1) {
    return "savedWishlist"
  }else if(type == 2){
    return  "savedCart"
  }else if(type ==3){
    return "savedCompared"
  }
}


function checkIfExist(type ,product_id ,array, decideLocalStorageKey, show_msg=true) {  // The last one is array
  // var count = array.length + 1;

  if(user_details != null){
    if(type == 1)
      {
        var found = window.yList.share.wishListRegister._content.some(function (el) {
          return el.val.product_id == product_id;
        });
      }
      else if(type == 3)
      {
        var found = window.yList.share.compareListRegister._content.some(function (el) {
          return el.val.product_id == product_id;
        });
      }
  }
  else{
    if(type == 1)
    {
      var found = window.yList.share.wishList._content.some(function (el) {
        return el.val.product_id == product_id;
      });
    }
    else if(type == 3)
    {
      var found = window.yList.share.compareList._content.some(function (el) {
        return el.val.product_id == product_id;
      });
    }
  }

  // var found = array.some(function (el) {
  //   return el.product_id == product_id;
  // });
  var addedTo = "";
  if(type == 1)
  {
    addedTo = " to wishlist";
  }
  else if(type == 3)
  {
    addedTo = " to compare list";
  }

  var alreadyAddedIn = "";
  if(type == 1)
  {
    alreadyAddedIn = " in wishlist";
  }
  else if(type == 3)
  {
    alreadyAddedIn = " in compare list";
  }

  if (!found)
  {
    array.push({ type: type , 'product_id': product_id  });

    var recentAddedInWishlist = [];
    recentAddedInWishlist.push({ 'type': type,'product_id': product_id, 'id': product_id});
    // localStorage.removeItem(decideLocalStorageKey+'Recent');
    // localStorage.setItem(decideLocalStorageKey+'Recent' , JSON.stringify(recentAddedInWishlist))

    if(type == 1)
    {
      window.yList.share.wishList.push(recentAddedInWishlist)
    }
    else{
      window.yList.share.compareList.push(recentAddedInWishlist)
    }

    if(show_msg != false) {
      showSuccessMessage("Item added successfully"+addedTo);
    }
  }else{
    if(show_msg != false) {
      showErrorMessage("Item already exist"+ alreadyAddedIn);
    }
  }
  return array
}


function getProductDetailBysku(sku){
      var settings = {
        "crossDomain": true,
        "url": "https://ae3f5d08fa1ec79613b0b307dadb0834.us-east-1.aws.found.io:9243/pdm1/_search",
        "method": "POST",
        "headers": {
          "authorization": "Basic YWFrcm9uOjEyMzQ1Ng==",
          "content-type": "application/json",
          "cache-control": "no-cache",
          "postman-token": "be0d1ef5-f2d5-dec4-2000-2fe2c0625233"
        },
        "data": " {\n  \"query\": {\n    \"bool\": {\n      \"filter\": {\n        \"match_phrase\": {\n          \"sku\": \"80-68730\"\n        }\n      }\n    }\n  					}\n}\u0001"
      }

      $.ajax(settings).done(function (response) {
        // console.log(response);
      });
}

(function ($) {
    $.fn.serializeFormJSON = function () {

        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);

function showErrorMessage(error_message) {
  error_message = error_message.charAt(0).toUpperCase() + error_message.slice(1).toLowerCase();
	if ($('.alert-success').length){
		$( ".alert-success").remove();
	}
	if ($('.alert-danger').length) {
		$('.alert-danger').animate({marginTop: "-=50"}, 100, null, function() {
			$('.alert-danger span').html(error_message);
			$(this).animate({marginTop: "+=50"}, 100, null)
		});
	} else {
    $('body').prepend('<div class="container"><div class="alert alert-danger" style="margin-top:-50px;"><a data-dismiss="alert" class="close" href="javascript:void(0)">&times;</a><span>'+ error_message+'</span></div><div class="clr"></div></div>');
		$('.alert-danger').animate({marginTop: "+=50"}, 100, null);
	}
	setTimeout("hideAlertBar();", 7000);
}

function showSuccessMessage(success_message,url=null) {
  success_message = success_message.charAt(0).toUpperCase() + success_message.slice(1).toLowerCase();
	if($('.alert-danger').length) {
		$( ".alert-danger").remove();
	}
	if($('.alert-success').length) {
		$('.alert-success').animate({marginTop: "-=50"}, 100, null, function() {
			$('.alert-success span').html(success_message);
			$(this).animate({marginTop: "+=50"}, 100, null);
		});
	}
	else {
		if( $('#modal-table').is(":visible") && $('#modal-table .modal-content').length>0 ){
			$('body').prepend('<div class="container"><div class="alert alert-success" style="margin-top:-50px;"><a data-dismiss="alert" class="close" type="button">&times;</a> <span>'+ success_message+'</span></div><div class="clr"></div></div>');
		} else {
			$('body').prepend('<div class="container"><div class="alert alert-success" style="margin-top:-50px;"><a data-dismiss="alert" class="close" type="button">&times;</a> <span>'+ success_message+'</span></div><div class="clr"></div></div>');
		}
		$('.alert-success').animate({marginTop: "+=50"}, 100, null);
	}
  if(url == null){
      setTimeout("hideAlertBar();", 7000);
  }else{
      setTimeout("location.href = '"+url+"';",1500);
  }
}

function hideAlertBar(){
	$(".alert-success, .alert-warning,  .alert-danger, .alert-info").animate({marginTop: "-=50"}, 600, function() {$(this).parent().remove();});
}
function showPageAjaxLoading(){
	if (!$('.widget-box-overlay').length) {
		$('body').prepend('<div class="widget-box-overlay" style="display: block;"><img alt="" src="http://res.cloudinary.com/flowz/raw/upload/v1515763939/websites//images/preloader.gif"></div>');
	}
}
function hidePageAjaxLoading(){
	$('.widget-box-overlay').remove();
}

function showWishList(recetAdded=false)
{
  var listHtml = $('#myWishList .js-list').html()
  var wishlistValuesCount = 0;
  if(user_details != null){
    if(recetAdded) {
      $("#myWishList .listing .js-no-records").remove();
      var wishlist_values = JSON.parse(localStorage.getItem("savedWishlistRecent"));
    }
    else {
      $('#myWishList .listing').html('');
      var wishlist_values = window.yList.share.wishListRegister._content;
    }
  }
  else {
    if(recetAdded) {
      $("#myWishList .listing .js-no-records").remove();
      var wishlist_values = window.yList.share.wishList._content;
      // var wishlist_values = JSON.parse(localStorage.getItem("savedWishlistRecent"));
    }
    else {
      $('#myWishList .listing').html('');
      var wishlist_values = window.yList.share.wishList._content;
      // wishlist_values = JSON.parse(localStorage.getItem("savedWishlist"));
    }
  }

  var productHtml='';
  var productData;
  if($("#myWishList").length > 0)
  {
    $('#myWishList .listing').addClass('hide');
    if (typeof(listHtml) !== "undefined" && wishlist_values != "" ) {
        for (item in wishlist_values)
        {
          // console.log('user_id',wishlist_values[item].val.user_id)
          var showItem = false;
          if(user_details != null && user_id == wishlist_values[item].val.user_id)
          {
            showItem = true;
          }
          else if(user_details == null)
          {
            showItem = true;
          }

          if(showItem)
          {
            if(user_details != null){
              var prodId = window.yList.share.wishListRegister._content[item].val.product_id;
            }
            else{
              if(recetAdded) {
                var prodId = window.yList.share.wishList._content[item].val.product_id;
              }
              else{
                var prodId = window.yList.share.wishList._content[item].val.product_id;
                // var prodId = wishlist_values[item]['product_id'];
              }
            }

            if(wishlist_values[item] != null)
            {
              $.ajax({
                type: 'GET',
                // url: project_settings.product_api_url+"?_id="+prodId,
                url: project_settings.product_api_url+"?_id="+prodId+"&source=default_image,product_id,sku,product_name,currency,price_1,description",
                async: false,
                beforeSend: function (xhr) {
                  xhr.setRequestHeader ("vid", website_settings.Projectvid.vid);
                },
                dataType: 'json',
                success: async function (data) {
                  rawData = data.hits.hits;
                  productData = rawData;
                  // console.log("productData.length",productData.length)
                  if(productData.length > 0)
                  {
                    wishlistValuesCount = wishlistValuesCount+1;

                    var listHtml1 = listHtml.replace('#data.image#',project_settings.product_api_image_url+productData[0]._source.default_image);
                    listHtml1 = listHtml1.replace(/#data.id#/g,wishlist_values[item].val.id);
                    listHtml1 = listHtml1.replace('#data.title#',productData[0]._source.product_name);
                    listHtml1 = listHtml1.replace('#data.sku#',productData[0]._source.sku);
                    listHtml1 = listHtml1.replace('#data.price#',parseFloat(productData[0]._source.price_1).toFixed(project_settings.price_decimal));
                    listHtml1 = listHtml1.replace('#data.currency#',productData[0]._source.currency);

                    let detailLink = website_settings.BaseURL+'productdetail.html?locale='+project_settings.default_culture+'&pid='+prodId;
                    listHtml1 = listHtml1.replace(/#data.product_link#/g,detailLink);


                    listHtml1 = listHtml1.replace('#data.description#',productData[0]._source.description);
                  }
                  else{
                    $(".product-"+prodId).remove();

                    if(user_details != null)
                    {
                      if(typeof wishlist_values[item] != "undefined")
                      {
                        await deleteItemById(project_settings.shopping_api_url+'/'+wishlist_values[item].val.id);
                      }
                    }
                    else{
                      // window.yList.share.wishList.delete(parseInt(item))
                    }
                    // if(user_details != null){
                    //   window.yList.share.wishListRegister.delete(parseInt(item))
                    // }
                    // else{
                    //   window.yList.share.wishList.delete(parseInt(item))
                    // }
                  }
                  if(recetAdded)
                  {
                    $('#myWishList .js-add-products').append(listHtml1);
                  }
                  else if($('#myWishList .listing .product-'+prodId).length == 0)
                  {
                    $('#myWishList .listing').append(listHtml1);
                  }
                  if(user_id == null){
                    $("#myWishList .listing").find(".item-price").remove()
                  }
                  // productHtml += listHtml1;
                }
              });
            }
          }
        }
    } else {
      $('#myWishList .listing').html('<span class="js-no-records">No records found.</span>');
    }

    $('#myWishList .listing').removeClass('hide');

    if(wishlistValuesCount)
    {
      document.getElementById("wishlistCount").innerHTML = wishlistValuesCount;
    }
    else{
      document.getElementById("wishlistCount").innerHTML = 0;
	  $('#myWishList .listing').html('<span class="js-no-records">No records found.</span>');
    }
  }
  else{
    if (wishlist_values != "" ) {
      for (item in wishlist_values)
      {
        // console.log('user_id',wishlist_values[item].val.user_id)
        var showItem = false;
        if(user_details != null && user_id == wishlist_values[item].val.user_id)
        {
          showItem = true;
        }
        else if(user_details == null)
        {
          showItem = true;
        }

        if(showItem)
        {
          wishlistValuesCount = wishlistValuesCount+1;
        }
      }
    }
    if(wishlistValuesCount)
    {
      document.getElementById("wishlistCount").innerHTML = wishlistValuesCount;
    }
    else{
      document.getElementById("wishlistCount").innerHTML = 0;
      $('#myWishList .listing').html('<span class="js-no-records">No records found.</span>');
    }
  }
}

function showCompareList(recetAdded=false)
{
  var compareHtml = $('#myCompareList #listing')
  var compareValuesCount = 0;

  if(user_details != null){
    var compare_values = window.yList.share.compareListRegister._content;

    // if(compare_values.length != null)
    // {
    //   document.getElementById("comparedCount").innerHTML = compare_values.length;
    // }

    // console.log("window.yList.share.compareListRegister",window.yList.share.compareListRegister._content)
    // console.log("compare_values",compare_values)

   }
   else {
    if(recetAdded) {
      var compare_values = window.yList.share.compareList._content;
      // var compare_values = JSON.parse(localStorage.getItem("savedComparedRecent"));
    }
    else {
      var compare_values = window.yList.share.compareList._content;
    }
   }
    // console.log("compare_values",compare_values)


  if($("#myCompareList").length > 0)
  {
    // console.log('compare_values',compare_values)
    $('#myCompareList #listing').addClass('hide');
    var productHtml=itemSkuHtml=activeSummaryHtml=itemFeaturesHtml='';
    var productData;
    var itemTitleHtml='';
    let html = $('.js-list #item_title_price').html();
    let item_sku = $('.js-list #item_sku').html();
    let activeSummary = $('.js-list #item_summary').html();
    let item_features = $('.js-list #item_features').html();

    if (typeof(compareHtml.html()) !== "undefined" && compare_values != null && compare_values.length > 0) {
          for (item in compare_values)
          {
            // console.log('user_id',compare_values[item].val.user_id)
            var showItem = false;
            if(user_details != null && user_id == compare_values[item].val.user_id)
            {
              showItem = true;
            }
            else if(user_details == null)
            {
              showItem = true;
            }

            if(showItem)
            {
              if(user_details != null){
                var prodId = window.yList.share.compareListRegister._content[item].val.product_id;
              }
              else{
                var prodId = window.yList.share.compareList._content[item].val.product_id;
              }

              $.ajax({
                type: 'GET',
                // url: project_settings.product_api_url+"?_id="+prodId,
                url: project_settings.product_api_url+"?_id="+prodId+"&source=default_image,product_id,sku,product_name,currency,price_1,description,features",
                async: false,
                beforeSend: function (xhr) {
                  xhr.setRequestHeader ("vid", website_settings.Projectvid.vid);
                },
                dataType: 'json',
                success: async function (data)
                {
                  rawData = data.hits.hits;
                  productData = rawData;
                  if(productData.length >0){
                  compareValuesCount = compareValuesCount+1;

                  var itemTitleHtml = html;
                  var itemTitleHtml = itemTitleHtml.replace(/#data.id#/g,compare_values[item].val.id);
                  var itemTitleHtml = itemTitleHtml.replace('#data.image#',project_settings.product_api_image_url+productData[0]._source.default_image);

                  let detailLink = website_settings.BaseURL+'productdetail.html?locale='+project_settings.default_culture+'&pid='+prodId;
                  var itemTitleHtml = itemTitleHtml.replace('#data.product_link#',detailLink);

                  var itemTitleHtml = itemTitleHtml.replace('#data.title#',productData[0]._source.product_name);
                  if(user_id == null){
                    var itemTitleHtml = itemTitleHtml.replace('#data.price#',"");
                  }else{
                    var itemTitleHtml = itemTitleHtml.replace('#data.price#',productData[0]._source.currency+" "+parseFloat(productData[0]._source.price_1).toFixed(project_settings.price_decimal));
                  }

                  productHtml = itemTitleHtml;

                  var itemTitleHtml = item_sku;
                  var itemTitleHtml = itemTitleHtml.replace(/#data.id#/g,compare_values[item].val.id);
                  var itemTitleHtml = itemTitleHtml.replace('#data.sku#',productData[0]._source.sku);
                  itemSkuHtml = itemTitleHtml;

                  var itemTitleHtml = activeSummary;
                  var itemTitleHtml = itemTitleHtml.replace(/#data.id#/g,compare_values[item].val.id);
                  var itemTitleHtml = itemTitleHtml.replace('#data.summary#',productData[0]._source.description);
                  activeSummaryHtml = itemTitleHtml;

                  var itemTitleHtml = item_features;
                  var fetureList = '';
                  for (let [i, features] of productData[0]._source.features.entries() ) {
                    fetureList += features.key+": "+features.value+"<br>";
                  }
                  var itemTitleHtml = itemTitleHtml.replace(/#data.id#/g,compare_values[item].val.id);
                  var itemTitleHtml = itemTitleHtml.replace('#data.features#',fetureList);
                  itemFeaturesHtml = itemTitleHtml;

                  if(recetAdded)
                  {
                    $("#myCompareList #listing .js-no-records").remove();
                    $("#myCompareList #listing div:first").removeClass("hide");

                    if(JSON.parse(localStorage.getItem("savedCompared")).length == 1)
                    {
                      // console.log('compareHtml.find("#item_title_price1").html', compareHtml.find("#item_title_price1").html());
                      compareHtml.find("#item_title_price1").html("<td></td>"+productHtml)
                      compareHtml.find("#item_sku1").html("<td><strong>ITEM CODE</strong></td>"+itemSkuHtml)
                      compareHtml.find("#item_summary1").html("<td><strong>SUMMARY</strong></td>"+activeSummaryHtml)
                      compareHtml.find("#item_features1").html("<td><strong>FEATURES</strong></td>"+itemFeaturesHtml)
                      $('#myCompareList #listing').html(compareHtml.html());
                    }
                    else
                    {
                      $("tr#item_title_price1").append(productHtml)
                      $("tr#item_sku1").append(itemSkuHtml)
                      $("tr#item_summary1").append(activeSummaryHtml)
                      $("tr#item_features1").append(itemFeaturesHtml)
                    }
                  }
                  else if(item == 0 || compareValuesCount == 1)
                  {
                    $("#myCompareList #listing .js-no-records").remove();
                    $("#myCompareList #listing div:first").removeClass("hide");

                    compareHtml.find("#item_title_price1").html("<td></td>"+productHtml)
                    compareHtml.find("#item_sku1").html("<td><strong>ITEM CODE</strong></td>"+itemSkuHtml)
                    compareHtml.find("#item_summary1").html("<td><strong>SUMMARY</strong></td>"+activeSummaryHtml)
                    compareHtml.find("#item_features1").html("<td><strong>FEATURES</strong></td>"+itemFeaturesHtml)
                    $('#myCompareList #listing').html(compareHtml.html());
                  }
                  else{
                    compareHtml.find("#item_title_price1").append(productHtml)
                    compareHtml.find("#item_sku1").append(itemSkuHtml)
                    compareHtml.find("#item_summary1").append(activeSummaryHtml)
                    compareHtml.find("#item_features1").append(itemFeaturesHtml)
                    $('#myCompareList #listing').html(compareHtml.html());
                  }
                }
                  else{
                    $(".product-"+prodId).remove();
                    if(user_details != null)
                    {
                      console.log(item)

                      if(typeof compare_values[item] != "undefined")
                      {
                        await deleteItemById(project_settings.shopping_api_url+'/'+compare_values[item].val.id);
                      }
                      console.log('item deleted')
                    }
                    else{
                      // try {
                      //   console.log('1')
                      //   for(let i = 0; i < compare_values.length;) {
                      //     // console.log(compare_values.length)
                      //     // window.yList.share.compareList.delete(0)
                      //   }
                      //   console.log('2')
                      // }catch(e){}
                      // window.yList.share.compareList.delete(0)
                      // $(".product-"+prodId).remove();
                    }
                    // if(user_details != null){
                    //   window.yList.share.compareListRegister.delete(parseInt(item))
                    // }
                    // else{
                    //   window.yList.share.compareList.delete(parseInt(item))
                    // }
                    // $(".product-"+prodId).remove();
                  }
                }
              });
            }
          }
    } else {
      // $("#myCompareList #listing div:first").addClass("hide");
      // compareHtml.append('<span class="js-no-records">No records found.</span>')
    }

    $('#myCompareList #listing').removeClass('hide');

    if(compareValuesCount>4)
    {
      $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*compareValuesCount+'px')
    }
    else{
      $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*5+'px')
    }

    if(compareValuesCount)
    {
      document.getElementById("comparedCount").innerHTML = compareValuesCount;
    }
    else{
      document.getElementById("comparedCount").innerHTML = 0;
    }
  }
  else
  {
    if (compare_values != null && compare_values.length > 0 ) {
      for (item in compare_values)
      {
        var showItem = false;
        if(user_details != null && user_id == compare_values[item].val.user_id)
        {
          showItem = true;
        }
        else if(user_details == null)
        {
          showItem = true;
        }
        if(showItem)
        {
          compareValuesCount = compareValuesCount+1;
        }
      }
    }

    if(compareValuesCount>4)
    {
      $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*compareValuesCount+'px')
    }
    else{
      $('#myCompareList #listing .ob-product-compare .compare-block').css('width',209*5+'px')
    }

    if(compareValuesCount)
    {
      document.getElementById("comparedCount").innerHTML = compareValuesCount;
    }
    else{
      document.getElementById("comparedCount").innerHTML = 0;
    }
  }

  if(compareValuesCount == 0)
  {
    $("#myCompareList #listing div:first").addClass("hide");
    compareHtml.append('<span class="js-no-records">No records found.</span>')
  }
}

function submitNewsLetterForm()
{
  let data = {"email":$('input[name="subscribe_email"]').val()}
  $.ajax({
      type : 'POST',
      url : project_settings.email_subscribe_api_url,
      dataType : 'json',
      data: data,
      success : function(response_data) {
        if (response_data!= "") {
          if(response_data.status == 400) {
            showErrorMessage(response_data.message)
          }
          else{
            showSuccessMessage("The email has successfully been registered for the newsletter")
            $('input[name="subscribe_email"]').val('')
          }
        }
      }
    })
  return false;
}
function removeSpecialCharacters(str)
{
 str = str.replace(/[^a-zA-Z0-9\s,"-'`:&]/g, "");
 return str;
}


/* get city , state and country name by id */
async function getCountryStateCityById(id,type){
  var resp = "";
  await axios({
      method: 'GET',
      url: project_settings.city_country_state_api,
      params: {
          'id':id,
          'type':type
      }
    })
  .then(function (response) {
    if(response.data != ''){
        if(type == 1)
        resp = response.data.country_name;
        else if (type == 2)
        resp = response.data.state_name;
        else if (type == 3)
        resp = response.data.city_name;
        return resp;
    }
  })
  .catch(function (error) {
    // console.log("error",error);
  });
  // console.log("resp",resp);
  return resp;
}

var returnAddressBookDetailById = async function(addressBookId) {
	var returnData = null;
	await axios({
			method: 'GET',
			url: project_settings.address_book_api_url+'/'+addressBookId,
		})
	.then(response => {
		 returnData = response.data;
		 return returnData
	})
	.catch(function (error){

	})
	return returnData;
}

/* Get Data of state and city by country and state id */
async function getStateAndCityVal(countryVal,stateVal,dataFrom){
    let data = {}
    let returnData = ''
    data['country_id'] = countryVal;
    data['data_from'] = dataFrom
    if(dataFrom == "country_code"){
      data['type'] = 2;
    }else if (dataFrom == "state_code") {
      data['state_id'] = stateVal;
      data['type'] = 3;
    }
    await axios({
            method: 'GET',
            url: project_settings.city_country_state_api,
            params: data
          })
          .then(response => {
              returnData = response;
              return returnData;
          }).catch(function (error){

          })
    return returnData;
}

$(document).ready(function(){
  if( $('.js-phone')){
    var cntkey=0;
      $(document).on('keypress', '.js-phone', function (event)
      {
          cntkey=$(this).val().length;
          phone_delemeter ='-'
          if(event.which!=0)
          {
            if(event.which==8)	return true;
            else if(((event.which>=48&&event.which<=57)||event.which==45)&&((phone_delemeter == '' && cntkey<10)||(phone_delemeter != '' && cntkey<12)))
            {
                if(event.which!=45&&(cntkey==3||cntkey==7))
                {
                    $(this).val($(this).val()+phone_delemeter);
                    return true;
                }
                else if(event.which==45&&(cntkey==3||cntkey==7))	return true;
                else if(event.which==45)	return false;
                else	return true;
            }
            else
            {
              return false;
            }
          }
      });
  }

})

function nl2br (str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

localStorage.setItem("vOneLocalStorage", user_id);


Date.prototype.format = function(format) {
  var returnStr = '';
  var replace = Date.replaceChars;
  for (var i = 0; i < format.length; i++) {
        var curChar = format.charAt(i);
        if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
          returnStr += curChar;
        }
        else if (replace[curChar]) {
            returnStr += replace[curChar].call(this);
        } else if (curChar != "\\"){
            returnStr += curChar;
        }
  }
  return returnStr;
};

Date.replaceChars = {
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  // Day
  d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
  D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
  j: function() { return this.getDate(); },
  l: function() { return Date.replaceChars.longDays[this.getDay()]; },
  N: function() { return this.getDay() + 1; },
  S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
  w: function() { return this.getDay(); },
  z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
  // Week
  W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
  // Month
  F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
  m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
  M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
  n: function() { return this.getMonth() + 1; },
  t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
  // Year
  L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
  o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
  Y: function() { return this.getFullYear(); },
  y: function() { return ('' + this.getFullYear()).substr(2); },
  // Time
  a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
  A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
  B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
  g: function() { return this.getHours() % 12 || 12; },
  G: function() { return this.getHours(); },
  h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
  H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
  i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
  s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
  u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
'0' : '')) + m; },
  // Timezone
  e: function() { return "Not Yet Supported"; },
  I: function() {
      var DST = null;
          for (var i = 0; i < 12; ++i) {
                  var d = new Date(this.getFullYear(), i, 1);
                  var offset = d.getTimezoneOffset();

                  if (DST === null) DST = offset;
                  else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
          }
          return (this.getTimezoneOffset() == DST) | 0;
      },

  O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
  P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
  T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
  Z: function() { return -this.getTimezoneOffset() * 60; },
  // Full Date/Time
  c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
  r: function() { return this.toString(); },
  U: function() { return this.getTime() / 1000; }

};

function formatDate(date,format) {
  var formatdate = '-';
  if(date!='' && format!=''){
    let strdate = new Date(date);
    var formatdate = strdate.format(format);
  }
  return formatdate
};

function isEmpty(myObject) {
    for(let key in myObject) {
        if (myObject.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

async function deleteItemById(ajaxUrl)
{
  axios({
    method: 'DELETE',
    url : ajaxUrl,
  })
  .then(function (response) {
    console.log("Deleted")
  })
  .catch(function (error) {
    // console.log("error",error);
  });
}

async function getUserDetailById(userId) {
      let returnData = null;
    	await axios({
    			method: 'GET',
    			url: project_settings.user_detail_by_id+userId,
    			headers: {'Authorization' : userToken},
    		})
    	.then(response => {
          if(response.data.data.length > 0){
              returnData = response.data.data[0];
          }
          return returnData
    	})
      .catch(function (error) {
          //console.log("error",error.response);
      });
    	return returnData;
}

async function replaceColorSwatchWithHexaCodes(attribute_value,attribute_name){
    let returnColorVal = null
    if(attribute_value != undefined && attribute_value.length > 0) {
      var data = {'colorname':attribute_value};
      await axios({
              method: 'GET',
//              url : project_settings.color_table_api_url+'?vid=a40c858d-42f4-4d1e-9905-42a4a81ceca5&websiteid=2cfbe41a-f320-429e-add0-f0aaa4e61cfe&attribute_name='+attribute_name,
              url : project_settings.color_table_api_url+'?vid='+website_settings.Projectvid.vid+'&websiteid='+website_settings['projectID']+'&attribute_name='+attribute_name,
              params: data,
              dataType : 'json'
            })
            .then(response_data => {
                if(response_data.data.data.length > 0 ) {
                  let colorObj = {}
                  $.each(response_data.data.data,function(key,val){
                        colorObj[val.colorname] = val
                  })
                  // returnColorVal = response_data.data.data
                  returnColorVal = colorObj
                }
                return returnColorVal;
            })
            .catch(function (error) {
         			// 	console.log("error+++",error);
            });
    }
    return returnColorVal;
}

// if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 )
// {
//     alert('Opera');
// }
// else if(navigator.userAgent.indexOf("Chrome") != -1 )
// {
//     alert('Chrome');
// }
// else if(navigator.userAgent.indexOf("Safari") != -1)
// {
//     alert('Safari');
// }
// else if(navigator.userAgent.indexOf("Firefox") != -1 )
// {
//       alert('Firefox');
// }
// else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
// {
//     alert('IE');
// }
// else
// {
//     alert('unknown');
// }

if(navigator.userAgent.indexOf("Firefox") != -1 )
{
  // var db;
  var request = indexedDB.open('wishList-example'+website_settings['projectID']+website_settings.Projectvid.vid);
  request.onerror = function(event) {
    alert("Your browser doesn't support a stable version of IndexedDB. Please use different browser for uninterrupted service.");
  };
  // request.onsuccess = function(event) {
  //   // db = event.target.result;
  //   console.log( 'onsuccess' + event.target )
  // };
}
