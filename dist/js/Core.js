define("ControleOnline", function () {
    var ControleOnline = {};
    ControleOnline.init = function () {
        requirejs.config({
            baseUrl: '/vendor',
            paths: {
                jquery: 'jquery/dist/jquery.min',
                bootstrap: 'bootstrap/dist/js/bootstrap.min',
                datatables: 'datatables/media/js/jquery.dataTables.min',
                highcharts: 'highcharts/highcharts',
                lazyLoad: 'controleonline-core-js/dist/js/LazyLoad'
            }
        });
        ControleOnline.datatables.init();
        ControleOnline.lazyLoad.init();
        ControleOnline.fontAwesome.init();
        ControleOnline.bootstrap.init();

    };
    ControleOnline.bootstrap = {
        init: function () {
            requirejs(['jquery', 'bootstrap'], function () {
                ControleOnline.loadCss('bootstrap/dist/css/bootstrap.min.css');
            });
        }
    };
    ControleOnline.fontAwesome = {
        init: function () {
            ControleOnline.loadCss('fontawesome/css/font-awesome.min.css');
        }
    },
            ControleOnline.lazyLoad = {
                init: function () {
                    requirejs(['lazyLoad'], function (lazyLoad) {
                        lazyLoad.init();
                        ControleOnline.loadCss('controleonline-core-js/dist/css/LazyLoad.css');
                    });
                }
            },
            ControleOnline.datatables = {
                init: function () {
                    requirejs(['jquery'], function () {
                        if ($('.datatable-ajax')) {
                            ControleOnline.loadCss('datatables/media/css/jquery.dataTables.min.css');
                            ControleOnline.datatables.bind();
                        }
                    });
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
            };
    ControleOnline.loadCss = function (url) {
        var baseURL = require.toUrl('.');
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = baseURL + url;

        document.getElementsByTagName("head")[0].appendChild(link);
    };
    ControleOnline.config = function (config) {
        requirejs.config(config);
    };
    return ControleOnline;
});
requirejs(['ControleOnline'], function (ControleOnline) {
    ControleOnline.init();
});