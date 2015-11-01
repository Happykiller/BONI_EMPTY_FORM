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
        $.Oda.Context.host = $.Oda.Context.window.location.origin + '/';
        $.Oda.Context.rest = $.Oda.Context.host + $.Oda.Context.appBonitaName;
        $.Oda.Context.resources = $.Oda.Context.host+"resources/";

        $.Oda.Context.modeInterface = ["ajax","mokup"];

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
                $.Oda.Router.addMiddleWare("boniForm",function() {
                    $.Oda.Log.debug("MiddleWares : boniForm");

                    $.Oda.App.Controler.taskId = $.Oda.Router.current.args['id'];

                    if($.Oda.App.Controler.taskId===0 || $.Oda.App.Controler.taskId === undefined){
                        $.Oda.Router.routerExit = true;
                        var msg = $.Oda.I8n.get('boniSystem','idMissingForForm');
                        $.Oda.Log.error(msg);
                        $.Oda.Display.Notification.error(msg);
                    }else{
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/userTask/"+$.Oda.App.Controler.taskId+"/context", {functionRetour : function(response){
                            $.Oda.App.Controler.context = response;
                            var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/task/"+$.Oda.App.Controler.taskId, {functionRetour : function(response){
                                $.Oda.App.Controler.taskInfos = response;
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/process/"+$.Oda.App.Controler.taskInfos.processId, {functionRetour : function(response){
                                    $.Oda.App.Controler.processDefinition = response;
                                    $.Oda.Log.info("Bonita Form ready.");
                                    $.Oda.Event.send({name:"boniForm-ready", data : {}});
                                }}, {});
                            }}, {});
                        }}, {});
                    }
                });

                $.Oda.Router.addRoute("home", {
                    "path" : "partials/home.html",
                    "title" : "home.title",
                    "middleWares" : ["boniForm"],
                    "urls" : ["","home"]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        BonitaBPM : {
            /**
             * @returns {$.Oda.App.BonitaBPM}
             */
            submitTask : function () {
                try {
                    var url = $.Oda.Context.rest+"API/bpm/userTask/"+$.Oda.App.Controler.taskId+"/execution";
                    var call = $.Oda.Interface.callRest(url, {
                        type : 'POST',
                        contentType: "application/json",
                        functionRetour : function(response){
                            $.Oda.App.BonitaBPM.goNextTask();
                        }
                    }, JSON.stringify($.Oda.App.Controler.formOutput));
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.App.BonitaBPM.submitTask : " + er.message);
                    return null;
                }
            },
            /**
             * @returns {$.Oda.App.BonitaBPM}
             */
            goNextTask: function () {
                try {
                    var processId = "parentCaseId="+$.Oda.App.Controler.taskInfos.caseId;
                    var input = { "f" : processId };
                    var call = $.Oda.Interface.callRest($.Oda.Context.rest+"API/bpm/activity", {functionRetour : function(response){
                        var url = $.Oda.Context.host + $.Oda.Context.appBonitaName;
                        if(response.length>0){
                            $.each( response, function( index, task ) {
                                if((task.id !== $.Oda.App.Controler.taskId)&&(task.state==="ready")){
                                    url = $.Oda.Context.host + $.Oda.Context.appBonitaName + "portal/form/taskInstance/" + task.id;
                                    $.Oda.Context.window.location = url;
                                }else{
                                    if((task.id !== $.Oda.App.Controler.taskId)&&(task.state==="initializing")){
                                        setTimeout(function(){
                                            $.Oda.App.BonitaBPM.goNextTask();
                                        }, 1000);
                                    }else {
                                        $.Oda.Context.window.location = url;
                                    }
                                }
                            });
                        }else{
                            $.Oda.Context.window.location = url;
                        }
                    }}, input);

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.App.BonitaBPM.goNextTask : " + er.message);
                    return null;
                }
            }
        },

        Controler : {
            context : null,
            formOutput : {"ctrl":"ctrl"},
            taskId : 0,
            taskInfos : null,
            processDefinition : null,
            Home: {
                /**
                 * @returns {$.Oda.App.Controler.Home}
                 */
                start: function () {
                    try {
                        $.Oda.Event.addListener({name : "boniForm-ready", callback : function(e){
                            $.Oda.App.Controler.Home.startForm();
                        }});

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.Home.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controler.Home}
                 */
                startForm: function (p_params) {
                    try {
                        $.Oda.Log.trace('Hello taskId : '+$.Oda.App.Controler.taskId);

                        $.Oda.Scope.Gardian.add({
                            id : "gardianSelect3",
                            listElt : ["select1", "select2"],
                            function : function(params){
                                if( ($("#select1").data("isOk")) && ($("#select2").data("isOk")) ){
                                    $('#select3')
                                        .find('option')
                                        .remove()
                                        .end()
                                        .append('<option value="">'+ $.Oda.I8n.getByString('oda-main.select-default')+'</option>')
                                        .append('<option value="'+$("#select1").val()+'">'+$("#select1").val()+'</option>')
                                        .append('<option value="'+$("#select2").val()+'">'+$("#select2").val()+'</option>')
                                        .val('')
                                    ;
                                }else{
                                    $('#select3')
                                        .find('option')
                                        .remove()
                                        .end()
                                        .append('<option value="">'+ $.Oda.I8n.getByString('oda-main.select-default')+'</option>')
                                        .val('')
                                    ;
                                }
                                $.Oda.Scope.checkInputSelect({elt:$("#select3")});
                            }
                        });

                        $.Oda.Scope.Gardian.add({
                            id : "gardianSelect1",
                            listElt : ["select1"],
                            function : function(params){
                                $('#select2')
                                    .val('')
                                ;
                                $.Oda.Scope.checkInputSelect({elt:$("#select2")});
                                $('#select3')
                                    .find('option')
                                    .remove()
                                    .end()
                                    .append('<option value="">'+ $.Oda.I8n.getByString('oda-main.select-default')+'</option>')
                                    .val('')
                                ;
                                $.Oda.Scope.checkInputSelect({elt:$("#select3")});
                            }
                        });

                        $.Oda.Scope.Gardian.add({
                            id : "gardianSubmit",
                            listElt : ["select1","select2","select3"],
                            function : function(params){
                                $.Oda.App.Controler.formOutput.select1 = $("#select1").val();
                                $.Oda.App.Controler.formOutput.select2 = $("#select2").val();
                                $.Oda.App.Controler.formOutput.select3 = $("#select3").val();
                                $('#echo').html(JSON.stringify($.Oda.App.Controler.formOutput));
                                if( ($("#select1").data("isOk")) && ($("#select2").data("isOk")) && ($("#select3").data("isOk")) ){
                                    $("#submit").removeClass("disabled");
                                    $("#submit").removeAttr("disabled");
                                }else{
                                    $("#submit").addClass("disabled");
                                    $("#submit").attr("disabled", true);
                                }
                            }
                        });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.Home.startForm : " + er.message);
                        return null;
                    }
                }
            }
        }
    };

    // Initialize
    _init();

})();