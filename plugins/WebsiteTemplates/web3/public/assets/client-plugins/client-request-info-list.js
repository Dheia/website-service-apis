if (user_id == null ) {
  window.location.href = 'login.html';
}

$(document).ready(function(){
  $(".breadcrumb li:last-child").html('<strong>My Sent Request Info</strong>')
  if( admin_role_flag == 1 ){
      $(".main-title").html('<i class="fa fa-user"></i> Received Inquiries List')
      $(".breadcrumb li:last-child").html('<strong>Received Inquiries List</strong>')
  }
  $(".breadcrumb li:last-child").removeClass("hide")
  $(".tabbable ul li.active").trigger("click");

});

$(".tabbable ul li").on("click",function(){
    // request info listing
    showPageAjaxLoading();
    let activeTab = $(this).data("target");
    if(activeTab == '#request-info'){
        let requestInfoApiUrl = project_settings.request_info_api_url+'?userId='+user_id+"&website_id="+website_settings['projectID']
        if( admin_role_flag == 1 ){
            requestInfoApiUrl = project_settings.request_info_api_url+"?website_id="+website_settings['projectID']
        }
        axios({
          method: 'GET',
          url : requestInfoApiUrl,
        })
        .then(async response_data => {
            if($(activeTab).find(".my-inquiry-data:gt(0)").length > 0 ) $(activeTab).find(".my-inquiry-data:gt(0)").remove(); // To reset list of info
            let inquiryHtml = $(activeTab).find(".my-inquiry-data:first").closest('tbody').html();
            let replaceHtml = ''
            if(response_data.data.total > 0){
                  for(let [key,dataVal] of response_data.data.data.entries()){
                  // console.log("dataVal",dataVal);
                    let inquiryHtml1 = inquiryHtml.replace(/#data.index#/g,key+1)
                    inquiryHtml1 = inquiryHtml1.replace(/#data.itemName#/g, dataVal.productInfo[0].product_name);
                    inquiryHtml1 = inquiryHtml1.replace(/#data.date#/g, formatDate(dataVal.createAt,project_settings.format_date));
                    inquiryHtml1 = inquiryHtml1.replace(/#data.id#/g, dataVal.id);
                    if( admin_role_flag == 1 ){
                        let userInfo = await getUserDetailById(dataVal.userId)
                        if(userInfo != null){
                            inquiryHtml1 = inquiryHtml1.replace(/#data.userName#/g, userInfo.fullname);
                            inquiryHtml1 = inquiryHtml1.replace(/#data.userEmail#/g, userInfo.email);
                        }
                    }
                    replaceHtml += inquiryHtml1
                }
                $(activeTab).find(".my-inquiry-data:first").closest('tbody').append(replaceHtml)
                $(activeTab).find(".my-inquiry-data:first").nextAll().removeClass("hide")
                if( admin_role_flag == 1 ){
                  $(activeTab).find(".js_is_admin").removeClass("hide")
                }
                //console.log("replaceHtml",replaceHtml);
            }else{
                $(activeTab).find(".my-inquiry-data:first").closest('tbody').append('<tr><td colspan="5">There are no Record(s)</td></tr>')
            }
            hidePageAjaxLoading();
        })
        .catch(function (error) {
            console.log("error",error);
            hidePageAjaxLoading();
        });
    }else{

      let requestQuoteApiUrl = project_settings.request_quote_api_url+'?user_id='+user_id+"&website_id="+website_settings['projectID']
      if( admin_role_flag == 1 ){
          requestQuoteApiUrl = project_settings.request_quote_api_url+"?website_id="+website_settings['projectID']
      }

      axios({
        method: 'GET',
        url : requestQuoteApiUrl,
      })
      .then(async response_data => {
          if($(activeTab).find(".my-inquiry-data:gt(0)").length > 0 ) $(activeTab).find(".my-inquiry-data:gt(0)").remove();// To reset list of request quote
          let inquiryHtml = $(activeTab).find(".my-inquiry-data:first").closest('tbody').html();
          let replaceHtml = ''
          //console.log("response_data",response_data);
          if(response_data.data.total > 0){
                for(let [key,dataVal] of response_data.data.data.entries()){
                    let inquiryHtml1 = inquiryHtml.replace(/#data.index#/g,key+1)
                    inquiryHtml1 = inquiryHtml1.replace(/#data.itemName#/g, dataVal.product_description.product_name);
                    inquiryHtml1 = inquiryHtml1.replace(/#data.date#/g, formatDate(dataVal.created_at,project_settings.format_date));
                    inquiryHtml1 = inquiryHtml1.replace(/#data.id#/g, dataVal.id);
                    if( admin_role_flag == 1 ){
                        let userInfo = await getUserDetailById(dataVal.user_id)
                        if(userInfo != null){
                            inquiryHtml1 = inquiryHtml1.replace(/#data.userName#/g, userInfo.fullname);
                            inquiryHtml1 = inquiryHtml1.replace(/#data.userEmail#/g, userInfo.email);
                        }
                    }
                    replaceHtml += inquiryHtml1
                }
                $(activeTab).find(".my-inquiry-data:first").closest('tbody').append(replaceHtml)
                $(activeTab).find(".my-inquiry-data:first").nextAll().removeClass("hide")
                if( admin_role_flag == 1 ){
                  $(activeTab).find(".js_is_admin").removeClass("hide")
                }
          }else{
              $(activeTab).find(".my-inquiry-data:first").closest('tbody').append('<tr><td colspan="5">There are no Record(s)</td></tr>')
          }
          hidePageAjaxLoading();
      })
      .catch(function (error) {
          console.log("error",error);
          hidePageAjaxLoading();
      });

    }
})

$(document).on("click", '.js-open-modal-req-info-detail', function(e){
    let activeTab = $(this).closest(".tab-pane").attr("id");
    if(activeTab == "request-info"){
        detailRequestInfo($(this))
    }else{
        detailRequestQuote($(this))
    }

});

function detailRequestQuote(thisObj){
    showPageAjaxLoading();
    let infoId = thisObj.data("id")
    $('#modal-table').addClass('model-popup-black');
    $('#modal-table').addClass('request-info-popup-modal');
    $("#modal-table").find(".modal-title").html('<i class="fa fa-question-circle"></i>View Request Quote')
    $("#modal-table").find(".modal-body").addClass("modal-lg")

    axios({
        method: 'GET',
        url : project_settings.request_quote_api_url+"/"+infoId,
    })
    .then(async response_data => {
        let requestQuoteData = response_data.data
        // console.log("requestQuoteData",requestQuoteData);
        let productData = requestQuoteData.product_description;
        let requestQuoteHtml = $(".js_request_quote_modal").html()
        let detailLink = website_settings.BaseURL+'productdetail.html?locale='+project_settings.default_culture+'&pid='+requestQuoteData.product_id;

        let userInfo = await getUserDetailById(requestQuoteData.user_id)

        let userInfoHtml = ""
        userInfoHtml += "<h4>"+userInfo.fullname+"</h4>"

        // pending to fetch data from user after edit account
        //userInfoHtml += "<p></p>"

        let userContactInfoHtml = ""
        if(userInfo.phone != undefined && userInfo.phone != "") userContactInfoHtml += "<li><i class='fa fa-phone'></i>"+userInfo.phone+"</li>";
        if(userInfo.email != undefined && userInfo.email != "") userContactInfoHtml += "<li><i class='fa fa-envelope'></i>"+userInfo.email+"</li>";

        let pricingHtml = ''

        if(productData.pricing != undefined){
              $.each(productData.pricing, function(index,element){
                    if(element.price_type == "regular" && element.type == "decorative" && element.global_price_type == "global"){
                        $.each(element.price_range,function(index,element2){
                              if(element2.qty.lte != undefined){
                                    pricingHtml += '<div><div class="table-heading">'+ element2.qty.gte + '-' + element2.qty.lte + '</div><div class="table-content">' + '$' + parseFloat(element2.price).toFixed(project_settings.price_decimal) + '</div></div>';
                              }else
                              {
                                    pricingHtml += '<div><div class="table-heading">'+ element2.qty.gte + '+' + '</div><div class="table-content">' + '$' + parseFloat(element2.price).toFixed(project_settings.price_decimal) + '</div></div>';
                              }
                        })
                    }
              })
        }

        requestQuoteHtml = requestQuoteHtml.replace(/#data.createAt#/g,formatDate(requestQuoteData.created_at,project_settings.format_date))
        requestQuoteHtml = requestQuoteHtml.replace(/#data.id#/g,requestQuoteData.id)
        requestQuoteHtml = requestQuoteHtml.replace("#data.productImage#",project_settings.product_api_image_url+productData.default_image)
        requestQuoteHtml = requestQuoteHtml.replace("#data.productName#",productData.product_name)
        requestQuoteHtml = requestQuoteHtml.replace("#data.sku#",productData.sku)
        requestQuoteHtml = requestQuoteHtml.replace("#data.product_link#",detailLink)
        requestQuoteHtml = requestQuoteHtml.replace("#data.pricing#",pricingHtml)

        requestQuoteHtml = requestQuoteHtml.replace("#data.userInfo#",userInfoHtml)
        requestQuoteHtml = requestQuoteHtml.replace("#data.userContactInfo#",userContactInfoHtml)
        requestQuoteHtml = requestQuoteHtml.replace("#data.instruction#",requestQuoteData.special_instruction);
        $(".js_add_html").html(requestQuoteHtml)

        // Shipping Section

        let shippingHtmlReplace = '';

        let shippingHtml = $('#modal-table').find(".js-shipping-info").html()
        if(typeof requestQuoteData.shipping_method != "undefined")
        {
            for (let [key,shipping_info] of requestQuoteData.shipping_method.shipping_detail.entries())
            {
              //console.log("shipping_info",shipping_info);
              let shipping_address = shipping_info.shipping_address

              let replaceAddressHtml = '';
      	      replaceAddressHtml += shipping_address.name+"<br>";
      	      if(shipping_address.street2 != undefined && shipping_address.street2 !=''){
      	        replaceAddressHtml += shipping_address.street1;
      	        replaceAddressHtml += ","+shipping_address.street2+",<br>";
      	      }
      	      else{
      	        replaceAddressHtml += shipping_address.street1+",<br>";
      	      }
      	      replaceAddressHtml += shipping_address.city+",";
      	      replaceAddressHtml += shipping_address.state+"<br>";
      	      replaceAddressHtml += shipping_address.country;
      	      if(shipping_address.postalcode != undefined ){
      	        replaceAddressHtml += " - "+shipping_address.postalcode+"<br>";
      	      }
      	      replaceAddressHtml += "Email: "+shipping_address.email+"<br>";
      	      if(shipping_address.phone != undefined ){
      	        replaceAddressHtml += "T: "+shipping_address.phone;
      	      }
      	      if(shipping_address.mobile != undefined && shipping_address.mobile !=''){
      	        replaceAddressHtml += ",<br>M: "+shipping_address.mobile+"<br>";
      	      }

              shippingHtml1 = shippingHtml.replace("#data.address_book#",replaceAddressHtml)
              shippingHtml1 = shippingHtml1.replace(/#data.qty#/g,key+1)
              shippingHtml1 = shippingHtml1.replace(/#data.shippingCarrier#/g,shipping_info.shipping_detail.shipping_carrier)
              shippingHtml1 = shippingHtml1.replace("#data.shippingMethod#",shipping_info.shipping_detail.shipping_method)
              shippingHtml1 = shippingHtml1.replace("#data.onHandDate#",shipping_info.shipping_detail.on_hand_date)
              shippingHtml1 = shippingHtml1.replace(/#data.shippingCharge#/g,shipping_info.shipping_detail.shipping_charge);
              shippingHtmlReplace += shippingHtml1;

            }

        }
        //console.log("shippingHtmlReplace",shippingHtmlReplace);
        $('#modal-table').find(".js-shipping-info").html(shippingHtmlReplace)
        if(typeof requestQuoteData.shipping_method != "undefined")
        {
            for (let [key,shipping_info] of requestQuoteData.shipping_method.shipping_detail.entries())
            {
                //console.log("shipping_info",shipping_info.color_quantity);
                let key1 = key + 1
                let colorRawHtml = '';
                let colorSectionHtml = $('#modal-table').find(".js-color-info-"+key1).html()
                let colorArr = $.map( shipping_info.color_quantity, function( obj, i ) { return i; } );
                let colorsHexVal = await replaceColorSwatchWithHexaCodes(colorArr,"color");
                for (let color_quantity in shipping_info.color_quantity) {
                  colorSectionHtml1 = colorSectionHtml.replace(/#data.color#/g,color_quantity)
                  colorSectionHtml1 = colorSectionHtml1.replace("#data.totalQty#",shipping_info.color_quantity[color_quantity])
                  let element_color_style = "background-color:"+color_quantity+";"
                  if(colorsHexVal != null && colorsHexVal[color_quantity] != undefined){
                      if(typeof colorsHexVal[color_quantity].hexcode != 'undefined'){
                          element_color_style = "background-color:"+colorsHexVal[color_quantity].hexcode+";"
                      }
                      else if (typeof colorsHexVal[color_quantity].file != 'undefined') {
                          element_color_style = "background-image:url("+colorsHexVal[color_quantity].file.url+");"
                      }
                  }
                  colorSectionHtml1 = colorSectionHtml1.replace(/#data.colorSwatch#/g,element_color_style);
                  colorRawHtml += colorSectionHtml1;
                }
                $('#modal-table').find(".js-color-info-"+key1).html(colorRawHtml)

            }
        }

        let imprintHtml = $("#modal-table").find('.js-imprint-information').html()
        let imprintSectionHtml = ''
        if(typeof requestQuoteData.imprint != "undefined")
        {
          for (let [i,imprint_info] of requestQuoteData.imprint.entries())
          {
              imprintHtml1 = imprintHtml.replace("#data.imprintPostion#",imprint_info.imprint_position_name)
              imprintHtml1 = imprintHtml1.replace("#data.imprintMethod#",imprint_info.imprint_method_name)
              if(typeof imprint_info.no_of_color != 'undefined'){
                  imprintHtml1 = imprintHtml1.replace("#data.howmanyColors#",imprint_info.no_of_color)
              }else{
                  imprintHtml1 = imprintHtml1.replace("#data.howmanyColors#",'-')
              }
              let colorHtml = ''
              if(typeof imprint_info.selected_colors != "undefined")
              {
                //let imprintColorsHexVal = await replaceColorSwatchWithHexaCodes(imprint_info.selected_colors,"imprintcolor");
                for(let selected_color in imprint_info.selected_colors)
                {
                  let colorCount = parseInt(selected_color)+1;
                  let imprintColorHexKey = imprint_info.selected_colors[selected_color]
                  // if(imprintColorsHexVal != null && imprintColorsHexVal[imprintColorHexKey] != undefined ){
                  //     if(typeof imprintColorsHexVal[imprintColorHexKey].hexcode != 'undefined'){
                  //         imprintColorHexKey = imprintColorsHexVal[imprintColorHexKey].hexcode
                  //     }
                  // }
                  // colorHtml += "<div>Color"+colorCount+": "+"<span style='background-color:"+imprintColorHexKey+";'>"+imprint_info.selected_colors[selected_color]+"</span></div>";
                  colorHtml += "<div>Color"+colorCount+": "+"<span>"+imprint_info.selected_colors[selected_color]+"</span></div>";
                }
              }
              imprintHtml1 = imprintHtml1.replace("#data.imprintColors#",colorHtml)
              imprintSectionHtml += imprintHtml1;
          }

        }

        $("#modal-table").find('.js-imprint-information').html(imprintSectionHtml)
        hidePageAjaxLoading();
        $('#modal-table').modal('show');

        // QUANTITY PRICE TABLE START
          $(".quantity-table-col").owlCarousel({
              stopOnHover : true,
              navigation:true,
              items : 4,
              itemsDesktop: [1199, 4],
              itemsDesktopSmall: [979, 4],
              itemsTablet: [767, 2],
              itemsMobile: [479, 2]
          });
          // END QUANTITY PRICE TABLE END
    })
    .catch(function(error){
      hidePageAjaxLoading();
        console.log("error",error);
    })
}
function detailRequestInfo(thisObj){
  showPageAjaxLoading();
  let infoId = thisObj.data("id")
  $('#modal-table').addClass('model-popup-black');
  $('#modal-table').addClass('request-info-popup-modal');
  $("#modal-table").find(".modal-title").html('<i class="fa fa-question-circle"></i>View Request Info')
  $("#modal-table").find(".modal-body").addClass("modal-lg")
  axios({
      method: 'GET',
      url : project_settings.request_info_api_url+"/"+infoId,
  }).then(async response_data => {
      let requestInfoData = response_data.data
      let productInfo = requestInfoData.productInfo[0]
      let detailLink = website_settings.BaseURL+'productdetail.html?locale='+project_settings.default_culture+'&pid='+requestInfoData.productId;
      //console.log("requestInfoData",requestInfoData);
      let userInfo = await getUserDetailById(requestInfoData.userId)

      let userInfoHtml = ""
      userInfoHtml += "<h4>"+userInfo.fullname+"</h4>"

      // pending to fetch data from user after edit account
      //userInfoHtml += "<p></p>"

      let userContactInfoHtml = ""
      if(userInfo.phone != undefined && userInfo.phone != "") userContactInfoHtml += "<li><i class='fa fa-phone'></i>"+userInfo.phone+"</li>";
      if(userInfo.email != undefined && userInfo.email != "") userContactInfoHtml += "<li><i class='fa fa-envelope'></i>"+userInfo.email+"</li>";

      let colorsHexVal = await replaceColorSwatchWithHexaCodes(productInfo.attributes.colors,"color");
      let colorsHtml = ""
      if(productInfo.attributes.colors != undefined && productInfo.attributes.colors.length > 0) {
          for([key,val] of productInfo.attributes.colors.entries()){
            let element_color_style = "background-color:"+val+";"
            if(colorsHexVal != null && colorsHexVal[val] != undefined){
                if(typeof colorsHexVal[val].hexcode != 'undefined'){
                    element_color_style = "background-color:"+colorsHexVal[val].hexcode+";"
                }
                else if (typeof colorsHexVal[val].file != 'undefined') {
                    element_color_style = "background-image:url("+colorsHexVal[val].file.url+");"
                }
            }
            colorsHtml += "<li class='color2' title='"+val+"' data-original-title='"+val+"' style='"+element_color_style+"' data-placement='top' data-toggle='tooltip'></li>"
          }
      }

      let pricingHtml = ''

      if(productInfo.pricing != undefined){
            $.each(productInfo.pricing, function(index,element){
                  if(element.price_type == "regular" && element.type == "decorative" && element.global_price_type == "global"){
                      $.each(element.price_range,function(index,element2){
                            if(element2.qty.lte != undefined){
                                  pricingHtml += '<div><div class="table-heading">'+ element2.qty.gte + '-' + element2.qty.lte + '</div><div class="table-content">' + '$' + parseFloat(element2.price).toFixed(project_settings.price_decimal) + '</div></div>';
                            }else
                            {
                                  pricingHtml += '<div><div class="table-heading">'+ element2.qty.gte + '+' + '</div><div class="table-content">' + '$' + parseFloat(element2.price).toFixed(project_settings.price_decimal) + '</div></div>';
                            }
                      })
                  }
            })
      }

      let requestInfoHtml = $(".js_request_info_modal").html();
      requestInfoHtml = requestInfoHtml.replace(/#data.createAt#/g,formatDate(requestInfoData.createAt,project_settings.format_date))
      requestInfoHtml = requestInfoHtml.replace(/#data.infoId#/g,requestInfoData.id)
      requestInfoHtml = requestInfoHtml.replace("#data.productImage#",project_settings.product_api_image_url+productInfo.default_image)
      requestInfoHtml = requestInfoHtml.replace("#data.productName#",productInfo.product_name)
      requestInfoHtml = requestInfoHtml.replace("#data.productDescription#",productInfo.description)
      requestInfoHtml = requestInfoHtml.replace("#data.sku#",productInfo.sku)
      requestInfoHtml = requestInfoHtml.replace("#data.product_link#",detailLink)

      requestInfoHtml = requestInfoHtml.replace("#data.colors#",colorsHtml)
      requestInfoHtml = requestInfoHtml.replace("#data.pricing#",pricingHtml)
      if(requestInfoData.instruction != undefined && requestInfoData.instruction != "") requestInfoHtml = requestInfoHtml.replace("#data.specialIntruction#",requestInfoData.instruction)


      requestInfoHtml = requestInfoHtml.replace("#data.userInfo#",userInfoHtml)
      requestInfoHtml = requestInfoHtml.replace("#data.userContactInfo#",userContactInfoHtml)

      $(".js_add_html").html(requestInfoHtml)
      hidePageAjaxLoading();
      $('#modal-table').modal('show');

      // QUANTITY PRICE TABLE START
        $(".quantity-table-col").owlCarousel({
            stopOnHover : true,
            navigation:true,
            items : 4,
            itemsDesktop: [1199, 4],
            itemsDesktopSmall: [979, 4],
            itemsTablet: [767, 2],
            itemsMobile: [479, 2]
        });
        // END QUANTITY PRICE TABLE END

  }).catch(function(error){
    hidePageAjaxLoading();
      console.log("error",error.response);
  })
}
