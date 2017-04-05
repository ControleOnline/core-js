define("core", function () {
    var core = {};
    core.appFiles = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-files'));
    core.appLibs = JSON.parse(document.querySelectorAll('body')[0].getAttribute('data-js-libs'));
    core.userLanguage = document.querySelectorAll('html')[0].getAttribute('lang');
    core.systemVersion = document.querySelectorAll('[system-version]')[0].getAttribute('system-version');
    core.config = function () {
        var config = {
            waitSeconds: 0,
            baseUrl: '/vendor',
            paths: {
                gjsapi: 'https://www.google.com/jsapi' + '?c=' + core.systemVersion
            },
            shim: {
                "jquery": {
                    exports: "$"
                },
                "bootstrap": {
                    require: ["jquery"]
                },
                "jquery.select2": {
                    require: ["jquery"]
                }
            }
        };
        Object.keys(core.appLibs).forEach(function (key) {
            config.paths[key] = core.appLibs[key] + '?v=' + core.systemVersion;
        });
        Object.keys(core.appFiles).forEach(function (key) {
            config.paths[key] = core.appFiles[key] + '.js?v=' + core.systemVersion;
        });
        requirejs.config(config);
    };
    core.guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    core.ready = function () {
        this.config();
        requirejs(['jquery'], function ($) {
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
            $('body').removeAttr('data-js-files data-js-libs');
            core.bootstrap.init();
            core.lazyLoad.init();
            core.ajax.init();
            core.bind();
            Object.keys(core.appFiles).forEach(function (key) {
                requirejs([key], function (appFile) {
                    if (typeof appFile.init === 'function') {
                        appFile.init();
                    }
                });
            });
        }
    };
    core.ajax = {
        init: function () {
            $.ajaxSetup({
                beforeSend: function () {
                    var elem = $('[data-clicked=true]');
                    if ($(elem).attr('data-add')) {
                        $(elem).append(core.show.spin('ajax-spin-add'));
                        $(elem).prop("disabled", true);
                    } else if ($(elem).attr('data-delete')) {
                        $(elem).append(core.show.spin('ajax-spin-delete'));
                        $(elem).prop("disabled", true);
                    } else if ($(elem).attr('data-save')) {
                        $(elem).append(core.show.spin('ajax-spin-save'));
                        $(elem).prop("disabled", true);
                    } else {
                        var loading = '<div id="wait-modal" class="modal fade" tabindex="-1" role="dialog" data-keyboard="false"  data-backdrop="static">';
                        loading += '<div class="loading-dialog">';
                        loading += '<div class="loading-content">';
                        loading += '<div class="loading-header" style="text-align: center">';
                        loading += '</div>';
                        loading += '<div class="loading-body">';
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
                        requirejs(['jquery', 'bootstrap'], function ($) {
                            $('#wait-modal').modal('show');
                        });
                    }
                },
                complete: function (data) {
                    var elem = $('[data-clicked=true]');
                    if ($(elem).attr('data-add')) {
                        $(elem).find('.ajax-spin-add').remove();
                        $(elem).prop("disabled", false);
                    } else if ($(elem).attr('data-delete')) {
                        $(elem).find('.ajax-spin-delete').remove();
                        $(elem).prop("disabled", false);
                    } else if ($(elem).attr('data-save')) {
                        $(elem).find('.ajax-spin-save').remove();
                        $(elem).prop("disabled", false);
                    }
                    requirejs(['jquery', 'bootstrap'], function ($) {
                        $('#wait-modal,#confirm-delete').modal('hide');
                    });
                    core.show.result(data, $(elem));
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
        }
    };
    core.show = {
        spin: function (cssClass) {
            return '<i class="' + cssClass + ' ajax-spin fa fa-spinner fa-spin"></i>';
        },
        result: function (data, e) {
            if (typeof data === 'object') {
                if (data.responseJSON) {
                    var data = JSON.parse(data.responseText);
                    if (data.response && data.response.success) {
                        core.show.success(false, e, data);
                    } else if (data.response && data.response.error) {
                        core.show.error(data.response.error, e);
                    } else {
                        core.show.error(false, e);
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
                    core.show.error((data.response && data.response.error) ? data.response.error : null, e);
                }
            } else {
                core.show.error(false, e);
            }
        },
        error: function (error, e) {
            error = error ? error : 'Nenhuma resposta';
            if (typeof error === 'object') {
                $.each(error, function (key, value) {
                    core.show.error(value.message ? value.message : value);
                });
                return;
            }
            var id = core.guid();
            var msg = '<div style="display:none" id="message-' + id + '" class="message-' + id + ' alert alert-danger fade in alert-dismissable">';
            msg += '<strong>';
            msg += error;
            msg += '<button class="close">×</button>';
            msg += '</strong>';
            msg += '</div>';
            $(msg).prependTo($('.show-messages'));
            $(".message-" + id).slideDown(1000).delay(10000).slideUp(1000, function () {
                $(".message-" + id).remove();
            });
            $(".message-" + id).find(".close").on("click", function () {
                $(".message-" + id).stop(true, true).slideUp(1000, function () {
                    $(".message-" + id).delay(2000).remove();
                });
            });
        },
        success: function (success, e, data) {
            success = success ? success : 'Sucesso!';
            if (typeof success === 'object') {
                $.each(success, function (key, value) {
                    core.show.success(value.message ? value.message : value);
                });
                return;
            }
            var id = core.guid();
            var msg = '<div style="display:none" id="message-' + id + '" class="message-' + id + ' alert alert-success fade in alert-dismissable">';
            msg += '<strong>';
            msg += success;
            msg += '<button class="close">×</button>';
            msg += '</strong>';
            msg += '</div>';
            $(msg).prependTo($('.show-messages'));
            $(".message-" + id).slideDown(1000).delay(3000).slideUp(1000, function () {
                $(".message-" + id).remove();
            });
            $(".message-" + id).find(".close").on("click", function () {
                $(".message-" + id).stop(true, true).slideUp(1000, function () {
                    $(".message-" + id).delay(2000).remove();
                });
            });

            if ($(e).data('clone-field') && $(e).data('clone-target')) {
                var c = $($(e).data('clone-field')).clone();
                if (typeof data === 'object' && typeof data.response === 'object' && typeof data.response.data === 'object') {
                    $.each(data.response.data, function (key, value) {
                        $(c).find('[name="' + key + '"]').attr('value', value);
                    });
                    $.each(data.response.data, function (key, value) {
                        c = $('<div>').append($(c)).html().replace(new RegExp('{' + key + '}', 'g'), value);
                    });
                }
                $($(e).data('clone-target')).append($(c).removeClass('clone').removeClass('hidden').removeAttr('data-clone').hide(function () {
                    core.bind(this);
                    $(this).delay(800).fadeIn();
                }));

            }
            if ($(e).data('success-url')) {
                window.location.href = $(e).data('success-url');
            }

        }
    };
    core.gmaps = {
        init: function (selector) {
            var adress_search = $(selector).find('[data-gmaps="adress-search"]');
            if (adress_search) {
                requirejs(['GMaps', 'gjsapi'], function (GMaps) {
                    if (GMaps) {
                        GMaps.init('AIzaSyDgOkNZJUr66dvx75EQrzpaYZNEaXDNrfo');
                        GMaps.bind.adress_search(adress_search);
                    }
                });
            }
        }
    };
    core.bind = function (selector) {
        requirejs(['jquery-form-validator'], function () {
            selector = selector ? selector : '*';
            core.crud.init.add($(selector).find("[data-add]"));
            core.crud.init.addForm($(selector).find("[data-add-form]"));
            core.crud.init.save($(selector).find("[data-save]"));
            core.crud.init.deleteConfirm($(selector).find("[data-delete-confirm]"));
            core.formValidator.init($(selector).find("[data-validation]").closest('form'));
            //core.inputMask.init.mask($(selector).find("[data-mask]"));
            //core.inputMask.init.maskRegex($(selector).find("[data-mask-regex]"));
            core.dataTables.init($(selector).find('.datatable'));
            core.gmaps.init(selector);
            $(selector).find("*").click(function (e) {
                $("*").removeAttr('data-clicked');
                $(e.target).attr("data-clicked", true);
            });
        });
    };
    core.crud = {
        init: {
            deleteConfirm: function (selector) {
                if ($(selector).length) {
                    $(selector).each(function () {
                        $(this).click(function (e) {
                            e.preventDefault();
                            core.crud.init.deleteModal($(this));
                        });
                    });
                }
            },
            deleteModal: function (selector) {
                if ($(selector).length) {
                    $('#confirm-delete').remove();
                    var delete_modal = '<div class="modal fade" id="confirm-delete" tabindex="-1" role="dialog" aria-hidden="true">';
                    delete_modal += '<div class="modal-dialog">';
                    delete_modal += '<div class="modal-content">';
                    delete_modal += '<div class="modal-header">';
                    delete_modal += $(selector).data('header');
                    delete_modal += '</div>';
                    delete_modal += '<div class="modal-body">';
                    delete_modal += $(selector).data('body');
                    delete_modal += '</div>';
                    delete_modal += '<div class="modal-footer">';
                    delete_modal += '<button type="button" class="btn btn-default" data-dismiss="modal">' + $(selector).data('calcel-name') + '</button>';
                    delete_modal += '<button data-container-remove="' + $(selector).data('container-remove') + '" data-id="' + $(selector).data('id') + '" data-delete="' + $(selector).data('delete-confirm') + '" name="delete-' + $(selector).data('id') + '" id="delete-' + $(selector).data('id') + '" type="button" class="delete btn btn-danger btn-ok">';
                    delete_modal += $(selector).data('delete-name');
                    delete_modal += '</button>';
                    delete_modal += '</div>';
                    delete_modal += '</div>';
                    delete_modal += '</div>';
                    delete_modal += '</div>';
                    $('body').append(delete_modal);
                    core.crud.init.delete($('body').find("[data-delete]"));
                }
            },
            delete: function (selector) {
                if ($(selector).length) {
                    $(selector).each(function () {
                        $(this).click(function (e) {
                            e.preventDefault();
                            setTimeout(function () {
                                $.ajax({
                                    url: $(selector).data('delete'),
                                    data: {
                                        id: $(selector).data('id')
                                    },
                                    method: 'POST',
                                    dataType: 'json',
                                    success: function (data, textStatus, jqXHR) {
                                        if (data.response && data.response.success) {
                                            $('#' + $(selector).data('container-remove') + '-' + $(selector).data('id')).stop(true, true).slideUp(1000, function () {
                                                $(this).remove();
                                            });
                                        }
                                    }
                                });
                            }, 100);
                        });
                    });
                }
            },
            addForm: function (selector) {
                if ($(selector).length) {
                    $(selector).each(function () {
                        var b = $(this);
                        b.click(function (e) {
                            e.preventDefault();
                            setTimeout(function () {
                                $.ajax({
                                    cache: true,
                                    url: $(b).data('add-form'),
                                    context: document.body
                                });
                            }, 100);
                        });
                    });
                }
            },
            add: function (selector) {
                if ($(selector).length) {
                    $(selector).each(function () {
                        $(this).closest('form').submit(function (e) {
                            e.preventDefault();
                            setTimeout(function () {
                                if ($(selector).closest('form').isValid()) {
                                    $.ajax({
                                        url: $(e).attr('action'),
                                        data: $(e).serialize(),
                                        method: 'POST',
                                        dataType: 'json',
                                        success: function (data, textStatus, jqXHR) {
                                            if (data.response && data.response.success) {
                                                $('#modal-new').modal('hide');
                                            }
                                        }
                                    });
                                }
                            }, 100);
                        });
                        $(this).click(function (e) {
                            e.preventDefault();
                            setTimeout(function () {
                                if ($(selector).closest('form').isValid()) {
                                    $.ajax({
                                        url: $(selector).data('add'),
                                        data: $(selector).closest('form').serialize(),
                                        method: 'POST',
                                        dataType: 'json',
                                        success: function (data, textStatus, jqXHR) {
                                            if (data.response && data.response.success) {
                                                $('#modal-new').modal('hide');
                                            }
                                        }
                                    });
                                }
                            }, 100);
                        });
                    });
                }
            },
            save: function (selector) {
                if ($(selector).length) {
                    $(selector).each(function () {
                        $(this).click(function (e) {
                            e.preventDefault();
                            setTimeout(function () {
                                $.ajax({
                                    url: $(selector).data('save'),
                                    method: 'POST',
                                    dataType: 'json',
                                    data: $(selector).closest('form').serialize()
                                });
                            }, 100);
                        });
                    });
                }
            }
        }
    };
    core.formValidator = {
        init: function (selector) {
            if ($(selector).length) {
                requirejs(['jquery', 'jquery-form-validator'], function ($) {
                    core.formValidator.validateForm(selector);
                });
            }
        },
        config: function (form) {
            var config = {
                lang: core.userLanguage,
                modules: ['security', 'location'],
                form: form ? form : false
            };
            return config;
        },
        customValidators: function () {
            $.formUtils.addValidator({
                name: 'user_exists',
                validatorFunction: function (value, $el, config, language, $form) {
                    return true;
//                    var user_exists = $($el).data('user-exists');                                        
//                    return user_exists === 'true' || user_exists === undefined;
                },
                errorMessage: 'User not found',
                errorMessageKey: 'badUserExists'
            });
        },
        validateForm: function (selector) {
            core.formValidator.customValidators();
            var config = core.formValidator.config(selector);
            $.validate(config);
        }
    };
    core.inputMask = {
        init: {
            mask: function (selector) {

                if ($(selector).length) {
                    requirejs(['inputmask', 'jquery.inputmask'], function () {
                        $(selector).each(function () {
                            $(this).inputmask(eval($(this).data('mask')));
                        });
                    });
                }

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
                if ($(selector).length) {
                    requirejs(['inputmask', 'jquery.inputmask', 'inputmask.regex.extensions'], function () {
                        $(selector).each(function () {
                            $(this).inputmask('Regex', eval($(this).data('mask-regex')));
                        });
                    });
                }
            }
        }
    };
    core.bootstrap = {
        init: function () {
            requirejs(['bootstrap']);
        }
    };
    core.lazyLoad = {
        init: function () {
            if ($('[data-ll]').length) {
                requirejs(['lazyLoad'], function (lazyLoad) {
                    lazyLoad.init();                    
                });
            }
        }
    };
    core.dataTables = {
        init: function (selector) {
            if ($(selector).length) {
                core.loadCss('datatables/media/css/dataTables.bootstrap4.min.css');
                core.dataTables.bind(selector);
            }
        },
        bind: function (table) {
            requirejs(['datatables.net', 'dataTables-bootstrap'], function (dt) {
                $(table).each(function (i) {
                    var e = $(this);
//                    e.DataTable({language: {
//                            url: "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Portuguese-Brasil.json"
//                        }});
//                    

                    //https://datatables.net/examples/ajax/custom_data_property.html
                    //https://datatables.net/examples/server_side/custom_vars.html

                    e.DataTable({
                        language: {
                            url: "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Portuguese-Brasil.json"
                        },
                        serverSide: true,
                        ajax: {
                            url: '/assets/teste.json', //e.attr('data-source')
                            //dataSrc: "demo",
//                            data: function (d) {
//                                d.myKey = "myValue";
//                                // d.custom = $('#myInput').val();
//                                // etc
//                            }
                        },
//                        "rowCallback": function (row, data) {
//                            if ($.inArray(data.DT_RowId, selected) !== -1) {
//                                $(row).addClass('selected');
//                            }
//                        }
                    });
                });
            });
        }
    };
    core.loadCss = function (url) {
        var baseURL = requirejs.toUrl('.');
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
requirejs(['core'], function (core) {
    core.ready();
});
