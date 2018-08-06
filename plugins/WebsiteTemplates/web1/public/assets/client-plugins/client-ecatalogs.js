let ecatalogUrl = project_settings.ecatalogs_api_url+"?website="+website_settings['projectID'];
if(getParameterByName('fcid')) {
    ecatalogUrl += "&fcid="+getParameterByName('fcid');
}

ecatalogs = function () {
    let tmp = null;
    $.ajax({
        'async': false,
        'type': "GET",
        'global': false,
        'dataType': 'json',
        'url': ecatalogUrl,
        'success': function (res) {
            tmp = res.data;
        }
    });
    return tmp;
}();

ecatalog_categories = function () {
    let tmp = null;
    $.ajax({
        'async': false,
        'type': "GET",
        'global': false,
        'dataType': 'json',
        'url': project_settings.ecatalog_category_api_url+"?website="+website_settings['projectID'],
        'success': function (res) {
            tmp = res.data;
        }
    });
    return tmp;
}();

ecatalog_data(ecatalogs);
async function ecatalog_data(ecatalogs) {
    if(ecatalogs != null && ecatalogs.length > 0)
    {
        showPageAjaxLoading();
        await sleep(100);

        let listHtml = $('#myEcatalogs .js-list').html();
        $.each( ecatalogs, function( key, ecatalogArray ) {            
            let listHtml1 = "";

            listHtml1 = listHtml.replace('#ecatalog-image#',ecatalogArray.ecatalog_image);

            listHtml1 = listHtml1.replace(/#ecatalog-id#/g,ecatalogArray.id);
            
            listHtml1 = listHtml1.replace('#ecatalog-title#',ecatalogArray.ecatalog_name);
                            
            listHtml1 = listHtml1.replace(/#ecatalog-image-link#/g,ecatalogArray.ecatalog_image);

            listHtml1 = listHtml1.replace(/#ecatalog-pdf-link#/g,ecatalogArray.ecatalog_pdf);
            
            $('#myEcatalogs .listing').append(listHtml1);
        });

        
        hidePageAjaxLoading();
    }
    else {
        $('#myEcatalogs .listing').html('No records found.');
    }
}