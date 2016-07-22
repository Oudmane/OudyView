var OudyView = {
    state: null,
    reloadOnClose: false,
    init: function(element) {
        OudyView.modal = UIkit.modal('[oudyview].uk-modal', {center:true});
        OudyView.modal.close = OudyView.modal.hide;
        OudyView.modal.hide = function(force) {
            if(
                !(form = OudyView.modal.dialog.find('form[oudyview-confirm]')).length
                ||
                form.data('serialize') == form.serialize()
                &&
                !form.is('[oudyview-confirm="changed"]')
            )
                OudyView.modal.close(force);
            else
                if(!form.data('confirm') || !form.data('confirm').isActive())
                    form.data('confirm', UIkit.modal.confirm(form.find('[type="oudyview/confirm"]').html(), function() {
                        OudyView.modal.close();
                    }));
                else
                    form.data('confirm').hide();
        };
        OudyView.modal.on({
            'show.uk.modal': function(){
                OudyView.events.show();
            },
            'hide.uk.modal': function(){
                if(!OudyView.forced)
                    OudyView.events.hide();
                if(OudyView.reloadOnClose) {
                    OudyView.reloadOnClose = false;
                    OudyView.events.reloadOnClose();
                }
                OudyView.forced = false;
            }
        });
        $(element).on('click', '[oudyview][href]:not([nov]):internal', function() {
            OudyView.request({
                uri: $(this).URI()
            });
            return false;
        });
        $(element).on('submit', '[oudyview][action]:not([nov]):internal', function() {
            OudyView.request({
                uri: $(this).URI(),
                method: $(this).attr('method'),
                data: $(this).serializeObject()
            });
            return false;
        });
        $(OudyView.modal.dialog).on('click', '[href]:not([nov]):internal', function() {
            OudyView.request({
                uri: $(this).URI()
            });
            return false;
        });
        $(OudyView.modal.dialog).on('submit', '[action]:not([nov]):internal', function() {
            OudyView.request({
                uri: $(this).URI(),
                method: $(this).attr('method'),
                data: $(this).serializeObject()
            });
            return false;
        });
        if(OudyJS) {
            $(OudyView.modal.dialog).on('click', '[href][nov]:not([noj]):internal', function() {
                OudyView.forced = true;
                OudyView.modal.hide();
                OudyJS.request({
                    uri: $(this).URI(),
                    push: true
                });
                return false;
            });
            $(OudyView.modal.dialog).on('submit', '[action][nov]:not([noj]):internal', function() {
                OudyView.forced = true;
                OudyView.modal.hide();
                OudyJS.request({
                    uri: $(this).URI(),
                    method: $(this).attr('method'),
                    data: $(this).serializeObject(),
                    push: false
                });
                return false;
            });
        }
        OudyAPI.callbacks['oudyview'] = this.render;
    },
    request: function(request) {
        this.state = $.extend({}, request);
        request.beforeSend = function(request) {
            OudyView.events.beforeSend(request);
            $(OudyView.modal.dialog).html('<a class="uk-modal-close uk-close"></a><div><div class="uk-margin"><div class="uk-modal-spinner"></div></div>');
            OudyView.modal.show();
        };
        request.interface = 'oudyview';
        OudyAPI.send(request);
    },
    render: function(view) {
        $(OudyView.modal.dialog).html(view);
        OudyView.events.render(view);
        OudyView.modal.resize();
        if((form = OudyView.modal.dialog.find('form[oudyview-confirm]')).length)
            form.data('serialize', form.serialize());
        if(OudyView.modal.dialog.find('[oudyview-confirm="reload"]').length)
            OudyView.reloadOnClose = true;
    },
    events: {
        open: function(event) {},
        close: function(event) {},
        message: function(event) {},
        error: function(event) {},
        beforeSend: function(request) {},
        render: function(view) {},
        show: function(view) {},
        hide: function(view) {},
        reloadOnClose: function() {}
    }
};