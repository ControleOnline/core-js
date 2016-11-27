requirejs.config({
    baseUrl: '/vendor',
    paths: {
        jquery: 'jquery/dist/jquery.min',
        bootstrap: 'bootstrap/dist/js/bootstrap.min',
        datatables: 'datatables/media/jquery.dataTables.min',
        highcharts: 'highcharts/highcharts'        
    },
    map: {
        '*': {'jquery': 'jquery-private'},
        'jquery-private': {'jquery': 'jquery'}
    }
});
define(['jquery'], function (jq) {
    return jq.noConflict(true);
});
requirejs(['jquery'], function ($) {
    console.log($);
});