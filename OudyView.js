var OudyAPI = require('oudyapi'),
    jQuery = require('jquery'),
    formSerializer = require('form-serializer'),
    UIkit = require('uikit-rtl'),
    OudyView,
    OudyJS,
    events = jQuery({});

module.exports = {
    state: null,
    reloadOnClose: false,
    init: function(element) {
        OudyView = this;
        OudyView.modal = UIkit.modal('[oudyview].uk-modal', {center:true});
        OudyView.modal.close = function(force) {
            if (!force && UIkit.support.transition && this.hasTransitioned) {
                var $this = this;
                this.one(UIkit.support.transition.end, function() {
                    $this._hide();
                }).removeClass("uk-open");
            } else {
                this._hide();
            }
            return this;
        };
        OudyView.modal.hide = function(force) {
            if(
                !(form = OudyView.modal.dialog.find('form[oudyview-confirm]')).length
                ||
                form.data('serialize') == form.serialize()
                &&
                !form.is('[oudyview-confirm="changed"]')
            )
                OudyView.modal.close(force);
            else if(!form.data('confirm') || !form.data('confirm').isActive())
                form.data('confirm', UIkit.modal.confirm(form.find('[type="oudyview/confirm"]').html() || OudyView.strings.confirm.message, function() {
                    OudyView.modal.close(force);
                }));
            else if(form.data('confirm'))
                form.data('confirm').hide();
            return this;
        };
        OudyView.modal.on({
            'show.uk.modal': function(){
                OudyView.trigger('show');
            },
            'hide.uk.modal': function(){
                if(!OudyView.forced)
                    OudyView.trigger('hide');
                if(OudyView.reloadOnClose) {
                    OudyView.reloadOnClose = false;
                    OudyView.trigger('reload');
                }
                OudyView.forced = false;
            }
        });
        jQuery(element).on('click', '[oudyview][href]:not([nov]):internal', function() {
            OudyView.request({
                uri: jQuery(this).URI()
            });
            return false;
        });
        jQuery(element).on('submit', '[oudyview][action]:not([nov]):internal', function() {
            OudyView.request({
                uri: jQuery(this).URI(),
                method: jQuery(this).attr('method'),
                data: jQuery(this).serializeObject()
            });
            return false;
        });
        jQuery(OudyView.modal.dialog).on('click', '[href]:not([nov]):internal', function() {
            OudyView.request({
                uri: jQuery(this).URI()
            });
            return false;
        });
        jQuery(OudyView.modal.dialog).on('submit', '[action]:not([nov]):internal', function() {
            OudyView.request({
                uri: jQuery(this).URI(),
                method: jQuery(this).attr('method'),
                data: jQuery(this).serializeObject()
            });
            return false;
        });
        if(require.cache[require.resolveWeak('oudyjs')]) {
            var OudyJS = require('oudyjs');
            jQuery(OudyView.modal.dialog).on('click', '[href][nov]:not([noj]):internal', function() {
                OudyView.forced = true;
                OudyView.modal.hide();
                OudyJS.request({
                    uri: jQuery(this).URI(),
                    push: true
                });
                return false;
            });
            jQuery(OudyView.modal.dialog).on('submit', '[action][nov]:not([noj]):internal', function() {
                OudyView.forced = true;
                OudyView.modal.hide();
                OudyJS.request({
                    uri: jQuery(this).URI(),
                    method: jQuery(this).attr('method'),
                    data: jQuery(this).serializeObject(),
                    push: false
                });
                return false;
            });
        }
        OudyAPI.on('before:oudyview', function(event, request) {
            OudyView.trigger('before', request);
            jQuery(OudyView.modal.dialog).html('<a class="uk-modal-close uk-close"></a><div><div class="uk-margin"><div class="uk-modal-spinner"></div></div></div>');
            OudyView.modal.show();
        });
        OudyAPI.on('success:oudyview', function(event, response) {
            OudyView.trigger('success', response);
            OudyView.render(response.response);
        });
        OudyAPI.on('complete:oudyview', function(event, response) {
            OudyView.trigger('complete', response);
        });
    },
    request: function(request) {
        this.state = jQuery.extend({}, request);
        request.interface = 'oudyview';
        OudyAPI.send(request);
    },
    render: function(view) {
        jQuery(OudyView.modal.dialog).html(view);
        OudyView.modal.resize();
        if((form = OudyView.modal.dialog.find('form[oudyview-confirm]')).length)
            form.data('serialize', form.serialize());
        if(OudyView.modal.dialog.find('[oudyview-confirm="reload"]').length)
            OudyView.reloadOnClose = true;
        OudyView.trigger('render', view);
    },
    strings: {
        confirm: {
            message: '<h1>You\'ll lose  all changes</h1><p>Are you sure you want to close ?</p>'
        }
    },
    on: events.on.bind(events),
    one: events.one.bind(events),
    trigger: events.trigger.bind(events)
};