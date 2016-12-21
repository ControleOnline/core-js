define("core", function () {
    var appFiles = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-files'));
    var core = {};
    core.config = function () {
        var config = {
            baseUrl: '/vendor',
            paths: {
                jquery: 'jquery/dist/jquery.min',
                bootstrap: 'bootstrap/dist/js/bootstrap.min',
                datatables: 'datatables/media/js/jquery.dataTables.min',
                highcharts: 'highcharts/highcharts',
                lazyLoad: 'controleonline-core-js/dist/js/LazyLoad',
                core: 'controleonline-core-js/dist/js/Core'
            }
        };
        for (k in appFiles) {
            config.paths[k] = appFiles[k];
        }
        require.config(config);
    };
    core.init = function () {
        this.config();
        this.bootstrap.init();
        this.lazyLoad.init();
        this.fontAwesome.init();
        this.dataTables.init();
        for (k in appFiles) {
            require([k], function (appFile) {
                appFile.init();
            });
        }
    };
    core.bootstrap = {
        init: function () {
            require(['jquery'], function () {
                require(['bootstrap'], function () {
                    core.loadCss('bootstrap/dist/css/bootstrap.min.css');
                });
            });
        }
    };
    core.fontAwesome = {
        init: function () {
            require(['jquery'], function ($) {
                if ($('.fa').length) {
                    core.loadCss('fontawesome/css/font-awesome.min.css');
                }
            });
        }
    };
    core.lazyLoad = {
        init: function () {
            require(['jquery'], function ($) {
                if ($('[data-ll]').length) {
                    require(['lazyLoad'], function (lazyLoad) {
                        lazyLoad.init();
                        core.loadCss('controleonline-core-js/dist/css/LazyLoad.css');
                    });
                }
            });
        }
    };
    core.dataTables = {
        init: function () {
            require(['jquery'], function ($) {
                if ($('.datatable').length) {
                    core.loadCss('datatables/media/css/jquery.dataTables.min.css');
                    core.dataTables.bind('.datatable');
                }
            });
        },
        bind: function (table) {
            require(['datatables'], function (dt) {
                $(table).each(function (i) {
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
    core.loadCss = function (url) {
        var baseURL = require.toUrl('.');
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = baseURL + url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return core;
});
require(['core'], function (core) {
    core.init();
});
