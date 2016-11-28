var core_js = {
    __construct: (function () {
        document.addEventListener("DOMContentLoaded", function () {
            core_js.init();
        });
    })(),
    init: function () {
        core_js.config({
            baseUrl: '/vendor',
            paths: {
                jquery: 'jquery/dist/jquery.min',
                bootstrap: 'bootstrap/dist/js/bootstrap.min',
                datatables: 'datatables/media/js/jquery.dataTables.min',
                highcharts: 'highcharts/highcharts'
            }
        });
        core_js.datatables.init();
    },
    datatables: {
        init: function () {
            if ($('.datatable-ajax')) {
                core_js.loadCss('/vendor/datatables/media/css/jquery.dataTables.min.css');
                core_js.datatables.bind();
            }
        },
        bind: function (table) {
            requirejs(['datatables'], function (dt) {
                $('.datatable-ajax').each(function (i) {
                    var e = $(this);
                    e.DataTable({
                        "processing": true,
                        "serverSide": true,
                        "ajax": e.attr('data-source'),
                        "rowCallback": function (row, data) {
                            if ($.inArray(data.DT_RowId, selected) !== -1) {
                                $(row).addClass('selected');
                            }
                        }
                    });
                });


            });
        }
    },
    loadCss: function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    },
    config: function (config) {
        requirejs.config(config);
    }
};
core_js.init();