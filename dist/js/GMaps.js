define(['GMaps'], function () {
    var GMaps = {};
    GMaps.init = function (key) {
        google.load('maps', '3', {
            other_params: 'key=' + key,
            callback: function () {}
        });
    };
    GMaps.bind = {
        adress_search: function (selector) {
            $(selector).change(function () {
                GMaps.search.adress(this);
            });
        }
    };
    GMaps.form = {
        clear: function (form) {
            $(form).find('#street').val('');
            $(form).find('#country').val('');
            $(form).find('#country-code').val('');
            $(form).find('#country').val('');
            $(form).find('#state').val('');
            $(form).find('#city').val('');
            $(form).find('#neighborhood').val('');
        },
        enable: function (form) {
            $(form).find('#street').prop('readonly', false);
            $(form).find('#country').prop('readonly', false);
            $(form).find('#country-code').prop('readonly', false);
            $(form).find('#country').prop('readonly', false);
            $(form).find('#state').prop('readonly', false);
            $(form).find('#city').prop('readonly', false);
            $(form).find('#neighborhood').prop('readonly', false);
        }
    };
    GMaps.search = {
        adress: function (adress_search) {
            var geocoder = new google.maps.Geocoder();
            var address = $(adress_search).val() + ', Brasil';
            var form = $(adress_search).closest('form');
            geocoder.geocode({'address': address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK && results && results[0] && results[0].address_components) {
                    GMaps.form.clear(form);
                    GMaps.form.enable(form);
                    $.each(results[0].address_components, function (index, value) {
                        if ($.inArray('route', value.types) >= 0) {
                            $(form).find('#street').val(value.long_name).prop('readonly', true);
                        }
                        if ($.inArray('country', value.types) >= 0) {
                            $(form).find('#country').val(value.long_name).prop('readonly', true);
                        }
                        if ($.inArray('country', value.types) >= 0) {
                            $(form).find('#country-code').val(value.short_name).prop('readonly', true);
                            $(form).find('#country').val(value.long_name).prop('readonly', true);
                        }
                        if ($.inArray('administrative_area_level_1', value.types) >= 0) {
                            $(form).find('#state').val(value.short_name).prop('readonly', true);
                        }
                        if ($.inArray('administrative_area_level_2', value.types) >= 0) {
                            $(form).find('#city').val(value.long_name).prop('readonly', true);
                        }
                        if ($.inArray('sublocality_level_1', value.types) >= 0 || $.inArray('administrative_area_level_4', value.types) >= 0) {
                            $(form).find('#neighborhood').val(value.long_name).prop('readonly', true);
                        }
                    });
                } else {
                    requirejs(['core'], function (core) {
                        core.show.error('Geocode was not successful for the following reason: ' + status);
                    });
                }
            });
        }
    }
    return GMaps;
});