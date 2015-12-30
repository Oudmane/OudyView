OudyView = {
    request: function(state) {
        if(!state)
            return;
        request = state;
        request.state = $.extend({}, state);
        request.render = 'view';
        request.beforeSend = function(event) {
            $(OudyView.modal.dialog).html('<a class="uk-modal-close uk-close"></a><div><div class="uk-margin"><div class="uk-modal-spinner"></div></div>');
            OudyView.modal.show();
            OudyView.events.beforeSend(event);
        };
        request.success = function(view) {
            $(OudyView.modal.dialog).html(view);
            OudyView.events.render(view);
        };
        request.complete = function(event) {
            OudyView.events.complete(event);
        };
        OudyAPI.send(request);
    },
    init: function(element) {
        OudyView.modal = UIkit.modal('[oudyview].uk-modal');
        OudyView.modal.on({
            'show.uk.modal': function(){
                OudyView.events.show();
            },
            'hide.uk.modal': function(){
                OudyView.events.hide();
            }
        });
        $(element).on('click', '[oudyview][href]', function() {
            OudyView.request({
                uri: $(this).URI()
            });
            return false;
        });
        $(OudyView.modal.dialog).on('click', '[href]', function() {
            OudyView.request({
                uri: $(this).URI()
            });
            return false;
        });
        $(OudyView.modal.dialog).on('submit', '[action]:not([noj]):internal', function() {
            OudyView.request({
                uri: $(this).URI(),
                method: $(this).attr('method'),
                data: $(this).serialize()
            });
            return false;
        });
    },
    events: {
        beforeSend: function(event){},
        complete: function(event){},
        render: function(view){},
        show: function(){},
        hide: function(){}
    }
};