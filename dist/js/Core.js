define("core", function () {
    var appFiles = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-files'));
    var core = {};

    core.config = function () {
        var config = {
            baseUrl: '/vendor',
            paths: {
                'core': 'controleonline-core-js/dist/js/Core',
                'jquery': 'jquery/dist/jquery.min',
                'lazyLoad': 'controleonline-core-js/dist/js/LazyLoad',
                'bootstrap': 'bootstrap/dist/js/bootstrap.min',
                'datatables': 'datatables/media/js/jquery.dataTables.min',
                'highcharts': 'highcharts/highcharts',
                'inputmask': 'jquery.inputmask/dist/min/inputmask/inputmask.min',
                'inputmask.dependencyLib': 'jquery.inputmask/dist/min/inputmask/inputmask.dependencyLib.jquery.min',
                'inputmask.extensions': "jquery.inputmask/dist/min/inputmask/inputmask.extensions.min",
                'inputmask.date.extensions': "jquery.inputmask/dist/min/inputmask/inputmask.date.extensions.min",
                'inputmask.numeric.extensions': "jquery.inputmask/dist/min/inputmask/inputmask.numeric.extensions.min",
                'inputmask.phone.extensions': "jquery.inputmask/dist/min/inputmask/inputmask.phone.extensions.min",
                'inputmask.regex.extensions': "jquery.inputmask/dist/min/inputmask/inputmask.regex.extensions.min",
                'jquery.inputmask': "jquery.inputmask/dist/min/inputmask/jquery.inputmask.min"
            },
            shim: {
                jquery: {
                    exports: "$"
                },
                jQueryInputmask: {
                    deps: ["jquery", "inputmask"],
                    exports: "$"
                }
            }
        };
        for (var k in appFiles) {
            config.paths[k] = appFiles[k];
        }
        require.config(config);


    };
    core.init = function () {
        this.config();
        this.bootstrap.init();
        this.lazyLoad.init();
        this.ajax.init();
        this.inputMask.init();
        this.dataTables.init();
        this.bind();
        for (var k in appFiles) {
            require([k], function (appFile) {
                if (typeof appFile.init === 'function') {
                    appFile.init();
                }
            });
        }
    };
    core.ajax = {
        init: function () {
            require(['jquery'], function ($) {
                var spin = '<i class="ajax-spin-save fa fa-spinner fa-spin"></i>';
                $.ajaxSetup({
                    beforeSend: function () {
                        var elem = $('[data-clicked=true]');
                        $(elem).attr('data-save');
                        if ($(elem).attr('data-save')) {
                            $(elem).append(spin);
                            $(elem).prop("disabled", true);
                        } else {
                            var loading = '<div id="wait-modal" class="modal fade" tabindex="-1" role="dialog" data-keyboard="false"  data-backdrop="static">';
                            loading += '<div class="modal-dialog">';
                            loading += '<div class="modal-content">';
                            loading += '<div class="modal-header" style="text-align: center">';
                            loading += '<h3>Por favor aguarde</h3>';
                            loading += '</div>';
                            loading += '<div class="modal-body" >';
                            loading += '<div style="height:200px">';
                            loading += '<i class="fa fa-spinner fa-6x fa-6 fa-spin" aria-hidden="true" style="font-size: 6em !important; position: absolute;display: block;top: 50%;left: 50%;margin-left: -50px;margin-top: -50px;"></i>';
                            loading += '</div>';
                            loading += '</div>';
                            loading += '<div class="modal-footer" style="text-align: center"></div>';
                            loading += '</div>';
                            loading += '</div>';
                            loading += '</div>';
                            loading += '</div>';
                            if (!$('body').find('#wait-modal').length) {
                                $('body').append(loading);
                            }
                            $('#wait-modal').modal('show');
                        }
                    },
                    complete: function (data) {
                        var elem = $('[data-clicked=true]');
                        $(elem).attr('data-save');
                        if ($(elem).attr('data-save')) {
                            $(elem).find('.ajax-spin-save').remove();
                            $(elem).prop("disabled", false);
                        } else {
                            $('#wait-modal').modal('hide');
                        }
                        core.show.result(data);
                    }
                });
            });
        }
    };

    core.show = {
        result: function (data) {
            if (typeof data === 'object') {
                if (data.responseJSON) {
                    var data = JSON.parse(data.responseText);
                    if (data.response && data.response.success) {
                        core.show.success();
                    } else if (data.response && data.response.error) {
                        core.show.error(data.response.error);
                    } else {
                        core.show.error();
                    }
                } else if (data.responseText) {
                    var response = $(data.responseText);
                    if (response.hasClass('modal')) {
                        var id = response.attr('id');
                        if (!id) {
                            id = Date.now() / 1000 | 0;
                            response.attr('id', id);
                        }
                        if ($('body').find('#' + id).length) {
                            $('body').find('#' + id).remove();
                        }
                        $('body').append(response);
                        $('body').find('#' + id).modal('show');
                        core.bind('#' + id);
                    }
                } else {
                    core.show.error();
                }
            }
        },
        error: function (error) {
            require(['jquery'], function ($) {
                error = error ? error : 'Nenhuma resposta';
                var id = Date.now() / 1000 | 0;
                var msg = '<div id="message-' + id + '" class="message-' + id + ' alert alert-danger fade in alert-dismissable">';
                msg += '<strong>';
                msg += error;
                msg += '<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">×</a>';
                msg += '</strong>';
                msg += '</div>';
                $(msg).prependTo($('.show-messages'));
            });
        },
        success: function (success) {
            require(['jquery'], function ($) {
                success = success ? success : 'Sucesso!';
                var id = Date.now() / 1000 | 0;
                var msg = '<div id="message-' + id + '" class="message-' + id + ' alert alert-success fade in alert-dismissable">';
                msg += '<strong>';
                msg += success;
                msg += '<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">×</a>';
                msg += '</strong>';
                msg += '</div>';
                $(msg).prependTo($('.show-messages'));
                $(".message-" + id).fadeTo(5000, 500).slideUp(500, function () {
                    $(".message-" + id).slideUp(500);
                });

            });
        }
    };
    core.bind = function (selector) {
        require(['jquery'], function ($) {
            selector = selector ? selector : '*';
            core.crud.init.add($(selector).find("[data-add]"));
            core.crud.init.save($(selector).find("[data-save]"));
            $(selector).find("*").click(function (e) {
                $("*").removeAttr('data-clicked');
                $(e.target).attr("data-clicked", true);
            });
        });
    };


    core.crud = {
        init: {
            add: function (selector) {
                require(['jquery'], function ($) {
                    if ($(selector).length) {
                        $(selector).each(function () {
                            $(this).click(function (e) {
                                e.preventDefault();
                                $.ajax({
                                    url: $(selector).data('add'),
                                    context: document.body
                                });
                            });
                        });
                    }
                });
            },
            save: function (selector) {
                require(['jquery'], function ($) {
                    if ($(selector).length) {
                        $(selector).each(function () {
                            $(this).click(function (e) {
                                e.preventDefault();
                                $.ajax({
                                    url: $(selector).data('save'),
                                    method: 'POST',
                                    dataType: 'json'
                                });
                            });
                        });
                    }
                });
            }
        }
    };
    core.inputMask = {
        init: function () {
            require(['jquery'], function ($) {
                if ($("[data-mask]").length) {
                    require(['jquery', 'jquery.inputmask'], function ($, inputmask) {
                        $("[data-mask]").each(function () {
                            $(this).inputmask(eval($(this).data('mask')));
                        });
                    });
                }
            });
        }
    };
    core.bootstrap = {
        init: function () {
            require(['jquery'], function () {
                require(['bootstrap']);
            });
        }
    };
    core.lazyLoad = {
        init: function () {
            require(['jquery'], function ($) {
                if ($('[data-ll]').length) {
                    require(['lazyLoad'], function (lazyLoad) {
                        lazyLoad.init();
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
