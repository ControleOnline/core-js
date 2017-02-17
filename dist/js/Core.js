define("core", function () {
    var appFiles = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-files'));
    var systemVersion = document.querySelectorAll('[system-version]')[0].getAttribute('system-version');
    var userLanguage = 'pt';
    var core = {};

    core.config = function () {
        var config = {
            baseUrl: '/vendor',
            paths: {
                'core': 'controleonline-core-js/dist/js/Core.js' + '?v=' + systemVersion,
                'jquery': 'jquery/dist/jquery.min.js' + '?v=' + systemVersion,
                'lazyLoad': 'controleonline-core-js/dist/js/LazyLoad.js' + '?v=' + systemVersion,
                'bootstrap': 'bootstrap/dist/js/bootstrap.min.js' + '?v=' + systemVersion,
                'bootstrap-switch': 'bootstrap-switch/dist/js/bootstrap-switch.min.js' + '?v=' + systemVersion,
                'datatables': 'datatables/media/js/jquery.dataTables.min.js' + '?v=' + systemVersion,
                'dataTables-bootstrap': 'datatables/media/js/jquery.dataTables.bootstrap.min.js' + '?v=' + systemVersion,
                'highcharts': 'highcharts/highcharts.js' + '?v=' + systemVersion,
                'inputmask': 'jquery.inputmask/dist/min/inputmask/inputmask.min.js' + '?v=' + systemVersion,
                'inputmask.dependencyLib': 'jquery.inputmask/dist/min/inputmask/inputmask.dependencyLib.jquery.min.js' + '?v=' + systemVersion,
                'inputmask.extensions': 'jquery.inputmask/dist/min/inputmask/inputmask.extensions.min.js' + '?v=' + systemVersion,
                'inputmask.date.extensions': 'jquery.inputmask/dist/min/inputmask/inputmask.date.extensions.min.js' + '?v=' + systemVersion,
                'inputmask.numeric.extensions': 'jquery.inputmask/dist/min/inputmask/inputmask.numeric.extensions.min.js' + '?v=' + systemVersion,
                'inputmask.phone.extensions': 'jquery.inputmask/dist/min/inputmask/inputmask.phone.extensions.min.js' + '?v=' + systemVersion,
                'inputmask.regex.extensions': 'jquery.inputmask/dist/min/inputmask/inputmask.regex.extensions.min.js' + '?v=' + systemVersion,
                'jquery.inputmask': 'jquery.inputmask/dist/min/inputmask/jquery.inputmask.min.js' + '?v=' + systemVersion,
                'form-validator': 'jquery-form-validator/form-validator/jquery.form-validator.min.js' + '?v=' + systemVersion,
                'match-height': 'matchHeight/jquery.matchHeight-min.js' + '?v=' + systemVersion,
                'select2': 'select2/dist/js/select2.full.min.js' + '?v=' + systemVersion,
                'ace': 'ace-builds/src/ace.js' + '?v=' + systemVersion,
                'mode-html': 'ace-builds/src/mode-html.js' + '?v=' + systemVersion,
                'theme-github': 'ace-builds/src/theme-github.js' + '?v=' + systemVersion,
            },
            shim: {
                jquery: {
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
        require(['jquery'], function ($) {
            $(function () {
                core.lazyLoad.init();
                core.bootstrap.init();
                core.ajax.init();
                core.bind();
                for (var k in appFiles) {
                    require([k], function (appFile) {
                        if (typeof appFile.init === 'function') {
                            appFile.init();
                        }
                    });
                }
                $('body').removeAttr('data-js-files');
            });
        });
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
            $(function () {
                selector = selector ? selector : '*';
                core.crud.init.add($(selector).find("[data-add]"));
                core.crud.init.save($(selector).find("[data-save]"));
                core.formValidator.init($(selector).find("[data-validation]"));
                //core.inputMask.init.mask($(selector).find("[data-mask]"));
                //core.inputMask.init.maskRegex($(selector).find("[data-mask-regex]"));
                core.dataTables.init($(selector).find('.datatable'));

                $(selector).find("*").click(function (e) {
                    $("*").removeAttr('data-clicked');
                    $(e.target).attr("data-clicked", true);
                });
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
    core.formValidator = {
        init: function (selector) {
            require(['jquery'], function ($) {
                if ($(selector).length) {
                    require(['form-validator'], function () {
                        $.validate({
                            lang: userLanguage,
                            modules: ['security', 'location'],
                        });
                    });
                }
            });
        }
    };
    core.inputMask = {
        init: {
            mask: function (selector) {
                require(['jquery'], function ($) {
                    if ($(selector).length) {
                        require(['inputmask', 'jquery.inputmask'], function () {
                            $(selector).each(function () {
                                $(this).inputmask(eval($(this).data('mask')));
                            });
                        });
                    }
                });
            },
            maskRegex: function (selector) {
                /*
                 $(selector).each(function () {
                 if ($(this).data('validation-backend')) {
                 $(this).blur(function () {
                 $(this).validate(function (valid, elem) {
                 console.log('Element ' + elem.name + ' is ' + (valid ? 'valid' : 'invalid') + ' ' + $(elem).data('validation-backend'));
                 });
                 
                 });
                 }
                 });
                 */
                require(['jquery'], function ($) {
                    if ($(selector).length) {
                        require(['inputmask', 'jquery.inputmask', 'inputmask.regex.extensions'], function () {
                            $(selector).each(function () {
                                $(this).inputmask('Regex', eval($(this).data('mask-regex')));
                            });
                        });
                    }
                });
            }
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
        init: function (selector) {
            require(['jquery'], function ($) {
                if ($(selector).length) {
                    core.loadCss('datatables/media/css/jquery.dataTables.min.css');
                    core.dataTables.bind(selector);
                }
            });
        },
        bind: function (table) {
            require(['datatables', 'dataTables-bootstrap'], function (dt) {
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
        require(['datatables'], function (dt) {
            if ($('link [href="' + baseURL + url + '"]').length === 0) {
                document.getElementsByTagName("head")[0].appendChild(link);
            }
        });
    };

    return core;
});
require(['core'], function (core) {
    core.init();
});
