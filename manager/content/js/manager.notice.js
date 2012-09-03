(function($, d, w, K) {

    var kami = w.kami || {};

    kami.reg = function(name) {
        return kami[name] || {}
    }

    $(d).ready(function() {

        if($('#manage-notice').length) {

            (function() {

                var scope = kami.reg('notice');

                scope.path = w.location.href.split("/manager/")[0] + '/manager/';

                scope.tpl = {

                    notice: {

                        tr: juicer([
                            '<tr>',
                                '<td class="center">${id}</td>',
                                '<td>${title}</td>',
                                '<td class="center">${author}</td>',
                                '<td class="center">${create_time}</td>',                                
                                '<td class="center"><a href="#" class="edit">编辑</a></td>',
                                '<td class="center"><a href="#" class="delete">删除</a></td>',
                            '</tr>'
                        ].join(''))

                    }

                };

                scope.fn = {

                    loadData: function(url, params, callback, region) {

                        url = url || scope.path + 'json/notice.asp';
                        url += '?_dc=' + +new Date();
                        params = params || {};
                        callback = callback || scope.fn.render
                        region = region || w;

                        $.getJSON(url, params, function(data) {
                            callback.call(region, data);
                        });

                    },

                    postData: function(url, params, callback, region) {

                        url = url || scope.path + 'do/notice.asp';
                        region = region || w;

                        $.post(url, params, function() {
                            callback.apply(region, arguments);
                        });
                    },

                    render: function(data) {                       

                        var $tbody = $('tbody');

                        $tbody.empty();

                        $.each(data, function() {
                            $tbody.append(scope.tpl.notice.tr.render(this));
                            $tbody.find('tr:last').data('source', this);
                        });

                        $tbody.find('a.edit').click(function(e) {
                            e.preventDefault();
                            scope.fn.editClick.call(this, e);
                        });
                        $tbody.find('a.delete').click(function(e) {
                            e.preventDefault();
                            scope.fn.deleteClick.call(this, e);
                        });

                    },

                    editClick: function() {

                        var $tr = $(this).closest('tr');

                        scope.fn.loadData(false, {edit: 1, id: $tr.data('source').id}, function(data) {
                            $.ajax(scope.path + 'json/notice.asp', {
                                data: {content: 1, id: $tr.data('source').id},
                                success: function(content) {
                                    scope.fn.modal(data, content);
                                }
                            });
                        });

                    },

                    deleteClick: function() {
                        var $tr = $(this).closest('tr');
                        
                        scope.fn.postData(false, {is_del: 1, id: $tr.data('source').id}, function(data) {
                            $('.breadcrumb').find('a.refresh').click();
                        });
                    },

                    modal: function(data, content) {
                        data = $.isArray(data) ? (data[0] || {}) : (data || {})

                        var $modal = $('#notice-modal');

                        $modal.find('#title').val(data.title || '');
                        scope.editor.html(content || '');
                        $modal.find('#id').val(data.id || null);

                        $modal.modal();
                        $('.modal-backdrop').off('click');

                    }
                    
                };

                scope.init = function() {

                    scope.fn.loadData();

                    scope.editor = K.create('#notice-modal #content', {
                        cssPath : 'content/kindeditor/plugins/code/prettify.css',
                        uploadJson : 'content/kindeditor/asp/upload_json.asp',
                        fileManagerJson : 'content/kindeditor/asp/file_manager_json.asp',
                        allowFileManager : true
                    });
                    prettyPrint();

                    $('.modal a.closem').click(function() {
                        $(this).closest('.modal').modal('hide');
                    });

                    $('.modal a.savem').click(function() {
                        var $modal = $(this).closest('.modal'),
                            params = {}, 
                            pass = true;

                        $modal.find('.submitValue').each(function() {
                            if($(this).hasClass('required') && String($(this).val()) === "") {
                                $(this).focus();
                                pass = false;
                                return pass;
                            } else {
                                params[$(this).attr('name')] = $(this).val();
                            }
                        });
                        if(pass) {
                            params.content = scope.editor.html();
                            scope.fn.postData(false, params, function() {
                                $modal.modal('hide');
                            }, this);                            
                        }
                    });

                    $('.modal').on('hidden', function() {
                        $('.breadcrumb').find('a.refresh').click();
                    });

                    $('.breadcrumb').find('a.refresh').click(function(e) {
                        e.preventDefault();
                        scope.fn.loadData();
                    });

                    $('.breadcrumb').find('a.add').click(function(e) {
                        e.preventDefault();
                        var $modal = $('#notice-modal');
                        scope.fn.modal();
                    });

                }

                scope.init();
                
            })();

        }

    });

})(jQuery, document, window, KindEditor);