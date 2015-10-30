/* global er */
//# sourceURL=OdaApp.js
// Library of tools for the exemple
/**
 * @author FRO
 * @date 15/05/08
 */

(function() {
    'use strict';

    var
    /* version */
        VERSION = '0.1'
        ;

    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() {
        $.Oda.Event.addListener({name : "oda-fully-loaded", callback : function(e){
            $.Oda.App.startApp();
        }});
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION,

        /**
         * @param {Object} p_params
         * @param p_params.attr
         * @returns {$.Oda.App}
         */
        startApp: function (p_params) {
            try {
                $.Oda.Router.addRoute("home", {
                    "path" : "partials/home.html",
                    "title" : "home.title",
                    "urls" : ["","home"]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        Controler : {
            context : null,
            formOutput : {"cMyVar":"coucou"},
            taskId : 0,
            taskInfos : null,
            processDefinition : null,
            Home: {
                /**
                 * @returns {$.Oda.App.Controler.Home}
                 */
                start: function () {
                    try {
                        $.Oda.App.Controler.taskId = $.Oda.Router.current.args['id'];

                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/task/"+$.Oda.App.Controler.taskId, {functionRetour : function(response){
                            $.Oda.App.Controler.taskInfos = response;
                            var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/process/"+$.Oda.App.Controler.taskInfos.processId, {functionRetour : function(response){
                                $.Oda.App.Controler.processDefinition = response;
                            }}, {});
                        }}, {});

                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/userTask/"+$.Oda.App.Controler.taskId+"/context", {functionRetour : function(response){
                            $.Oda.App.Controler.context = response;
                            $.Oda.Log.trace($.Oda.App.Controler.context);
                        }}, {});

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.Home.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.Home}
                 */
                submitTask : function (p_params) {
                    try {
                        var url = $.Oda.Context.rest+"API/bpm/userTask/"+$.Oda.App.Controler.taskId+"/execution";
                        var call = $.Oda.Interface.callRest(url, {
                            type : 'POST',
                            contentType: "application/json",
                            functionRetour : function(response){
                                $.Oda.Log.trace(response);
                                $.Oda.window.location = $.Oda.Context.host;
                            }
                        }, JSON.stringify($.Oda.App.Controler.formOutput));
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.Home.submitTask : " + er.message);
                        return null;
                    }
                },
            }
        }
    };

    // Initialize
    _init();

})();
