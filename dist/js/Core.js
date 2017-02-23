define("core", function () {
    var appFiles = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-files'));
    var appLibs = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-libs'));
    var systemVersion = document.querySelectorAll('[system-version]')[0].getAttribute('system-version');
    var userLanguage = document.querySelectorAll('html')[0].getAttribute('lang');
    var core = {};    
    core.config = function () {
        var config = {
            waitSeconds: 0,
            baseUrl: '/vendor',
            paths: {},
            shim: {
                jquery: {
                    exports: "$"
                }
            }
        };
        Object.keys(appLibs).forEach(function (key) {
            config.paths[key] = appLibs[key] + '?v=' + systemVersion;
        });
        Object.keys(appFiles).forEach(function (key) {
            config.paths[key] = appFiles[key] + '.js?v=' + systemVersion;
        });
        require.config(config);
    };
    core.ready = function () {
        this.config();
        require(['jquery'], function ($) {
            if ($.isReady) {
                core.load.modules();
            }
            $(document).ready(function () {
                core.load.modules();
            });
        });
    };
    core.load = {
        modules: function () {
            $('body').removeAttr('data-js-files');
            $('body').removeAttr('data-js-libs');
            core.lazyLoad.init();
            core.bootstrap.init();
            core.ajax.init();
            core.bind();
            Object.keys(appFiles).forEach(function (key) {
                require([key], function (appFile) {                    
                    appFile.init();
                });
            });
        }
    };
    core.ajax = {
        init: function () {
            require(['jquery'], function ($) {
                $.ajaxSetup({
                    beforeSend: function () {
                        var elem = $('[data-clicked=true]');
                        if ($(elem).attr('data-save')) {
                            $(elem).append(core.show.spin('ajax-spin-save'));
                            $(elem).prop("disabled", true);
                        } else {
                            var loading = '<div id="wait-modal" class="modal fade" tabindex="-1" role="dialog" data-keyboard="false"  data-backdrop="static">';
                            loading += '<div class="loading-dialog">';
                            loading += '<div class="loading-content">';
                            loading += '<div class="loading-header" style="text-align: center">';
                            loading += '</div>';
                            loading += '<div class="loading-body" >';
                            loading += '<div>';
                            loading += '<i class="fa fa-circle-o-notch fa-6x fa-6 fa-spin loading-spin" aria-hidden="true"></i>';
                            loading += '</div>';
                            loading += '</div>';
                            loading += '<div class="loading-footer" style="text-align: center"></div>';
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
                    },
                    error: function (jqXHR, x, ajaxOptions, exception) {
                        var message;
                        var statusErrorMap = {
                            '400': "Server understood the request, but request content was invalid.",
                            '401': "Unauthorized access.",
                            '403': "Forbidden resource can't be accessed.",
                            '500': "Internal server error.",
                            '503': "Service unavailable.",
                            '404': "Page not found."
                        };
                        if (jqXHR.status) {
                            message = statusErrorMap[jqXHR.status];
                            if (!message) {
                                message = "Unknown Error \n.";
                            }
                        } else if (exception == 'parsererror') {
                            message = "Error.\nParsing JSON Request failed.";
                        } else if (exception == 'timeout') {
                            message = "Request Time out.";
                        } else if (exception == 'abort') {
                            message = "Request was aborted by the server";
                        } else {
                            message = "Unknown Error \n.";
                        }
                        core.show.error(message);
                    }
                });
            });
        }
    };
    core.show = {
        spin: function (cssClass) {
            return '<i class="' + cssClass + ' ajax-spin fa fa-spinner fa-spin"></i>';
        },
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
            } else {
                core.show.error();
            }
        },
        error: function (error) {
            require(['jquery'], function ($) {
                error = error ? error : 'Nenhuma resposta';
                var id = Date.now() / 1000 | 0;
                var msg = '<div style="display:none" id="message-' + id + '" class="message-' + id + ' alert alert-danger fade in alert-dismissable">';
                msg += '<strong>';
                msg += error;
                msg += '<button class="close">×</button>';
                msg += '</strong>';
                msg += '</div>';
                $(msg).prependTo($('.show-messages'));
                $(".message-" + id).slideDown(1000);
                $(".message-" + id).on("click", "button.close", function () {
                    $(this).parent().parent().slideUp(1000);
                });
            });
        },
        success: function (success) {
            require(['jquery'], function ($) {
                success = success ? success : 'Sucesso!';
                var id = Date.now() / 1000 | 0;
                var msg = '<div style="display:none" id="message-' + id + '" class="message-' + id + ' alert alert-success fade in alert-dismissable">';
                msg += '<strong>';
                msg += success;
                msg += '<button class="close">×</button>';
                msg += '</strong>';
                msg += '</div>';
                $(msg).prependTo($('.show-messages'));
                $(".message-" + id).slideDown(1000).delay(3000).slideUp(1000);
                $(".message-" + id).on("click", "button.close", function () {
                    $(this).parent().parent().slideUp(1000);
                });
            });
        }
    };
    core.bind = function (selector) {
        require(['jquery'], function ($) {
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
                    require(['jquery-form-validator'], function () {
                        $.validate({
                            lang: userLanguage,
                            modules: ['security', 'location']
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
                    //core.loadCss('datatables/media/css/jquery.dataTables.min.css');
                    core.dataTables.bind(selector);
                }
            });
        },
        bind: function (table) {
            require(['datatables.net', 'dataTables-bootstrap'], function (dt) {
                $(table).each(function (i) {
                    var e = $(this);
                    e.DataTable();
                    /*
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
                     */
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
        if ($('link [href="' + baseURL + url + '"]').length === 0) {
            document.getElementsByTagName("head")[0].appendChild(link);
        }
    };
    return core;
});
require(['core'], function (core) {
    core.ready();
});
