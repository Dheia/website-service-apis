$(document).ready(function(){
    let pid = getParameterByName('pid');

    if($("#order_sample").length > 0){
        let link = $("#order_sample").attr("href")
        link = link.replace("#data.productId#",pid)
        $("#order_sample").attr("href",link)

    }

    // download variation images
    $("#download_image").on("click",async function(){
        let productResponse = await getProductDetailById(pid)
        if(productResponse != null && productResponse.images != undefined){
            // console.log("productResponse",productResponse);
            let zip = new JSZip();
            let count = 0;
            let zipFilename = productResponse.sku+".zip";
            let urls = productResponse.images[0].images;
            urls.forEach(function(urlObj){
              let filename = urlObj.web_image;
              // loading a file and add it in a zip file
              JSZipUtils.getBinaryContent(urlObj.secure_url, function (err, data) {
                 if(err) {
                    throw err; // or handle the error
                 }
                 zip.file(filename, data, {binary:true});
                 count++;
                 if (count == urls.length) {
                   zip.generateAsync({type:'blob'}).then(function(content) {
                    //  window.location = "data:application/zip;base64," + content;
                      saveAs(content, zipFilename);
                      // location.href="data:application/zip;base64," + content;
                   });
                }
              });
            });
        }
    })

    $(document).on('click','#js-show_play_video', async function (e) {
        let productResponse = await getProductDetailById(pid)
        if(productResponse.video_url.trim() != '') {
            $('#modal-table').attr('class','modal fade model-popup-black');
            $("#modal-table").find(".modal-title").html('<i class="strip video-popup-strip"></i>Play Video');
            $("#modal-table").find(".modal-dialog").addClass("play-video");
            $(".js-play_video_block .play-video-block").html('<iframe frameborder="0" allowfullscreen="1" title="YouTube video player" width="573" height="350" src="'+productResponse.video_url+'"></iframe>');
            let guestUserHtml = $(".js-play_video_block").html();
            //let replaceHtml = guestUserHtml.replace("#data.video_url#",productResponse.video_url);
            $(".js_add_html").html(guestUserHtml)
            $('#modal-table').modal('show');
            return false;
        }
    });

    $(document).on('click','#js-share_product', function (e) {
        $('#modal-table').attr('class','modal fade model-popup-black');
        $("#modal-table").find(".modal-title").html('<i class="strip share-popup-strip"></i>Share Product');
        $("#modal-table").find(".modal-dialog").removeClass("play-video");
        let guestUserHtml = $(".js-share_product_html").html();
        $(".js_add_html").html(guestUserHtml)
        $('#modal-table').modal('show');

        // var switchTo5x=true;
        $.getScript("http://w.sharethis.com/button/buttons.js", function(){
            stLight.options({publisher: "2c09b640-d455-4fbb-a9c9-1046dc187914", doNotHash: false, doNotCopy: false, hashAddressBar: false, popup: 'true'});
            // stLight.options({publisher: "c68c8f6c-c670-419b-b8e2-23772e22a861", doNotHash: false, doNotCopy: false, hashAddressBar: false, popup: 'true'});
            stButtons.locateElements();
        });

        return false;
    });

    //shipping estimator
    //Shipping estimator
    $('#js_open_modal_shipping_estimator').on('click', async function() {
        $('form#calculate_shipping_estimator')[0].reset();
        $(".js-country").html();
        let productResponse = await getProductDetailById(pid)
        getCountryData();
        if(productResponse != null){
            $('.productName').text(productResponse.product_name)
            $('.itemCode').text('( Item Code:'+productResponse.sku+')')
        }
        $('.js-submit-btn-rate-calculation').on('click', async function() {
            $('#estimatorError').css({"display":"none"})
            $('#estimatorResponse').css({"display":"none"})
            let formData = $('form#calculate_shipping_estimator').serializeArray()
            console.log('------formData',formData)
            let shipInfo = {};
            let shippingType = []
            for (var input in formData){
                var value = formData[input]['value'];
                if (formData[input]['name'] == 'shipping_type') {
                    shippingType.push(value)
                }
                else {
                    shipInfo[formData[input]['name']] = value;
                }
            }
            shipInfo['shippingType'] = shippingType;
            if (shipInfo.qty != '' && shipInfo.zip_code != '' && shipInfo.country != '' && shipInfo.shippingType.length > 0) {
                if (shipInfo.qty > 0) {
                    showPageAjaxLoading();
                    let estimatorObject = {
                        'shipperInfo' : productResponse.shipping[0],
                        'shipToInfo' : shipInfo
                    };
                    console.log('estimatorObject',estimatorObject)
                    $.ajax({
                        type: 'POST',
                        url: 'http://localhost:3030/rate-calculation',
                        async: true,
                        data:  estimatorObject,
                        dataType: 'json',
                        success: function (result) {
                            let old_tbody = document.getElementsByTagName('tbody')[0];
                            
                            var tableBody = document.createElement('TBODY');
                            let markUpPer = 5;
                            let markUpValue;
                            Object.keys(result).forEach(function eachKey(key) {
                                var tr = document.createElement('TR');
                                tableBody.appendChild(tr);
                                var td = document.createElement('TD');
                                td.className="estimatorResult"
                                td.appendChild(document.createTextNode(key));
                                tr.appendChild(td);
                                td = document.createElement('TD');  
                                td.className="estimatorResult"
                                markUpValue = (Number(result[key]) * markUpPer)/100;
                                result[key] += markUpValue;
                                td.appendChild(document.createTextNode(": "+result[key].toFixed(2)));
                                tr.appendChild(td);
                            });
                            old_tbody.parentNode.replaceChild(tableBody,old_tbody);
                            hidePageAjaxLoading()
                            $('#estimatorResponse').css({"display":"block"})
                            $(".estimatorResult").css({"padding": "3px 5px"});
                        },
                        error: function(err) {
                            hidePageAjaxLoading()
                            console.log('error',err.responseJSON.message);
                            $('#estimatorError').css({"display":"block"})
                            $('#estimatorError').text(err.responseJSON.message)
                            // showErrorMessage(err.responseJSON.message)
                        }
                    });
                }
                else {
                    $('#estimatorError').css({"display":"block"})
                    $('#estimatorError').text('Quantity must be greater than zero')
                }
            }
            else {
                $('#estimatorError').css({"display":"block"})
                $('#estimatorError').text('Please fill all the required fields correctly')
            }
        })
    })

    // inventory start
    let inventoryData = [];
    $(document).on('click','#js-check-inventory', async function (e) {
        $('.js-inventory-colors').html('');
        let productResponse = await getProductDetailById(pid)
        if(productResponse.inventory != 'undefined' && productResponse.inventory.length > 0) {
            $.each(productResponse.inventory, function(i,element){
                let colorInventoryColors = "";
                $.each(element.attributes.colors, async function(j,color){
                    inventoryData[color] = parseInt(element.qty_on_hand);
                    let element_color_style = "background-color:"+color+";"
                    let colorsHexVal = await replaceColorSwatchWithHexaCodes(color,"color");
                    if(colorsHexVal != null && colorsHexVal[color] != undefined){
                        if(typeof colorsHexVal[color].hexcode != 'undefined'){
                            element_color_style = "background-color:"+colorsHexVal[color].hexcode+";"
                        }
                        else if (typeof colorsHexVal[element_color].file != 'undefined') {
                            element_color_style = "background-image:url("+colorsHexVal[color].file.url+");"
                        }
                    }
                    colorInventoryColors = '<li role="presentation"><a class="Color-box" data-value="'+color+'" style="'+element_color_style+'" role="menuitem" tabindex="-1" href="javascript:;"></a></li>';
                    $('.js-inventory-colors').append(colorInventoryColors);
                });
            });
        }
    });
    $(document).on('click','.js-inventory-colors li', function (e) {
        if($(this).find('a').attr("style") != 'undefined' && $(this).find('a').attr("style") != '') {
            $('.js-current-color').attr('data-value',$(this).find('a').data("value"))
            $('.js-current-color').attr('style',$(this).find('a').attr("style"))
        }
    });
    $(document).on('click','.js-inventory-submit', function (e) {
        let colorName = $('.js-current-color').attr('data-value');
        let enteredQty = $('.js-inventory-quantity').val();

        if(colorName == undefined || colorName == '') {
            $('.js-inventory-msg').css('color','red');
            $('.js-inventory-msg').html('Please select color.');
            return false;
        }
        else if(Math.floor(enteredQty) == enteredQty && $.isNumeric(enteredQty)) {
            if(enteredQty <= inventoryData[colorName]) {
                $('.js-inventory-msg').css('color','green');
                $('.js-inventory-msg').html('In Stock');
                return false;
            }
            else {
                $('.js-inventory-msg').css('color','red');
                $('.js-inventory-msg').html('Not in Stock');
                return false;
            }
        }
        else {
            $('.js-inventory-msg').css('color','red');
            $('.js-inventory-msg').html('Please enter valid quantity.');
            return false;
        }
    });
    // inventory end
});

$(document).on('click','.send-email-product', function (e) {
    $('form#email_product').validate({
        rules: {
            "name":"required",
            "from_email":{
                required:true,
                email: true
            },
            "to_email":{
                required:true,
                multiemails: true
            },
            "message":"required",
        },
        messages: {
            "name":"Please enter sender name.",
            "from_email":{
                required:"Please enter sender email",
                email: "Please enter valid sender email."
            },
            "to_email":{
                required:"Please enter receiver email",
                multiemails: "Please enter valid receiver email."
            },
            "message":"Please enter message.",
        },
        errorElement: "li",
        errorPlacement: function(error, element) {
            error.appendTo(element.closest("div"));
            $(element).closest('div').find('ul').addClass('red')
        },
        errorLabelContainer: "#errors",
        wrapper: "ul",
        submitHandler: function(form) {
            showPageAjaxLoading();
            let productResponse = $.ajax({
                type: 'GET',
                url: project_settings.product_api_url+"?_id="+pid+"&source=default_image,sku,product_name,pricing,features,images",
                async: false,
                beforeSend: function (xhr) {
                  xhr.setRequestHeader ("vid", website_settings.Projectvid.vid);
                },
                dataType: 'json',
                success: function (data)
                {
                    let formObj = $(form);
                    var productJsonData = {};
                    productJsonData['data'] = data.hits.hits[0]._source;
                    
                    var form_data = formObj.serializeArray();
                    var emailProduct = {};
                    for (var input in form_data){
                        var name = form_data[input]['value'];
                        emailProduct[form_data[input]['name']] = name;
                        emailProduct['slug'] = 'email-product';
                        emailProduct['email'] = emailProduct['from_email'];
                    }
                    productJsonData['form_data'] = emailProduct;

                    productJsonData['website_id'] = website_settings['projectID'];


                    var fetureList = '';
                    for (let [i, features] of productJsonData['data'].features.entries() ) {
                        fetureList += "<b>"+features.key+"</b>: "+features.value+"<br/><br/>";
                    }
                    productJsonData['features'] = fetureList;


                    if(productJsonData['data'].pricing != undefined){
                        let priceRang = [];
                        $.each(productJsonData['data'].pricing, function(index,element){
                                if(element.price_type == "regular" && element.type == "decorative" && element.global_price_type == "global"){
                                    $.each(element.price_range,function(index,element2){
                                    if(element2.qty.lte != undefined){
                                        priceRang.push(element2.qty.gte + '-' + element2.qty.lte);
                                        }
                                        else
                                        {
                                        priceRang.push(element2.qty.gte + '+');
                                        }
                                    });
                                }
                        });
                        productJsonData['quantity_head'] = priceRang;
                    }
                    if(productJsonData['data'].pricing != undefined){
                        let priceRang = [];
                        $.each(productJsonData['data'].pricing, function(index,element){
                            if(element.price_type == "regular" && element.type == "decorative" && element.global_price_type == "global")
                            {
                                $.each(element.price_range,function(index,element2){
                                    if(element2.qty.lte != undefined){
                                        priceRang.push(element2.price.toFixed(project_settings.price_decimal));
                                    }
                                    else
                                    {
                                    priceRang.push(element2.price.toFixed(project_settings.price_decimal));
                                    }
                                });
                            }
                        });
                        productJsonData['quantity_pricing'] = priceRang;
                    }
                    
                    if(productJsonData['data'].images != undefined){
                        productJsonData['image'] = productJsonData['data'].images[0].images[0].secure_url;
                    }else{
                        productJsonData['image'] = 'https://res.cloudinary.com/flowz/image/upload/v1531481668/websites/images/no-image.png';
                    }

                    $.ajax({
                    type : 'POST',
                    url : project_settings.request_quote_api_url,
                    data : productJsonData,
                    dataType : 'json',
                        success : function(response_data) {
                            // $('#emailProduct').modal('toggle');
                            if(response_data!= "") {
                                // $("#email_product").find("input,textarea").val('');
                                hidePageAjaxLoading()
                                showSuccessMessage("Email Sent Successfully.");
                                $('#emailProduct').modal('toggle');
                                // window.location = "thankYou.html";
                                return false;
                            }
                            else if(response_data.status == 400) {
                                hidePageAjaxLoading()
                                return false;
                            }
                        }
                    });
                }
            });
        },
    }).form()
});

// Print Product 
$(document).on('click','.js-product-detail-print-product', async function (e) {
    showPageAjaxLoading();
    let productResponse = await getProductDetailById(pid)
    $('#modal-table').attr('class','modal fade model-popup-black print-product-detail');
    $("#modal-table").find(".modal-title").html('<i class="strip video-popup-strip"></i> Print Preview');
    $("#modal-table").find(".modal-dialog").removeClass("play-video").addClass('print-product print-comparision');

    // Product Quantity Price
    if(productResponse.pricing != undefined){
        let priceRang = '';
            $.each(productResponse.pricing, function(index,element){
                if(element.price_type == "regular" && element.type == "decorative" && element.global_price_type == "global"){
                        $.each(element.price_range,function(index,element2){
                        // console.log("in each condition");
                        if(element2.qty.lte != undefined){
                            priceRang += '<div><div class="table-heading print_product_col">'+ element2.qty.gte + '-' + element2.qty.lte + '</div><div class="table-content print_product_col">' + '$' + parseFloat(element2.price).toFixed(project_settings.price_decimal) + '</div></div>';
                        }
                        else
                        {
                            priceRang += '<div><div class="table-heading print_product_col">'+ element2.qty.gte + '+' + '</div><div class="table-content print_product_col">' + '$' + parseFloat(element2.price).toFixed(project_settings.price_decimal) + '</div></div>';
                        }
                            });
                        $("#print-product").find(".quantity-table-col").html(priceRang);    
                        $("#print-product").find(".quantity-table-col").css('opacity',1);
                }
            });
        }

    let guestUserHtml = $("#print-product").html();

    guestUserHtml = guestUserHtml.replace(/#data.product_name#/g,productResponse.product_name);
    guestUserHtml = guestUserHtml.replace('#data.sku#',productResponse.sku);
    guestUserHtml = guestUserHtml.replace('#data.description#',productResponse.description);
    guestUserHtml = guestUserHtml.replace('#data.colors#',productResponse.attributes.colors);

    if(productResponse.images != undefined){
        guestUserHtml = guestUserHtml.replace('#data.product_img#',productResponse.images[0].images[0].secure_url);
    }else{
        guestUserHtml = guestUserHtml.replace('#data.product_img#','https://res.cloudinary.com/flowz/image/upload/v1531481668/websites/images/no-image.png');        
    }
    
    if(productResponse.imprint_data instanceof Array || productResponse.shipping instanceof Array) {
        if(productResponse.imprint_data instanceof Array) {
            production_days = productResponse.imprint_data[0].production_days+" "+productResponse.imprint_data[0].production_unit;
            setup_charge = productResponse.imprint_data[0].setup_charge;
            if(typeof production_days !== "undefined" && production_days != '') {
                guestUserHtml = guestUserHtml.replace('#data.production_days#',production_days);
            }
            else{
                guestUserHtml = guestUserHtml.replace('#data.production_days#','-');
            }

            if(typeof setup_charge !== "undefined" && setup_charge != '') {
                guestUserHtml = guestUserHtml.replace('#data.setup_charge#',setup_charge);
            }
            else{
                guestUserHtml = guestUserHtml.replace('#data.setup_charge#','-');
            }
        }
        if(productResponse.shipping instanceof Array) {
            if(productResponse.shipping[0].free_on_board != undefined && productResponse.shipping[0].free_on_board != ''){
                fob = productResponse.shipping[0].free_on_board;
                guestUserHtml = guestUserHtml.replace('#data.fob#',fob);
            }
            else{
                guestUserHtml = guestUserHtml.replace('#data.fob#','-');
            }
            
            // if(productResponse.shipping[0].carton_length != undefined && productResponse.shipping[0].carton_length != ''){
            //     carton_length = productResponse.shipping[0].carton_length+" "+productResponse.shipping[0].carton_size_unit;
            //     guestUserHtml = guestUserHtml.replace('#data.setup_charge#',setup_charge);
            // }

            // if(productResponse.shipping[0].carton_weight != undefined  && productResponse.shipping[0].carton_weight != ''){
            //     carton_weight = productResponse.shipping[0].carton_weight+" "+productResponse.shipping[0].carton_weight_unit;
            //     guestUserHtml = guestUserHtml.replace('#data.setup_charge#',setup_charge);
            // }

            if(productResponse.shipping[0].shipping_qty_per_carton !=undefined  && productResponse.shipping[0].shipping_qty_per_carton != ''){
                shipping_qty_per_carton = productResponse.shipping[0].shipping_qty_per_carton;
                guestUserHtml = guestUserHtml.replace('#data.qty_per_carton#',shipping_qty_per_carton);
            }
            else{
                guestUserHtml = guestUserHtml.replace('#data.qty_per_carton#','-');
            }
        }
        else{
            guestUserHtml = guestUserHtml.replace('#data.qty_per_carton#','-');
            guestUserHtml = guestUserHtml.replace('#data.fob#','-');
        }
    }
    
    // let colorsHexVal = await replaceColorSwatchWithHexaCodes(productResponse.attributes.colors,"color");
    // console.log("colorsHexVal",colorsHexVal);
    hidePageAjaxLoading();
    $(".js_add_html").html(guestUserHtml)
    $('#modal-table').modal('show');
    return false;
});

$(document).on('click','.js-print-it', function (e) {
    showPageAjaxLoading();
    printElement(document.getElementById("print-product"));
    hidePageAjaxLoading();
})

function printElement(elem) {
    var domClone = elem.cloneNode(true);
    
    var $printSection = document.getElementById("printSection");
    
    if (!$printSection) {
        var $printSection = document.createElement("div");
        $printSection.id = "printSection";
        document.body.appendChild($printSection);
    }
    $printSection.innerHTML = "";
    $printSection.appendChild(domClone);
    setTimeout(function(){
        window.print();
    },2000);
}
// END - Print Product

/*  Get country Data from project_settings */
function getCountryData(countryId=0) {
    if( $(".js-country").length > 0 ) {
        
        let countryList = [];
        //short_name
        $.each(project_settings.country_data,function(key,country){
            countryList.push(country.short_name);
        })
        axios({
            method: 'GET',
            url: project_settings.city_country_state_api,
            params: {
                'country_data':countryList,
                'data_from' : 'country_code',
                'type' : 1
            }
        })
        .then(response => {
            let countryHtml = $(".js-country").html('');
            if(response.data.length > 0){
                countryHtml = '<option value="" selected="selected">Select Country</option>'
                $.each(response.data,function(key,country){
                    countryHtml += '<option value="'+country.country_code+'">'+country.country_name+'</option>'
                })
                $('.js-country').html(countryHtml)
                // doSelection('country',countryId);
            }
        })
        .catch(error => {
        // console.log('Error fetching and parsing data', error);
        });
    }

}