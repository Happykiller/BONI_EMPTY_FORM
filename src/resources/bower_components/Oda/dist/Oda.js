/* global er */
// Library of tools for the framework Oda

/**
 * @author FRO
 * @date 2015-07-12
 *
 * If you want to define the modeExecute
 * ?modeExecution = full, app, or mini
 *
 * events :
 * oda-fully-loaded : Oda is ready
 * oda-notification-flash : the system want notify
 * oda-gapi-loaded : When Gapi is ready
 *
 * TODO : Ajouter une option de supression de cache Oda dans le profile
 *
 */
(function() {
    jQuery.fn.exists = function(){return this.length>0;};

    'use strict';

    var
    /* version */
        VERSION = '0.150625'
        ;

    $.Oda = {
        /* Version number */
        version: VERSION,

        Color : {
            INFO : "#5882FA",
            WARNING : "#f7931e",
            ERROR : "#B9121B",
            SUCCESS : "#AEEE00"
        },

        Session : {
            "code_user" : "",
            "key" : "",
            "userInfo" : {
                "locale" : "fr",
                "firstName" : "",
                "lastName" : "",
                "mail" : "",
                "profile" : 0,
                "profileLabel" : "",
                "showTooltip" : 0
            }
        },

        Context : {
            /*
             ["cache","ajax","mokup","offline"]
             */
            modeInterface : ["cache","ajax","mokup","offline"],
            ModeExecution : {
                init : false,
                scene : false,
                notification : false,
                message : false,
                rooter : false,
                app : false
            },
            debug : false,
            vendorName : "bower_components",
            rootPath : "",
            projectLabel : "Project",
            mainDiv : "oda-content",
            host : "",
            rest : "",
            resources : "resources/",
            window : window,
            console : console,
            startDate : false
        },

        Regexs : {
            mail : "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|fr)\\b",
            login : "^[a-zA-Z0-9]{3,}$",
            pass : "^[a-zA-Z0-9]{4,}$",
            fristName : "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,}$",
            lastName : "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,}$",
            noInjection : "^(?!.*?function())",
        },

        Cache : {
            config : [],
            cache : [],
            /**
             * @param {object} p_params
             * @param p_params.key
             * @param p_params.attrs
             * @param p_params.datas
             * @returns {$.Oda.Cache}
             */
            save: function (p_params) {
                try {
                    if($.Oda.Session.code_user !== "") {
                        var founded = false;
                        for (var indice in $.Oda.Cache.config) {
                            var elt = $.Oda.Cache.config[indice];
                            if (p_params.key.includes(elt.key)) {
                                founded = true;
                                break;
                            }
                        }

                        if (founded) {
                            $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);

                            var d = new Date();
                            var date = d.getTime();

                            p_params.recordDate = date;

                            for (var indice in $.Oda.Cache.cache) {
                                var elt = $.Oda.Cache.cache[indice];
                                if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs, p_params.attrs))) {
                                    $.Oda.Cache.cache.splice(indice, 1);
                                }
                            }
                            $.Oda.Cache.cache.push(p_params);
                            $.Oda.Storage.set("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);
                            return this;
                        }else{
                            return this;
                        }
                    }else{
                        return this;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.save : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} p_params
             * @param p_params.key
             * @param p_params.attrs
             * @param p_params.demande
             * @returns {$.Oda.Cache}
             */
            load: function (p_params) {
                try {
                    if($.Oda.Session.code_user !== "") {

                        var founded = false;
                        var eltConfig;
                        for (var indice in $.Oda.Cache.config) {
                            eltConfig = $.Oda.Cache.config[indice];
                            if (p_params.key.includes(eltConfig.key)) {
                                if (eltConfig.hasOwnProperty("onDemande") && (eltConfig.onDemande) && p_params.demande) {
                                    founded = true;
                                    break;
                                } else if ((eltConfig.hasOwnProperty("onDemande") && (eltConfig.onDemande === false)) || (!eltConfig.hasOwnProperty("onDemande"))) {
                                    founded = true;
                                    break;
                                }
                            }
                        }

                        if (founded) {
                            $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);
                            for (var indice in $.Oda.Cache.cache) {
                                var elt = $.Oda.Cache.cache[indice];
                                if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs, p_params.attrs))) {
                                    if (eltConfig.ttl !== 0) {
                                        var d = new Date();
                                        var date = d.getTime();

                                        var dateTimeOut = elt.recordDate + (eltConfig.ttl * 1000);

                                        if (date > dateTimeOut) {
                                            return false;
                                        } else {
                                            return elt;
                                        }
                                    } else {
                                        return elt;
                                    }
                                }
                            }
                        }
                        return false;
                    }else{
                        return false;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.load : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} p_params
             * @param p_params.key
             * @param p_params.attrs
             * @returns {$.Oda.Cache}
             */
            loadWithOutTtl: function (p_params) {
                try {
                    if($.Oda.Session.code_user !== "") {

                        var founded = false;
                        for (var indice in $.Oda.Cache.config) {
                            var elt = $.Oda.Cache.config[indice];
                            if (p_params.key.includes(elt.key)) {
                                founded = true;
                                break;
                            }
                        }

                        if (founded) {
                            $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);
                            for (var indice in $.Oda.Cache.cache) {
                                var elt = $.Oda.Cache.cache[indice];
                                if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs, p_params.attrs))) {
                                    return elt;
                                }
                            }
                        }
                        return false;
                    }else{
                        return false;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.loadWithOutTtl : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} p_params
             * @param p_params.key
             * @param p_params.attrs
             * @returns {$.Oda.Cache}
             */
            remove: function (p_params) {
                try {
                    $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-"+$.Oda.Session.code_user, $.Oda.Cache.cache);

                    for(var indice in $.Oda.Cache.cache){
                        var elt = $.Oda.Cache.cache[indice];
                        if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs,p_params.attrs))){
                            $.Oda.Cache.cache.splice(indice,1);
                            break;
                        }
                    }
                    $.Oda.Storage.set("ODA-CACHE-"+$.Oda.Session.code_user,$.Oda.Cache.cache);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.remove : " + er.message);
                    return null;
                }
            },
            /**
             * @returns {$.Oda.Cache}
             */
            clean: function () {
                try {
                    if($.Oda.Session.code_user !== "") {
                        $.Oda.Storage.remove("ODA-CACHE-"+$.Oda.Session.code_user);
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.clean : " + er.message);
                    return null;
                }
            },
            /**
             * @returns {$.Oda.Cache}
             */
            cleanAll: function () {
                try {
                    var listCache = $.Oda.Storage.getIndex("ODA-CACHE");
                    for(var indice in listCache){
                        var key = $.Oda.Tooling.replaceAll({str : listCache[indice], find : $.Oda.Storage.storageKey, by : ''});
                        $.Oda.Storage.remove(key);
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.cleanAll : " + er.message);
                    return null;
                }
            }
        },

        Loader : {
            Status : {
                init : 0,
                loading : 1,
                loaded : 2,
                fail : 3
            },
            iterator : 0,
            buffer : [],
            eltAlreadyLoad : {},
            /**
             *
             * @param {Object} params
             * @param {Object} params.depends
             * @param {Object} params.functionFeedback
             * @param {Object} params.functionFeedbackParams
             * @returns {Boolean}
             */
            load : function(params){
                try {
                    var eltLoader = params;
                    eltLoader.id = $.Oda.Loader.iterator;

                    for(var indiceGrp in eltLoader.depends){
                        var grp = eltLoader.depends[indiceGrp];
                        grp.state = $.Oda.Loader.Status.init;
                        for(var indiceElt in grp.list){
                            var elt = grp.list[indiceElt];
                            elt.state = $.Oda.Loader.Status.init;
                        }
                    }

                    $.Oda.Loader.buffer.push(eltLoader);
                    $.Oda.Loader.iterator++;

                    $.Oda.Loader.loading({id : eltLoader.id});

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.load : " + er.message);
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.id
             * @returns {$.Oda.Loader}
             */
            loading: function (p_params) {
                try {
                    var eltLoader = $.Oda.Loader.buffer[p_params.id];

                    for (var indiceGrp in eltLoader.depends) {
                        var grp = eltLoader.depends[indiceGrp];
                        if((grp.state === $.Oda.Loader.Status.init)){
                            $.Oda.Log.debug("Dependency group loading : "+grp.name);
                            grp.state = $.Oda.Loader.Status.loading;
                            $.Oda.Event.addListener({name : "oda-loader-"+p_params.id+"-"+grp.name, callback : function(e){
                                $.Oda.Loader.loading({id : e.detail.idLoader});
                                return this;
                            }
                            });
                            $.Oda.Loader.loadingGrp({idLoader : p_params.id, grp : grp});
                            return this;
                        }
                    }

                    if(eltLoader.hasOwnProperty("functionFeedback")){
                        if(eltLoader.hasOwnProperty("functionFeedbackParams")) {
                            eltLoader.functionFeedback(eltLoader.functionFeedbackParams);
                        }else{
                            eltLoader.functionFeedback();
                        }
                    }

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.loading : " + er.message);
                    return null;
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.idLoader
             * @param p_params.grp
             * @returns {$.Oda.Loader}
             */
            loadingGrp: function (p_params) {
                try {
                    var statutGrp = $.Oda.Loader.Status.loaded;
                    //lunch
                    for(var indiceElt in p_params.grp.list){
                        var elt = p_params.grp.list[indiceElt];
                        if(elt.state === $.Oda.Loader.Status.init){
                            $.Oda.Log.debug("Dependency element loading : "+ elt.elt + " of grp : "+p_params.grp.name);
                            elt.state = $.Oda.Loader.Status.loading;
                            $.Oda.Event.addListener({name : "oda-loader-"+p_params.idLoader+"-"+p_params.grp.name+"-"+elt.elt, callback : function(e){
                                $.Oda.Loader.loadingGrp({idLoader : e.detail.idLoader, grp : e.detail.grp});
                                return this;
                            }
                            });
                            $.Oda.Loader.loadingElt({idLoader:p_params.idLoader,grp:p_params.grp,elt:elt});
                            if(p_params.grp.ordered){
                                return this;
                            }
                        }else{
                            if(elt.state === $.Oda.Loader.Status.fail){
                                statutGrp = $.Oda.Loader.Status.fail;
                            }
                        }
                    }
                    //case all start but not all finish
                    if(!p_params.grp.ordered){
                        for(var indiceElt in p_params.grp.list) {
                            var elt = p_params.grp.list[indiceElt];
                            if (elt.state === $.Oda.Loader.Status.loading) {
                                return this;
                            }
                        }
                    }
                    if(p_params.grp.state !== $.Oda.Loader.Status.loaded) {
                        p_params.grp.state = statutGrp;
                        $.Oda.Log.debug("Dependency group loaded : " + p_params.grp.name + " with code : " + p_params.grp.state);
                        $.Oda.Event.send({
                            name: "oda-loader-" + p_params.idLoader + "-" + p_params.grp.name, data: {
                                grpName: p_params.grp.name,
                                idLoader: p_params.idLoader,
                                grpState: statutGrp
                            }
                        });
                    }

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.loadingGrp : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} p_params
             * @param p_params.idLoader
             * @param p_params.grp
             * @param p_params.elt
             * @returns {$.Oda.Loader}
             */
            loadingElt: function (p_params) {
                try {
                    if(p_params.elt.state !== $.Oda.Loader.Status.loaded){
                        if(!p_params.elt.hasOwnProperty("force")){
                            p_params.elt.force = false;
                        }
                        if(($.Oda.Loader.eltAlreadyLoad.hasOwnProperty(p_params.elt.elt)) &&
                            ($.Oda.Loader.eltAlreadyLoad[p_params.elt.elt] === $.Oda.Loader.Status.loaded) &&
                            (p_params.elt.force === false))
                        {
                            p_params.elt.state = $.Oda.Loader.Status.loaded;
                            $.Oda.Log.debug("Dependency element already loaded : "+ p_params.elt.elt + " of grp : "+ p_params.grp.name + " of  with code : " + p_params.elt.state);
                            $.Oda.Event.send({
                                name: "oda-loader-" + p_params.idLoader + "-" + p_params.grp.name + "-" + p_params.elt.elt,
                                data: {
                                    grp : p_params.grp,
                                    idLoader : p_params.idLoader
                                }
                            });
                        }else{
                            switch(p_params.elt.type) {
                                case "css":
                                    $('<link/>', {
                                        rel: 'stylesheet',
                                        type: 'text/css',
                                        href: p_params.elt.elt
                                    }).appendTo('head');

                                    $.Oda.Loader.eltAlreadyLoad[p_params.elt.elt] = $.Oda.Loader.Status.loaded;
                                    p_params.elt.state = $.Oda.Loader.Status.loaded;
                                    $.Oda.Log.debug("Dependency element loaded : "+ p_params.elt.elt + " of grp : "+ p_params.grp.name + " of  with code : " + p_params.elt.state);
                                    $.Oda.Event.send({
                                        name: "oda-loader-" + p_params.idLoader + "-" + p_params.grp.name + "-" + p_params.elt.elt,
                                        data: {
                                            grp : p_params.grp,
                                            idLoader : p_params.idLoader
                                        }
                                    });

                                    break;
                                case "script":
                                case "json":
                                case "html" :
                                    $.ajax({
                                        url: p_params.elt.elt,
                                        dataType: p_params.elt.type,
                                        context : {"params" : p_params},
                                        success: function( data, textStatus, jqxhr) {
                                            var params = $(this)[0].params;
                                            if(params.elt.hasOwnProperty("target")){
                                                params.elt.target(data);
                                            }
                                            $.Oda.Loader.eltAlreadyLoad[params.elt.elt] = $.Oda.Loader.Status.loaded;
                                            params.elt.state = $.Oda.Loader.Status.loaded;
                                            $.Oda.Log.debug("Dependency element loaded : "+ params.elt.elt + " of grp : "+ params.grp.name + " of  with code : " + params.elt.state);
                                            $.Oda.Event.send({
                                                name: "oda-loader-" + params.idLoader + "-" + params.grp.name + "-" + params.elt.elt,
                                                data: {
                                                    grp : params.grp,
                                                    idLoader : params.idLoader
                                                }
                                            });
                                        },
                                        error : function( jqxhr, settings, exception ) {
                                            var params = $(this)[0].params;
                                            $.Oda.Loader.eltAlreadyLoad[params.elt.elt] = $.Oda.Loader.Status.fail;
                                            params.elt.state = $.Oda.Loader.Status.fail;
                                            $.Oda.Log.debug("Dependency element fail : "+ params.elt.elt + " of grp : "+ params.grp.name + " of  with code : " + params.elt.state);
                                            $.Oda.Event.send({
                                                name: "oda-loader-" + params.idLoader + "-" + params.grp.name + "-" + params.elt.elt,
                                                data: {
                                                    grp : params.grp,
                                                    idLoader : params.idLoader
                                                }
                                            });
                                        }
                                    });
                                    break;
                                default:
                                    $.Oda.Log.debug( "Type unknown for : "+p_params.elt.elt+"." );
                            }
                        }
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.loadingElt : " + er.message);
                    return null;
                }
            },
        },

        init : function(){
            try {
                $.Oda.Session.userInfo.locale = $.Oda.Tooling.getLangBrowser();

                var listDepends = [
                    {"name" : "library" , ordered : false, "list" : [
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/i8n/i8n.json", "type" : "json", "target" : function(p_json){$.Oda.I8n.datas = $.Oda.I8n.datas.concat(p_json);}},
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/css/css.css", "type" : "css" },
                        { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/templates/Oda.html", "type": "html", target : function(data){ $( "body" ).append(data); }}

                    ]}
                ];

                if($.Oda.Tooling.isInArray("mokup",$.Oda.Context.modeInterface)){
                    var listDependsMokup = [
                        {"name" : "mokup" , ordered : false, "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/mokup/mokup.json", "type" : "json", "target" : function(p_json){$.Oda.MokUp.mokup = $.Oda.MokUp.mokup.concat(p_json);}}
                        ]}
                    ];
                    listDepends = listDepends.concat(listDependsMokup);
                }

                if($.Oda.Tooling.isInArray("cache",$.Oda.Context.modeInterface)){
                    var listDependsCache = [
                        {"name" : "cache" , ordered : false, "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/cache/cache.json", "type" : "json", "target" : function(p_json){$.Oda.Cache.config = $.Oda.Cache.config.concat(p_json);}}
                        ]}
                    ];
                    listDepends = listDepends.concat(listDependsCache);
                }

                if($.Oda.Context.ModeExecution.app){
                    var listDependsApp = [
                        {"name": "app", ordered: false, "list": [
                            { "elt" : $.Oda.Context.rootPath + "config/config.js", "type" : "script" },
                            { "elt" : $.Oda.Context.rootPath + "css/css.css", "type" : "css" },
                            { "elt" : $.Oda.Context.rootPath + "i8n/i8n.json", "type" : "json", "target" : function(p_json){$.Oda.I8n.datas = $.Oda.I8n.datas.concat(p_json);}},
                            { "elt" : $.Oda.Context.rootPath + "js/OdaApp.js", "type": "script"}
                        ]}
                    ];

                    if($.Oda.Tooling.isInArray("mokup",$.Oda.Context.modeInterface)){
                        var listDependsMokupApp = [
                            {"name" : "mokupApp" , ordered : false, "list" : [
                                { "elt" : $.Oda.Context.rootPath + "mokup/mokup.json", "type" : "json", "target" : function(p_json){$.Oda.MokUp.mokup = $.Oda.MokUp.mokup.concat(p_json);}}
                            ]}
                        ];
                        listDepends = listDepends.concat(listDependsMokupApp);
                    }

                    if($.Oda.Tooling.isInArray("cache",$.Oda.Context.modeInterface)){
                        var listDependsCacheApp = [
                            {"name" : "cacheApp" , ordered : false, "list" : [
                                { "elt" : $.Oda.Context.rootPath + "cache/cache.json", "type" : "json", "target" : function(p_json){$.Oda.Cache.config = $.Oda.Cache.config.concat(p_json);}}
                            ]}
                        ];
                        listDepends = listDepends.concat(listDependsCacheApp);
                    }

                    listDepends = listDepends.concat(listDependsApp);
                }

                if($.Oda.Context.ModeExecution.scene){

                    $.Oda.Router.routesAllowedDefault = ["","home","contact","forgot","subscrib","profile"],
                        $.Oda.Router.routesAllowed = $.Oda.Router.routesAllowedDefault.slice(0);

                    $.Oda.Router.addMiddleWare("support",function() {
                        $.Oda.Log.debug("MiddleWares : support");
                        var tabInput = { param_name : "maintenance" };
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getParam.php", {functionRetour : function(data){
                            try{
                                var maintenance = data.data.leParametre.param_value;

                                if (maintenance === "1") {
                                    $.Oda.Router.routerExit = true;
                                    $.Oda.Router.routes.support.go();
                                }
                            }catch (e){
                                $.Oda.Router.routerExit = true;
                                $.Oda.Router.routes.support.go();
                            }
                        }}, tabInput);
                    });


                    $.Oda.Router.addMiddleWare("auth", function() {
                        $.Oda.Log.debug("MiddleWares : auth");

                        if (($.Oda.Session.hasOwnProperty("code_user")) && ($.Oda.Session.code_user !== "")) {
                            if ($.Oda.Tooling.isInArray($.Oda.Router.current.route, $.Oda.Router.routesAllowed)) {
                                var tabInput = {
                                    "code_user": $.Oda.Session.code_user,
                                    "key": $.Oda.Session.key
                                };
                                var retour = $.Oda.Interface.callRest($.Oda.Context.rest + "vendor/happykiller/oda/resources/phpsql/checkSession.php", {functionRetour : function(data){
                                    if (data.data) {
                                    } else {
                                        $.Oda.Router.routerExit = true;
                                        $.Oda.Security.logout();
                                    }
                                }}, tabInput);
                            } else {
                                $.Oda.Log.error("MiddleWares auth : route not allowed "+$.Oda.Router.current.route);
                                $.Oda.Router.routerExit = true;
                                $.Oda.Security.logout();
                            }
                        } else {
                            var session = $.Oda.Storage.get("ODA-SESSION");

                            if (session !== null) {
                                $.Oda.Session = session;

                                var tabInput = {
                                    "code_user": session.code_user,
                                    "key": session.key
                                };
                                var retour = $.Oda.Interface.callRest($.Oda.Context.rest + "vendor/happykiller/oda/resources/phpsql/checkSession.php", {functionRetour : function(data){
                                    if (data.data) {
                                        $.Oda.Security.loadRight();
                                        if (!$.Oda.Tooling.isInArray($.Oda.Router.current.route, $.Oda.Router.routesAllowed)) {
                                            $.Oda.Router.routerExit = true;
                                            $.Oda.Security.logout();
                                        }
                                    } else {
                                        $.Oda.Router.routerExit = true;
                                        $.Oda.Security.logout();
                                    }
                                }}, tabInput);
                            } else {
                                var params = $.Oda.Router.current.args;
                                if ((params.hasOwnProperty("getUser")) && (params.hasOwnProperty("getPass"))) {
                                    var auth = $.Oda.Security.auth({
                                        "login": params.getUser,
                                        "mdp": params.getPass,
                                        "reload": false
                                    });
                                    if (auth) {
                                        if (!$.Oda.Tooling.isInArray($.Oda.Router.current.route, $.Oda.Router.routesAllowed)) {
                                            $.Oda.Router.routerExit = true;
                                            $.Oda.Security.logout();
                                        }
                                    } else {
                                        $.Oda.Router.routerExit = true;
                                        $.Oda.Security.logout();
                                    }
                                } else {
                                    $.Oda.Router.routerExit = true;
                                    $.Oda.Security.logout();
                                }
                            }
                        }
                    });

                    $.Oda.Router.addDependencies("hightcharts", {
                        ordered : false,
                        "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/highcharts-release/highcharts.js", "type" : "script"}
                        ]
                    });

                    $.Oda.Router.addDependencies("dataTables", {
                        ordered : false,
                        "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/datatables/media/js/jquery.dataTables.min.js", "type" : "script"},
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/css/dataTables.bootstrap.css", "type" : "css"},
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/js/dataTables/dataTables.bootstrap.js", "type" : "script"}
                        ]
                    });

                    $.Oda.Router.addDependencies("ckeditor", {
                        ordered : false,
                        "list" : [
                            { "elt" : "//cdn.ckeditor.com/4.4.7/standard/ckeditor.js", "type" : "script"}
                        ]
                    });

                    $.Oda.Router.addRoute("auth", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/auth.html",
                        "title" : "oda-main.authentification",
                        "urls" : ["auth"],
                        "middleWares" : ["support"],
                        "system" : true
                    });

                    $.Oda.Router.addRoute("support", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/support.html",
                        "title" : "oda-main.support-title",
                        "urls" : ["support"],
                        "system" : true
                    });

                    $.Oda.Router.addRoute("404", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/404.html",
                        "title" : "oda-main.404-title",
                        "urls" : ["404"],
                        "system" : true
                    });

                    $.Oda.Router.addRoute("contact", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/contact.html",
                        "title" : "oda-main.contact",
                        "urls" : ["contact"],
                        "middleWares" : ["support"]
                    });

                    $.Oda.Router.addRoute("forgot", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/forgot.html",
                        "title" : "oda-main.forgot-title",
                        "urls" : ["forgot"],
                        "middleWares" : ["support"]
                    });

                    $.Oda.Router.addRoute("subscrib", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/subscrib.html",
                        "title" : "oda-main.subscrib-title",
                        "urls" : ["subscrib"],
                        "middleWares" : ["support"]
                    });

                    $.Oda.Router.addRoute("home", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/home.html",
                        "title" : "oda-main.home-title",
                        "urls" : ["","home"],
                        "middleWares" : ["support", "auth"]
                    });

                    $.Oda.Router.addRoute("profile", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/profile.html",
                        "title" : "oda-main.profile-title",
                        "urls" : ["profile"],
                        "middleWares" : ["support", "auth"]
                    });

                    $.Oda.Router.addRoute("stats", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/stats.html",
                        "title" : "oda-stats.title",
                        "urls" : ["stats"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["hightcharts"]
                    });

                    $.Oda.Router.addRoute("admin", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/admin.html",
                        "title" : "oda-admin.title",
                        "urls" : ["admin"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["dataTables", "ckeditor"]
                    });

                    $.Oda.Router.addRoute("supervision", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/supervision.html",
                        "title" : "oda-supervision.title",
                        "urls" : ["supervision"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["dataTables"]
                    });


                    var listDependsScene = [
                        {"name" : "scene" , ordered : false, "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/css/simple-sidebar.css", "type" : "css" },
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/templates/Scene.html", "type": "html", target : function(data){ $( "body" ).append(data); }}
                        ]}
                    ];
                    listDepends = listDepends.concat(listDependsScene);
                }

                $.Oda.Loader.load({ depends : listDepends, functionFeedback : function(data){
                    // init from config
                    if ($.Oda.Context.host !== ""){
                        $.Oda.Storage.storageKey = "ODA__"+$.Oda.Context.host+"__";
                    }
                    if($.Oda.Context.ModeExecution.notification){
                        $.Oda.Display.Notification.load();
                    }
                    if($.Oda.Context.ModeExecution.scene) {
                        if($("#"+ $.Oda.Context.mainDiv).exists()){
                            $("#"+ $.Oda.Context.mainDiv).remove();
                        }
                        $.Oda.Display.Scene.load();
                    }
                    if($.Oda.Context.ModeExecution.rooter){
                        $.Oda.Router.startRooter();
                    }
                    var d = new Date();
                    var n = d.getTime();
                    var mili = (d - $.Oda.Context.startDate.getTime());
                    $.Oda.Log.info("Oda fully loaded. (in "+mili+" miliseconds)");
                    $.Oda.Event.send({name:"oda-fully-loaded", data : { truc : data.msg }});
                }, functionFeedbackParams : {msg : "Welcome with Oda"}});
                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.init : " + er.message);
                return null;
            }
        },
        Mobile : {
            /* return elet*/
            funcReturnGPSPosition : null,

            funcReturnCaptureImg : null,

            /* var intern */
            networkState : null,

            positionGps : {
                coords : {
                    latitude : 0,
                    longitude : 0,
                    altitude : 0,
                    accuracy : 0,
                    altitudeAccuracy : 0,
                    heading : 0,
                    speed : 0
                },
                timestamp : 0,
                statut : ''
            },

            pictureSource : null,

            destinationType : null,

            onMobile : false,

            onMobileTest : false,

            /**
             * @name getGPSPosition
             * @desc getGPSPosition
             */
            onSuccessGPSPosition : function(p_position) {
                try {
                    $.Oda.Mobile.positionGps.coords = p_position.coords;
                    $.Oda.Mobile.positionGps.timestamp = p_position.timestamp;
                    $.Oda.Mobile.positionGps.statut = "OK";
                    $.Oda.Mobile.funcReturnGPSPosition($.Oda.Mobile.positionGps);
                } catch (er) {
                    log(0, "ERROR($.Oda.Mobile.onSuccessGPSPosition):" + er.message);
                }
            },

            /**
             * @name getGPSPosition
             * @desc getGPSPosition
             */
            onErrorGPSPosition : function(p_error) {
                try {
                    $.Oda.Mobile.positionGps.statut = "KO : code=>"+ p_error.code+", message=>"+ p_error.message;
                    $.Oda.Mobile.funcReturnGPSPosition($.Oda.Mobile.positionGps);
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.onErrorGPSPosition):" + er.message);
                }
            },

            onPhotoSuccess : function(p_imageData) {
                try {
                    var imgSrc = "data:image/jpeg;base64,"+p_imageData;

                    $.Oda.Mobile.funcReturnCaptureImg(imgSrc);
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.onPhotoSuccess):" + er.message);
                }
            },

            onPhotoURISuccess : function(p_imageURI) {
                try {
                    var imgSrc = p_imageURI;

                    $.Oda.Mobile.funcReturnCaptureImg(imgSrc);
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.onPhotoURISuccess):" + er.message);
                }
            },

            onPhotoFail : function(p_message) {
                try {
                    alert('Failed because: ' + p_message);
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.onPhotoFail):" + er.message);
                }
            },

            initModuleMobile : function(){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.networkState = navigator.connection.type;
                    $.Oda.Mobile.pictureSource = navigator.camera.PictureSourceType;
                    $.Oda.Mobile.destinationType = navigator.camera.DestinationType;

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.initModuleMobile):" + er.message);
                    return null;
                }
            },

            ///////////////// PART NETWORK
            /**
             *
             * @returns {Boolean}
             */
            getConnectionString : function(p_networkState){
                try {
                    var retour = "";

                    var states = {};
                    states[Connection.UNKNOWN]  = 'Unknown connection';
                    states[Connection.ETHERNET] = 'Ethernet connection';
                    states[Connection.WIFI]     = 'WiFi connection';
                    states[Connection.CELL_2G]  = 'Cell 2G connection';
                    states[Connection.CELL_3G]  = 'Cell 3G connection';
                    states[Connection.CELL_4G]  = 'Cell 4G connection';
                    states[Connection.NONE]     = 'No network connection';

                    retour = 'Connection type: ' + states[p_networkState];

                    return retour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.getConnectionString):" + er.message);
                    return null;
                }
            },

            /**
             *
             * @returns {Boolean}
             */
            testConnection : function(){
                try {
                    var boolRetour = true;

                    alert(this.getConnectionString(_networkState));

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.testConnection):" + er.message);
                    return null;
                }
            },

            ///////////////// PART GPS
            getGpsPosition: function(p_onReturn){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.funcReturnGPSPosition = p_onReturn;

                    navigator.geolocation.getCurrentPosition(_onSuccessGPSPosition, _onErrorGPSPosition);

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.getGpsPosition):" + er.message);
                    return null;
                }
            },
            getGpsPositionString: function(p_position){
                try {
                    var retour = "";

                    retour += 'Latitude: '      + p_position.coords.latitude            + '\n' +
                        'Longitude: '               + p_position.coords.longitude           + '\n' +
                        'Altitude: '                + p_position.coords.altitude            + '\n' +
                        'Accuracy: '                + p_position.coords.accuracy            + '\n' +
                        'Altitude Accuracy: '       + p_position.coords.altitudeAccuracy    + '\n' +
                        'Heading: '                 + p_position.coords.heading             + '\n' +
                        'Speed: '                   + p_position.coords.speed               + '\n' +
                        'Timestamp: '               + p_position.timestamp                  + '\n' +
                        'statut: '                  + p_position.statut                     + '\n';

                    return retour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.getGpsPositionString):" + er.message);
                    return null;
                }
            },

            ///////////////// PART CAMERA
            getPhotoFromCamera: function(p_retourCapture){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.funcReturnCaptureImg = p_retourCapture;

                    navigator.camera.getPicture(_onPhotoSuccess, _onPhotoFail, { quality: 50, destinationType: _destinationType.DATA_URL });

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.getPhotoFromCamera):" + er.message);
                    return null;
                }
            },
            getPhotoFromLibrary: function(p_retourCapture){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.funcReturnCaptureImg = p_retourCapture;

                    navigator.camera.getPicture(_onPhotoURISuccess, _onPhotoFail, { quality: 50, destinationType: _destinationType.FILE_URI, sourceType: _pictureSource.PHOTOLIBRARY });

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error(0, "ERROR($.Oda.Mobile.getPhotoFromLibrary):" + er.message);
                    return null;
                }
            }
        },
        MokUp : {
            mokup : [],
            /**
             * @param params
             * @param params.url
             * @param params.tabInput
             * @returns {*}
             */
            get : function(params){
                try {
                    var strInterface = params.url.replace($.Oda.Context.rest,"");

                    var elt;
                    for(var indice in $.Oda.MokUp.mokup){
                        if(params.url.includes($.Oda.MokUp.mokup[indice].interface)){
                            elt = $.Oda.MokUp.mokup[indice];
                            break;
                        }
                    }

                    var defaultValue = null;
                    var value = null;
                    if($.Oda.Tooling.isUndefined(elt)){
                        return {"strErreur":"No mokup found for "+strInterface,"data":{},"statut":4};
                    }else{
                        var attrs = $.Oda.Tooling.clone(params.tabInput);
                        if (attrs.hasOwnProperty("ctrl")) {
                            delete attrs.ctrl;
                        }
                        if (attrs.hasOwnProperty("milis")) {
                            delete attrs.milis;
                        }
                        if (attrs.hasOwnProperty("keyAuthODA")) {
                            delete attrs.keyAuthODA;
                        }


                        for(var indice in elt.value){
                            if(elt.value[indice].args === "default"){
                                defaultValue = elt.value[indice].return;
                            }
                            if($.Oda.Tooling.deepEqual(elt.value[indice].args,attrs)){
                                value = elt.value[indice].return;
                                break;
                            }
                        }
                    }
                    return (value === null) ? defaultValue : value;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.MokUp.get : " + er.message);
                    return null;
                }
            }
        },
        Event : {
            /**
             * @param {Object} p_params
             * @param p_params.name
             * @param p_params.callback function (e) { e.detail ... }
             * @returns {$.Oda.Event}
             */
            addListener: function (p_params) {
                try {
                    // Listen for the event.
                    $.Oda.Context.window.addEventListener(p_params.name, p_params.callback, false);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Event.addListener : " + er.message);
                    return null;
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.name
             * @param p_params.data
             * @returns {$.Oda.Event}
             */
            send: function (p_params) {
                try {
                    if(!p_params.hasOwnProperty("data")){
                        p_params.data = {};
                    }
                    var event = new CustomEvent(p_params.name, { detail : p_params.data });
                    $.Oda.Context.window.dispatchEvent(event);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Event.send : " + er.message);
                    return null;
                }
            }
        },
        /**
         *
         */
        Date : {
            getStrDateFR : function(){
                try {
                    var currentTime = new Date();
                    var annee = currentTime.getFullYear();
                    var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                    var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                    var strDate = jour + "/" + mois + "/" + annee;
                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateFR() : " + er.message);
                    return null;
                }
            },

            /**
             * getStrDateTimeFrFromUs
             * @param {String} p_strDateTime
             * @returns {String}
             */
            getStrDateTimeFrFromUs : function(p_strDateTime) {
                try {
                    var strDate = "";

                    strDate = p_strDateTime.substr(8,2) + "/" + p_strDateTime.substr(5,2) + "/" + p_strDateTime.substr(0,4) + " " + p_strDateTime.substr(10,(p_strDateTime.length - 10));

                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateTimeFrFromUs : " + er.message);
                    return null;
                }
            },

            /**
             * getStrDateFrFromUs
             * @param {String} p_strDate
             * @returns {String}
             */
            getStrDateFrFromUs : function(p_strDate) {
                try {
                    var strDate = "";

                    strDate = p_strDate.substr(8,2) + "/" + p_strDate.substr(5,2) + "/" + p_strDate.substr(0,4);

                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateFrFromUs : " + er.message);
                    return null;
                }
            },

            /**
             * @name convertSecondsToTime
             * @desc Seconds to hh:mm:ss
             * @param {int} p_second
             * @returns {String}
             */
            convertSecondsToTime : function(p_second) {
                try {
                    var sec_num = p_second;
                    var hours   = Math.floor(sec_num / 3600);
                    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                    var seconds = sec_num - (hours * 3600) - (minutes * 60);

                    if (hours   < 10) {hours   = "0"+hours;}
                    if (minutes < 10) {minutes = "0"+minutes;}
                    if (seconds < 10) {seconds = "0"+seconds;}
                    var time    = hours+':'+minutes+':'+seconds;
                    return time;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.convertSecondsToTime : " + er.message);
                    return null;
                }
            },

            /**
             * @name getStrDateTime
             * @returns {String}
             */
            getStrDateTime : function() {
                try {
                    var currentTime = new Date();
                    var hours = $.Oda.Tooling.pad2(currentTime.getHours());
                    var minutes = $.Oda.Tooling.pad2(currentTime.getMinutes());
                    var annee = currentTime.getFullYear();
                    var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                    var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                    var secondes = $.Oda.Tooling.pad2(currentTime.getSeconds());
                    var strDateTime = annee + "/" + mois + "/" + jour + " " + hours + ":" + minutes + ":" + secondes;
                    return strDateTime;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateTime : " + er.message);
                    return null;
                }
            }
        },

        Interface : {
            /**
             * @desc factorisation pour choisir le type de call à faire
             * @param params
             * @returns {{strErreur: string, data: {}, statut: number}}
             */
            call : function(params){
                var response = {"strErreur": "No call", "data": {}, "statut": 4}
                if(params.odaInterface.length>0){
                    var theInterface = params.odaInterface[0];
                    params.odaInterface.splice(0,1);
                    response = $.Oda.Interface.Methode[theInterface](params);
                }
                return response;
            },
            /**
             * @name callRest
             * @desc Hello
             * @param {String} p_url
             * @param {Object} p_tabSetting
             * @param p_tabSetting.functionRetour
             * @param p_tabSetting.odaCacheOnDemande
             * @param {Object} p_tabInput
             * @returns {Object}
             */
            callRest: function(p_url, p_tabSetting, p_tabInput) {
                try {
                    var interfaces = $.Oda.Tooling.clone($.Oda.Context.modeInterface);
                    var jsonAjaxParam = {
                        url: p_url,
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                        dataType: 'json',
                        type: 'GET',
                        async: p_tabSetting.hasOwnProperty("functionRetour"),
                        odaInterface:interfaces,
                        context : {}
                    };

                    if(!p_tabSetting.hasOwnProperty("odaCacheOnDemande")){
                        p_tabSetting.odaCacheOnDemande = false;
                    }

                    //création du jeton pour la secu
                    var session = $.Oda.Storage.get("ODA-SESSION");
                    var key = null;
                    if (session !== null) {
                        key = session.key;
                    } else {
                        key = p_tabInput.keyAuthODA;
                        delete p_tabInput.keyAuthODA;
                    }

                    if(p_tabInput === undefined){
                        p_tabInput = {};
                    }
                    p_tabInput.milis = $.Oda.Tooling.getMilise();
                    p_tabInput.ctrl = "OK";
                    p_tabInput.keyAuthODA = key;

                    jsonAjaxParam.data = p_tabInput;

                    for (var indice in p_tabSetting) {
                        jsonAjaxParam[indice] = p_tabSetting[indice];
                    }

                    jsonAjaxParam.context.odaKey = p_url;
                    jsonAjaxParam.context.odaAttrs = p_tabInput;

                    return $.Oda.Interface.call(jsonAjaxParam);
                } catch (er) {
                    var msg = "$.Oda.Interface.callRest : " + er.message;
                    $.Oda.Log.error(msg);
                    return null;
                }
            },
            Methode : {
                "ajax": function (params) {
                    var retour;
                    var jqXHRMaster = $.ajax(params)
                        .done(function (data, textStatus, jqXHR) {
                            if(data === undefined){
                                data = {"strErreur": '', "data": {}, "statut": 4};
                            }else{
                                if (typeof data === 'object') {
                                    if ((data.hasOwnProperty("strErreur")) && ((data.strErreur == "key auth expiree.") || (data.strErreur == "key auth invalid."))) {
                                        $.Oda.Security.logout();
                                    }
                                } else {
                                    data = {"strErreur": data, "data": {}, "statut": 4};
                                }
                            }

                            if ((data.hasOwnProperty("strErreur")) && (data.strErreur !== "")) {
                                $.Oda.Event.send({name : "oda-notification-flash", data : {type : "error", msg : "$.Oda.Interface.Methode.ajax : " + data.strErreur} });
                            } else if ($.Oda.Tooling.isInArray("cache", $.Oda.Context.modeInterface)){
                                var attrs = $.Oda.Tooling.clone(this.odaAttrs);
                                if (attrs.hasOwnProperty("ctrl")) {
                                    delete attrs.ctrl;
                                }
                                if (attrs.hasOwnProperty("milis")) {
                                    delete attrs.milis;
                                }
                                if (attrs.hasOwnProperty("keyAuthODA")) {
                                    delete attrs.keyAuthODA;
                                }
                                $.Oda.Cache.save({
                                    key: this.odaKey,
                                    attrs: attrs,
                                    datas: data
                                });
                            }

                            $.Oda.Log.debug("Call ajax success for : "+params.url);
                            data.context = this;
                            if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                                retour = data;
                            } else {
                                params.functionRetour(data);
                            }
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            var msg = textStatus + " - " + errorThrown + " on " + params.url;
                            $.Oda.Log.error("$.Oda.Interface.Methode.ajax : " + msg);

                            var data = {"strErreur": msg, "data": {}, "statut": 404};

                            if((params.odaInterface.length>0)&&(textStatus === "error")){
                                retour = $.Oda.Interface.call(params);
                            }else{
                                $.Oda.Display.Notification.error(msg);
                                data.context = this;
                                if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                                    retour = data;
                                } else {
                                    params.functionRetour(data);
                                }
                            }
                        });
                    return retour;
                },
                "mokup": function (params) {
                    var retour = $.Oda.MokUp.get({url: params.url, tabInput: params.data});
                    if((retour.hasOwnProperty("strErreur")) && (retour.strErreur.startsWith("No mokup found for")) && (params.odaInterface.length>0)){
                        return $.Oda.Interface.call(params);
                    }else{
                        retour.context = params.context;
                        $.Oda.Log.debug("Call mokup success for : "+params.url);
                        if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                            return retour;
                        } else {
                            params.functionRetour(retour);
                            return;
                        }
                    }
                },
                "cache": function (params) {
                    var attrs = $.Oda.Tooling.clone(params.data);
                    if(attrs.hasOwnProperty("ctrl")){
                        delete attrs.ctrl;
                    }
                    if(attrs.hasOwnProperty("milis")){
                        delete attrs.milis;
                    }
                    if(attrs.hasOwnProperty("keyAuthODA")){
                        delete attrs.keyAuthODA;
                    }
                    var retour = $.Oda.Cache.load({key: params.url, attrs: attrs, demande : params.odaCacheOnDemande});

                    if(retour){
                        var datas = retour.datas;
                        datas.context = params.context;
                        $.Oda.Log.debug("Call cache success for : "+params.url);
                        if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                            return datas;
                        } else {
                            params.functionRetour(datas);
                            return;
                        }
                    }else{
                        if(params.odaInterface.length>0){
                            return $.Oda.Interface.call(params);
                        }else{
                            var msg = "No found in cache : "+params.url+", and cache is the last interface.";
                            var data = {"strErreur": msg, "data": {}, "statut": 404};
                            $.Oda.Log.error(msg);
                            data.context = params.context;
                            if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                                return data;
                            } else {
                                params.functionRetour(data);
                                return;
                            }
                        }
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.attr
                 * @returns {$.Oda.Interface}
                 */
                offline: function (params) {
                    try {
                        var attrs = $.Oda.Tooling.clone(params.data);
                        if(attrs.hasOwnProperty("ctrl")){
                            delete attrs.ctrl;
                        }
                        if(attrs.hasOwnProperty("milis")){
                            delete attrs.milis;
                        }
                        if(attrs.hasOwnProperty("keyAuthODA")){
                            delete attrs.keyAuthODA;
                        }
                        var retour = $.Oda.Cache.loadWithOutTtl({key: params.url, attrs: attrs});

                        if(retour){
                            var datas = retour.datas;
                            datas.context = params.context;
                            $.Oda.Log.debug("Call offline success for : "+params.url);
                            if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                                return datas;
                            } else {
                                params.functionRetour(datas);
                                return;
                            }
                        }else{
                            if(params.odaInterface.length>0){
                                return $.Oda.Interface.call(params);
                            }else{
                                var msg = "No found in offline : "+params.url+", and offline is the last interface.";
                                var data = {"strErreur": msg, "data": {}, "statut": 404};
                                $.Oda.Log.error(msg);
                                data.context = params.context;
                                if ($.Oda.Tooling.isUndefined(params.functionRetour)) {
                                    return data;
                                } else {
                                    params.functionRetour(data);
                                    return;
                                }
                            }
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Interface.offline : " + er.message);
                        return null;
                    }
                },
            },
            /**
             * getParameter
             * #ex $.Oda.Interface.getParameter("contact_mail_administrateur");
             * @param {string} p_param_name
             * @returns { int|varchar }
             */
            getParameter : function(p_param_name) {
                try {
                    var strResponse;

                    var tabInput = { param_name : p_param_name };
                    var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getParam.php", {}, tabInput);
                    if(json_retour.strErreur === ""){
                        var type = json_retour.data.leParametre.param_type;
                        var value = json_retour.data.leParametre.param_value;
                        switch (type) {
                            case "int":
                                strResponse = parseInt(value);
                                break;
                            case "float":
                                strResponse = $.Oda.Tooling.arrondir(parseFloat(value),2);
                                break;
                            case "varchar":
                                strResponse =  value;
                                break;
                            default:
                                strResponse =  value;
                                break;
                        }
                    }

                    return strResponse;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.getParameter : " + er.message);
                    return null;
                }
            },
            /**
             * geRangs
             * @returns {json}
             */
            getRangs :  function() {
                try {
                    var valeur = $.Oda.Storage.get("ODA_rangs");
                    if(valeur === null){

                        var tabInput = { "sql" : "Select `labelle`,`indice` FROM `api_tab_rangs` ORDER BY `indice` desc" };
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getSQL.php", {type : 'POST'}, tabInput);

                        if(retour.strErreur === ""){
                            valeur = retour.data.resultat.data;
                        }else{
                            $.Oda.Display.Notification.error(retour.strErreur);
                        }

                        $.Oda.Storage.set("ODA_rangs",valeur,$.Oda.Storage.ttl_default);
                    }

                    return valeur;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.geRangs : " + er.message);
                    return null;
                }
            },
            /**
             * @name addStat
             * @test addStat('ADMI', 'page_home.html', 'checkAuth : ok');
             * @param {String} p_user
             * @param {String} p_page
             * @param {String} p_action
             */
            addStat : function(p_user, p_page, p_action) {
                try {
                    var tabSetting = { functionRetour : function(){} };
                    var tabInput = {
                        user : p_user,
                        page : p_page,
                        action : p_action
                    };
                    var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/addStat.php", tabSetting, tabInput);
                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.addStat : " + er.message);
                    return null;
                }
            },

            /**
             * sendMail
             * @ex $.Oda.Interface.sendMail({email_mails_dest:'fabrice.rosito@gmail.com',message_html:'HelloContent',sujet:'HelloSujet'});
             * @param {json} p_params
             * @returns {boolean}
             */
            sendMail : function(p_params) {
                try {
                    var params_attempt = {
                        email_mails_dest : null,
                        message_html : null,
                        sujet : null
                    };

                    var params = $.Oda.Tooling.checkParams(p_params, params_attempt);
                    if(params === null){
                        return false;
                    }

                    var returns = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/scriptphp/send_mail.php", {type : 'POST'}, params);

                    return returns;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.sendMail) :" + er.message);
                    return null;
                }
            }
        },

        Display : {
            /**
             * @param {Object} p_params
             * @param p_params.id
             * @param p_params.html
             * @returns {$.Oda.Display.render}
             */
            render : function (p_params) {
                try {
                    $('#'+p_params.id).html(p_params.html);
                    $.Oda.Scope.init({id:p_params.id});
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Display.render : " + er.message);
                    return null;
                }
            },
            Notification : {
                id : 0,
                success : function(p_message){
                    this.create(p_message,"success", 2000);
                },
                info : function(p_message){
                    this.create(p_message,"info", 3000);
                },
                warning : function(p_message){
                    this.create(p_message,"warning", 5000);
                },
                danger : function(p_message){
                    this.create(p_message,"danger");
                },
                error : function(p_message){
                    this.create(p_message,"danger");
                    $.Oda.Log.error(p_message);
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.attr
                 * @returns {$.Oda.Notification}
                 */
                load: function (p_params) {
                    try {
                        var html = $.Oda.Display.TemplateHtml.create({
                            template : "oda-notification-tpl"
                        });
                        $( "body" ).append(html);
                        $.Oda.Event.addListener({name : "oda-notification-flash", callback : function(e){
                            $.Oda.Display.Notification[e.detail.type](e.detail.msg);
                            return this;
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.load : " + er.message);
                        return null;
                    }
                },
                /**
                 * notification
                 * @Desc Show notification
                 * @param {string} p_message
                 * @param {string} p_type
                 * @returns {boolean}
                 */
                create : function(p_message, p_type, time) {
                    try {
                        $.Oda.Display.Notification.id++;
                        var strHtml = "";
                        strHtml += '';
                        strHtml += '<div class="alert alert-'+p_type+' alert-dismissible" style="text-align:center;" id="oda-notification-'+$.Oda.Display.Notification.id+'">';
                        strHtml += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
                        strHtml += p_message;
                        strHtml += '</div>';
                        $( "#oda-notification" ).append( strHtml );

                        if(!$.Oda.Tooling.isUndefined(time)){
                            $.Oda.Tooling.timeout($.Oda.Display.Notification.remove,time,{id:$.Oda.Display.Notification.id});
                        }

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.create :" + er.message);
                        return null;
                    }
                },
                /**
                 *
                 * @param {object} params
                 * @returns {$.Oda.Notification}
                 */
                remove : function(params){
                    try {
                        $('#oda-notification-'+params.id).fadeOut( 500, function(){
                            $( this ).remove();
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.remove :" + er.message);
                        return null;
                    }
                }
            },
            Scene : {
                /**
                 * @param {object} p_params
                 * @returns {$.Oda.Display.Scene}
                 */
                load: function (p_params) {
                    try {
                        var htmlScene = $.Oda.Display.TemplateHtml.create({
                            template : "oda-scene-tpl"
                        });
                        $( "body" ).append(htmlScene);

                        var htmlTudo = $.Oda.Display.TemplateHtml.create({
                            template : "oda-tuto-tpl"
                        });
                        $( "body" ).append(htmlTudo);

                        $("#avatar").attr('src',$.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/img/no_avatar.png");

                        $("#avatar").click(function(e) {
                            e.preventDefault();
                            $("#wrapper").toggleClass("toggled");
                        });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Scene.load : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.code_user
                 * @param p_params.callback
                 * @returns {$.Oda.Display.Scene.avatar}
                 */
                avatar : function (p_params) {
                    try {
                        var targetUser = $.Oda.Session.code_user;
                        if(p_params.hasOwnProperty("code_user") && p_params.code_user !== ""){
                            targetUser = p_params.code_user;
                        }

                        if(targetUser !== ""){
                            $.ajax({
                                url: $.Oda.Context.resources + 'avatars/' + $.Oda.Session.code_user + ".png",
                                type:'HEAD',
                                error: function(){
                                    p_params.callback({src : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/img/no_avatar.png"});
                                },
                                success: function(){
                                    p_params.callback({src : $.Oda.Context.resources + 'avatars/' + $.Oda.Session.code_user + ".png"});
                                }
                            });
                        }else{
                            p_params.callback({src : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/img/no_avatar.png"});
                        }

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Scene.avatar : " + er.message);
                        return null;
                    }
                },
            },
            /**
             * @param {Object} p_params
             * @param p_params.elt
             * @returns {$.Oda.Display}
             */
            loading: function (p_params) {
                try {
                    p_params.elt.html('<img SRC="'+$.Oda.Context.rootPath + $.Oda.Context.vendorName + '/Oda/resources/img/loading.gif" ALT="Chargement" TITLE="Chargement">');
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Display.loading : " + er.message);
                    return null;
                }
            },
            MenuSlide : {
                display : false,
                /**
                 * @name : show
                 */
                show : function(){
                    try {
                        if (this.display) {
                        } else {
                            var strHtml = "";
                            strHtml += '<li class="sidebar-brand"><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'profile\',\'args\':{}});">' + $.Oda.Session.userInfo.firstName + " " + $.Oda.Session.userInfo.lastName + '</a></li>';
                            strHtml += '<li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'profile\',\'args\':{}});" oda-label="oda-main.profile">Your profile</a></li>';
                            strHtml += '<li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'contact\',\'args\':{}});" oda-label="oda-main.contact">Contact</a></li>';
                            strHtml += '<li><a href="javascript:$.Oda.Security.logout();" oda-label="oda-main.logout">Logout</a></li>';
                            $('#menuSlide').html(strHtml);
                            this.display = true;
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.MenuSlide.show : " + er.message);
                    }
                },

                /**
                 * @name : remove
                 */
                remove : function(){
                    try {
                        $("#wrapper").removeClass("toggled");
                        $('#menuSlide').html('<li class="sidebar-brand" id="profileDisplay"><span oda-label="oda-project.userLabel">Profile Name</span></li><li class="divider"></li><li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'contact\',\'args\':{}});" oda-label="oda-main.contact">Contact</a></li>');
                        this.display = false;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.MenuSlide.remove : " + er.message);
                    }
                }
            },
            Menu : {
                display : false,
                /**
                 * @name : show
                 */
                show : function(){
                    try {
                        if(!this.display){
                            var tabInput = { rang : $.Oda.Session.userInfo.profile, id_page : 0 };
                            var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getMenu.php", {"functionRetour" : function(retour){
                                var strHTML = "";
                                if(retour.strErreur === ""){
                                    var datas = retour.data.resultat.data;

                                    var cate = "";

                                    for (var indice in datas) {
                                        if((datas[indice].id_categorie !== "98") && ((datas[indice].id_categorie !== "1"))){
                                            if(datas[indice].id_categorie !== cate){
                                                cate = datas[indice].id_categorie;
                                                if(indice !== "0"){
                                                    strHTML += "</ul></li>";
                                                }

                                                strHTML += '<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">'+datas[indice].Description_cate+'<span class="caret"></span></a><ul class="dropdown-menu" role="menu">';
                                            }
                                            var route = datas[indice].Lien;
                                            route = route.replace("api_page_","");
                                            route = route.replace("page_","");
                                            route = route.replace(".html","");
                                            strHTML += "<li><a href=\"javascript:$.Oda.Router.navigateTo({'route':'"+route+"','args':{}});\">"+datas[indice].Description_courte+"</a></li>";
                                        }
                                    }
                                    $('#menu').html(strHTML);
                                }
                            }
                            }, tabInput);
                            this.display = true;
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Menu.show : " + er.message);
                    }
                },

                /**
                 * @name : remove
                 */
                remove : function(){
                    try {
                        $('#menu').html('');
                        this.display = false;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Menu.remove : " + er.message);
                    }
                }
            },
            Message : {
                /**
                 * @param {object} p_params
                 * @returns {$.Oda}
                 */
                show: function (p_params) {
                    try {
                        var tabInput = { code_user : $.Oda.Session.code_user };
                        var callback = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getMessagesToDisplay.php", { functionRetour : function(datas) {
                            if(datas.strErreur === ""){
                                for(var indice in datas.data.messages.data){
                                    var message = datas.data.messages.data[indice];
                                    if ( ! $( "#oda-message-"+message.id ).length ) {
                                        var strHtml = "";
                                        strHtml += '';
                                        strHtml += '<div class="alert alert-'+message.niveau+' alert-dismissible" id="oda-message-'+message.id+'" style="width:90%;margin-left:auto;margin-right:auto;">';
                                        strHtml += '<button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="$.Oda.Display.Message.hide({id:\''+message.id+'\'});"><span aria-hidden="true">&times;</span></button>';
                                        strHtml += message.message;
                                        strHtml += '</div>';
                                        $('#'+$.Oda.Context.mainDiv).before(strHtml);
                                    }
                                }

                            } else{
                                $.Oda.Display.Notification.error(datas.strErreur);
                            }
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Message.show : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @returns {$.Oda}
                 */
                hide: function (p_params) {
                    try {
                        var tabInput = { code_user : $.Oda.Session.code_user, id : p_params.id };
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/setMessagesLus.php", {functionRetour : function(datas) {
                            if(retour.strErreur === ""){
                                $('#oda-message-'+p_params.id).remove();
                            } else{
                                $.Oda.Display.Notification.error(datas.strErreur);
                            }
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Message.hide  : " + er.message);
                        return null;
                    }
                }
            },
            Popup : {
                iterator : 0,
                /**
                 * affichePopUp
                 * @param {Object} p_params
                 * @param p_params.name
                 * @param p_params.size (sm, lg)
                 * @param p_params.label
                 * @param p_params.details
                 * @param p_params.footer
                 * @param p_params.callback
                 * @param p_params.callbackParams
                 */
                open : function(p_params){
                    try {
                        if(!p_params.hasOwnProperty("name")){
                            $.Oda.Display.Popup.iterator++;
                            p_params.name = 'oda-popup' + $.Oda.Display.Popup.iterator;
                        }

                        var htmlPopUp = $.Oda.Display.TemplateHtml.create({
                            template : "oda-popup-tpl",
                            scope : {
                                name : p_params.name
                            }
                        });
                        $( "body" ).append(htmlPopUp);

                        if(p_params.hasOwnProperty("size")){
                            $('#'+p_params.name+' .modal-dialog').addClass("modal-"+p_params.size);
                        }

                        $('#'+p_params.name+'_label').html("<b>"+p_params.label+"</b>");
                        $.Oda.Scope.init({id:p_params.name+'_label'});

                        var contentPopup = p_params.details;
                        $('#'+p_params.name+'_content').html(contentPopup);
                        $.Oda.Scope.init({id:p_params.name+'_content'});

                        if(p_params.hasOwnProperty("footer")){
                            $('#'+p_params.name+'_footer').html(p_params.footer);
                        }else{
                            $('#'+p_params.name+'_footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" oda-label="oda-main.bt-close"></button>');
                        }
                        $.Oda.Scope.init({id:p_params.name+'_footer'});

                        if(p_params.hasOwnProperty("callback")) {
                            $('#'+p_params.name).on('shown.bs.modal', function (e) {
                                if(p_params.hasOwnProperty("callbackParams")) {
                                    p_params.callback(p_params.callbackParams);
                                }else{
                                    p_params.callback();
                                }
                            });
                        }else{
                            $( "#"+p_params.name ).unbind( "shown.bs.modal" );
                        }

                        $('#'+p_params.name).on('hidden.bs.modal', function (e) {
                            $('#'+p_params.name).remove();
                        })

                        $('#'+p_params.name).modal("show");
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.open : " + er.message);
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.name
                 * @returns {$.Oda.Display.Popup}
                 */
                close: function (p_params) {
                    try {
                        if($.Oda.Tooling.isUndefined(p_params)){
                            var p_params = {};
                        }

                        if(!p_params.hasOwnProperty('name')){
                            p_params.name = 'oda-popup' + $.Oda.Display.Popup.iterator;
                        }

                        $('#'+p_params.name).modal("hide");
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.close : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.Display.Popup}
                 */
                closeAll: function () {
                    try {
                        $('.modal').each(function(index, value) {
                            $(value).modal("hide");
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.closeAll : " + er.message);
                        return null;
                    }
                }
            },
            TemplateHtml : {
                /**
                 * @param {Object} p_params
                 * @param p_params.template
                 * @param p_params.scope opt
                 * @returns {$.Oda.Display.TemplateHtml}
                 */
                create: function (p_params) {
                    try {
                        var strHtml = $('#'+p_params.template).html();
                        if(p_params.hasOwnProperty("scope")){
                            var listExpression = $.Oda.Tooling.findBetweenWords({str : $('#'+p_params.template).html(), first : "{{", last : "}}" });
                            for(var indice in listExpression){
                                var resultEval = $.Oda.Display.TemplateHtml.eval({exrp : listExpression[indice], scope : p_params.scope});
                                strHtml = $.Oda.Tooling.replaceAll({str : strHtml, find : '{{'+listExpression[indice]+'}}', by : resultEval});
                            }
                        }

                        strHtml = $.Oda.Scope.transform({str:strHtml});

                        return strHtml;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.TemplateHtml.create : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @returns {String}
                 */
                eval: function (p_params) {
                    try {
                        'use strict'

                        var source = '(function(' + Object.keys(p_params.scope).join(', ') + ') { return ' + p_params.exrp + ';})';

                        var compiled = eval(source);

                        var result = [];
                        for (var property in p_params.scope)
                            if (p_params.scope.hasOwnProperty(property))
                                result.push(p_params.scope[property]);

                        var result = compiled.apply(p_params.scope, result);

                        return result;
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.TemplateHtml.eval : " + er.message);
                        return null;
                    }
                }
            }
        },

        //for the application project
        App : {},

        Tooling : {
            timerDebounce : null,
            timerThrottle : null,
            lastThrottle : null,
            /**
             * checkParams
             * @param {Object} p_params
             * @param {json} p_def ex : {attr1 : null, attr2 : "truc"}
             */
            checkParams : function (p_params, p_def) {
                try {
                    var params = $.Oda.Tooling.clone(p_params);

                    var param_return = {};

                    for (var key in p_def) {
                        if(p_def[key] === null){
                            if(typeof params[key] === "undefined"){
                                var myUserException = new UserException("Param : "+key+" missing");
                                throw myUserException;
                            }else{
                                param_return[key] = params[key];
                            }
                        }else{
                            if(typeof params[key] === "undefined"){
                                param_return[key] = p_def[key];
                            }else{
                                param_return[key] = params[key];
                            }
                        }
                        delete params[key];
                    }

                    for (var key in params) {
                        param_return[key] = params[key];
                    }

                    return param_return;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.checkParams : " + er.message);
                    return null;
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.strPath relative from resources/
             * @returns {String}
             */
            urlDownloadFromServerResources : function (p_params) {
                try {
                    var url = $.Oda.Context.rest+'vendor/happykiller/oda/resources/scriptphp/download.php&fic=../../../../../../../resources/'+p_params.strPath;
                    return url;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.urlDownloadFromServerResources : " + er.message);
                    return null;
                }
            },
            timeout : function(func, time, arg){
                try {
                    setTimeout(func, time, arg);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.timeout : " + er.message);
                    return null;
                }
            },
            /**
             * arrondir
             * @param {float|int} p_value
             * @param {int} p_precision
             * @returns {float|int}
             */
            arrondir : function(p_value, p_precision){
                try {
                    var retour = 0;
                    var coef = Math.pow(10, p_precision);

                    if(coef !== 0){
                        retour = Math.round(p_value*coef)/coef;
                    }else{
                        retour = Math.round(p_value);
                    }

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.arrondir : " + er.message);
                    return null;
                }
            },
            /**
             * @name clone
             * @desc Clone an object JS
             * @param{object} p_params
             * @returns {object}
             */
            clone : function(p_params) {
                try {
                    if (null === p_params || "object" !== typeof p_params) return p_params;
                    var copy = p_params.constructor();
                    for (var attr in p_params) {
                        if (p_params.hasOwnProperty(attr)) copy[attr] = p_params[attr];
                    }
                    return copy;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.clone : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} elt1
             * @param {object} elt2
             * @returns {$.Oda.Tooling}
             */
            deepEqual: function (elt1, elt2) {
                try {
                    if ((typeof elt1 === "object" && elt1 !== null) && (typeof elt2 === "object" && elt2 !== null)) {
                        if (Object.keys(elt1).length !== Object.keys(elt2).length)
                            return false;

                        for (var prop in elt1) {
                            if (elt2.hasOwnProperty(prop))
                            {
                                if (! $.Oda.Tooling.deepEqual(elt1[prop], elt2[prop]))
                                    return false;
                            }
                            else
                                return false;
                        }

                        return true;
                    }
                    else if (elt1 !== elt2)
                        return false;
                    else
                        return true;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.deepEqual : " + er.message);
                    return null;
                }
            },
            /**
             * @param callback Function
             * @param delay Integer
             * @returns {$.Oda.Tooling}
             */
            debounce : function (callback, delay) {
                try {
                    var args = arguments;
                    var context = this;
                    clearTimeout($.Oda.Tooling.timerDebounce);
                    $.Oda.Tooling.timerDebounce = setTimeout(function(){
                        callback.apply(context, args);
                    }, delay);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.debounce : " + er.message);
                    return null;
                }
            },
            /**
             *
             * @param {string} html
             * @returns {string}
             */
            decodeHtml : function (html) {
                try {
                    var decoded = $('<div/>').html(html).text();
                    return decoded;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.decodeHtml : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} p_params
             * @returns {$.Oda.Tooling}
             */
            findBetweenWords: function (p_params) {
                try {
                    var r = new RegExp(p_params.first + '(.*?)' + p_params.last, 'gm');
                    var list =  p_params.str.match(r);

                    for (var indice in list){
                        list[indice] = list[indice].replace(p_params.first,'').replace(p_params.last,'');
                    }
                    return list;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.findBetweenWords : " + er.message);
                    return null;
                }
            },
            /**
             * @param p_params
             * @param p_params.str
             * @param p_params.find
             * @param p_params.by
             * @param p_params.ignoreCase by default false
             * @returns {String}
             */
            replaceAll: function (p_params) {
                try {
                    if((p_params.find === '')||(p_params.by === '')){
                        return p_params.str;
                    }

                    var opt = "g";
                    if(p_params.hasOwnProperty('ignoreCase') && p_params.ignoreCase){
                        opt = 'gi';
                    }
                    var str = p_params.find.replace(/([.?*+^$[\]\\(){}|-])/, "\\$1");
                    var re = new RegExp(str, opt);

                    var strReturn = p_params.str.replace(re, p_params.by);
                    return strReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.replaceAll : " + er.message);
                    return null;
                }
            },
            /**
             *
             * @param {type} path
             * @returns {unresolved}
             */
            clearSlashes : function(string) {
                try {
                    return string.toString().replace(/\/$/, '').replace(/^\//, '');
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.clearSlashes : " + er.message);
                    return null;
                }
            },
            /**
             * @returns {String}
             */
            getLangBrowser : function (p_params) {
                try {
                    var lang = "";
                    if(!$.Oda.Tooling.isUndefined(navigator.language)){
                        switch (true) {
                            case navigator.language.includes('fr') :
                                lang = 'fr';
                                break;
                            case navigator.language.includes('en') :
                                lang = 'en';
                                break;
                            case navigator.language.includes('es') :
                                lang = 'es';
                                break;
                            case navigator.language.includes('it') :
                                lang = 'it';
                                break;
                            default:
                                lang = navigator.language;
                        }
                    }
                    return lang;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getLangBrowser : " + er.message);
                    return null;
                }
            },
            /**
             * getListValeurPourAttribut
             * @param {json} p_obj
             * @param {string} p_attribut
             * @returns {Array}
             */
            getListValeurPourAttribut : function(p_obj, p_attribut, p_type) {
                try {
                    var retour = [];

                    for (var indice in p_obj) {
                        for (var key in p_obj[indice]) {
                            if(key === p_attribut){
                                if(typeof p_type !== "undefined"){
                                    var valeur = null;
                                    if(p_type === "int"){
                                        valeur = parseInt(p_obj[indice][key]);
                                    }else if(p_type === "float"){
                                        valeur = parseFloat(p_obj[indice][key]);
                                    }else{
                                        valeur = new p_type(p_obj[indice][key]);
                                    }
                                    retour[retour.length] = valeur;
                                }else{
                                    retour[retour.length] = p_obj[indice][key];
                                }
                            }
                        }
                    }

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getListValeurPourAttribut : " + er.message);
                    return null;
                }
            },
            /**
             * isInArray
             * @param {string} p_value
             * @param {array} p_array
             * @returns {Boolean}
             */
            isInArray :  function(p_value, p_array) {
                try {
                    var boolRetour = false;

                    for(var indice in p_array){
                        if(p_value === p_array[indice]){
                            boolRetour = true;
                            break;
                        }
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isInArray : " + er.message);
                    return null;
                }
            },
            /**
             * @name isUndefined
             * @desc is ndefined N
             * @param {object} p_object
             * @returns {Boolean}
             */
            isUndefined : function(p_object) {
                try {
                    var boolReturn = true;

                    if(typeof p_object !== "undefined"){
                        boolReturn = false;
                    }

                    return boolReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isUndefined : " + er.message);
                    return null;
                }
            },

            /**
             * @name getMilise
             * @returns {string}
             */
            getMilise : function() {
                try {
                    var d = new Date();
                    return d.getTime();
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getMilise : " + er.message);
                    return null;
                }
            },

            /**
             * @param {Object} p_params
             * @param p_params.url
             * @returns {Object}
             */
            getParameterGet : function(p_params) {
                try {
                    var result = {};
                    var tableau = decodeURI(p_params.url).split("?");
                    if(tableau.length > 1){
                        tableau = tableau[1];
                        tableau = tableau.split("&");
                        for (var indice in tableau){
                            var tmp = tableau[indice].split("=");
                            result[tmp[0]] = tmp[1];
                        }
                    }
                    return result;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getParameterGet : " + er.message);
                    return null;
                }
            },

            /**
             * @param {Object} p_params
             * @param p_params.library
             * @returns {Object}
             */
            getParamsLibrary: function (p_params) {
                try {
                    var listParams = {};

                    $("script[src*='"+p_params.library+"']").each(function(index, value){
                        var src = $(value).attr("src");
                        listParams = $.Oda.Tooling.getParameterGet({url : src});
                    });

                    return listParams;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getParamsLibrary : " + er.message);
                    return null;
                }
            },

            objectSize : function(obj) {
                try {
                    var size = 0, key;
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) size++;
                    }
                    return size;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.objectSize : " + er.message);
                    return null;
                }
            },

            /**
             * objDataTableFromJsonArray
             *
             * @param {object} p_JsonArray
             * @returns {object}
             */
            objDataTableFromJsonArray : function(p_JsonArray){
                try {
                    var objRetour = { statut : "ok"};

                    var arrayEntete = {};
                    var i = 0;
                    for(var key in p_JsonArray[0]){
                        arrayEntete[key] = i;
                        i++;
                    }
                    objRetour.entete = arrayEntete;

                    var arrayData = [];
                    for(var indice in p_JsonArray){
                        var subArrayData = [];
                        for(var key in p_JsonArray[indice]){
                            subArrayData[subArrayData.length] = p_JsonArray[indice][key];
                        }
                        arrayData[arrayData.length] = subArrayData;
                    }

                    objRetour.data = arrayData;

                    return objRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.objDataTableFromJsonArray : " + er.message);
                    var objRetour = { statut : "ko"};
                    return objRetour;
                }
            },

            /**
             * pad2
             * @param {int} number
             * @returns {String}
             */
            pad2 : function(number) {
                try {
                    return (number < 10 ? '0' : '') + number;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.pad2 : " + er.message);
                    return null;
                }
            },

            /**
             * @name uploadFile
             * @desc Hello
             * @param {Object} p_params
             * @param p_params.idInput
             * @param p_params.folder
             * @param p_params.name
             * @returns {Object}
             */
            uploadFile : function(p_params) {
                try {
                    if(p_params.idInput != ""){
                        var retour = {};
                        var inputElement = $("#"+p_params.idInput);

                        if(inputElement[0].files.length > 0){
                            var data = new FormData();
                            $.each(inputElement[0].files, function(i, file) {
                                data.append('file-'+i, file);
                            });

                            retour = $.Oda.Tooling.sendFile(data, p_params.folder, p_params.name);

                            if(retour.code = "ok"){
                                $.Oda.Display.Notification.success("Upload réussi.");
                            }else{
                                $.Oda.Log.error("Erreur upload : "+retour.message);
                            }
                        }else{
                            $.Oda.Log.error("Erreur pas de fichier sélectionné");
                        }
                    }else{
                        $.Oda.Log.error("Erreur pas d'élement selectionné.");
                    }

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.uploadFile : " + er.message);
                    return null;
                }
            },

            /**
             * @param {type} p_fichiers
             * @param {type} p_dossier
             * @param {type} p_nom
             */
            sendFile : function(p_fichier, p_dossier, p_nom) {
                try {
                    var retour = { appel : "ko", code : "ko", message : "init" };

                    var strUrl = $.Oda.Context.rest+'vendor/happykiller/oda/resources/scriptphp/uploadFile.php?dossier='+p_dossier+'&nom='+p_nom;

                    var ajax = $.ajax({
                        url: strUrl,
                        data: p_fichier,
                        cache: false,
                        contentType: false,
                        processData: false,
                        type: 'POST',
                        async:false,
                        success : function(p_resultat, p_statut){
                            var json_retour = JSON.parse(p_resultat);
                            retour.appel = "ok";
                            retour.code = json_retour["code"];
                            retour.message = json_retour["message"];
                        },
                        error : function(p_resultat, p_statut, p_erreur){
                            var json_retour = JSON.parse(p_resultat);
                            retour.appel = "ko";
                            retour.code = json_retour["code"];
                            retour.message = json_retour["message"];
                        }
                    });

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.sendFile : " + er.message);
                    return null;
                }
            },
            /**
             * @param callback Function
             * @param delay Integer
             * @returns {$.Oda.Tooling}
             */
            throttle : function (callback, delay) {
                try {
                    var now = +new Date();
                    var context = this;
                    var args = arguments;
                    if($.Oda.Tooling.lastThrottle && (now  < $.Oda.Tooling.lastThrottle + delay)){
                        clearTimeout($.Oda.Tooling.timerThrottle);
                        $.Oda.Tooling.timerThrottle = setTimeout(function(){
                            callback.apply(context, args);
                            $.Oda.Tooling.lastThrottle = now;
                        }, delay);
                    }else{
                        callback.apply(context, args);
                        $.Oda.Tooling.lastThrottle = now;
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.throttle : " + er.message);
                    return null;
                }
            },
        },

        I8n : {
            datas : [],
            /**
             * @name get
             * @param {string} p_group
             * @param {string} p_tag
             * @returns {String}
             */
            get : function(p_group, p_tag) {
                try {
                    var returnvalue = "Not define";

                    for (var grpId in $.Oda.I8n.datas) {
                        var grp = $.Oda.I8n.datas[grpId];
                        if(grp.groupName === p_group){
                            var trad = grp[$.Oda.Session.userInfo.locale][p_tag];
                            if(!$.Oda.Tooling.isUndefined(trad)){
                                returnvalue = trad;
                            }
                            break;
                        }
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.get : " + er.message);
                    return null;
                }
            },
            /**
             * @name getByString
             * @param {string} p_group
             * @returns {String}
             */
            getByString: function(p_tag) {
                try {
                    var returnvalue = p_tag;

                    var tab = p_tag.split(".");
                    if((tab.length > 1) && ($.Oda.I8n.get(tab[0], tab[1]) !== "Not define")){
                        return $.Oda.I8n.get(tab[0], tab[1]);
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.getByString : " + er.message);
                    return null;
                }
            }
        },

        Security : {
            /**
             * auth
             * @param {object} p_params
             * @returns {$.Oda}
             */
            auth : function(p_params) {
                try {
                    var tabInput = { "login" : p_params.login, "mdp" : p_params.mdp };
                    var returns = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getAuth.php", {}, tabInput);
                    if(returns.strErreur === ""){
                        var code_user = returns.data.resultat.code_user.toUpperCase();
                        var key = returns.data.resultat.keyAuthODA;

                        var session = {
                            "code_user" : code_user,
                            "key" : key
                        };

                        var tabSetting = { };
                        var tabInput = {
                            code_user : code_user
                        };
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getAuthInfo.php", tabSetting, tabInput);
                        if(retour.strErreur === ""){
                            var userInfo = {
                                "locale" : retour.data.resultat.langue,
                                "firstName" : retour.data.resultat.nom,
                                "lastName" : retour.data.resultat.prenom,
                                "mail" : retour.data.resultat.mail,
                                "profile" : retour.data.resultat.profile,
                                "profileLabel" : retour.data.resultat.labelle,
                                "showTooltip" : retour.data.resultat.montrer_aide_ihm
                            };
                            session.userInfo = userInfo;
                            $.Oda.Storage.set("ODA-SESSION",session,43200);
                            $.Oda.Session = session;

                            $.Oda.Security.loadRight();
                        }else{
                            $.Oda.Storage.remove("ODA-SESSION");
                            $.Oda.Display.Notification.error(returns.strErreur);
                        }
                        $.Oda.Router.routerExit = false;
                        if(p_params.reload){
                            $.Oda.Router.navigateTo();
                        }
                    }else {
                        $.Oda.Display.Notification.error(returns.strErreur);
                    }
                } catch (er) {
                    $.Oda.Log.Log.error("$.Oda.Security.auth : " + er.message);
                    return null;
                }
            },
            /**
             * @name : loadRight
             */
            loadRight : function() {
                try {
                    $.Oda.Router.routesAllowed = $.Oda.Router.routesAllowedDefault.slice(0);
                    var tabInput = { "rang" : $.Oda.Session.userInfo.profile, "id_page" : 0 };
                    var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getMenu.php", {functionRetour : function(data){
                        var datas = data.data.resultat.data;

                        for (var indice in datas) {
                            if((datas[indice].id_categorie !== "1")){
                                var route = datas[indice].Lien;
                                route = route.replace("api_page_","");
                                route = route.replace("page_","");
                                route = route.replace(".html","");
                                $.Oda.Router.routesAllowed.push(route);
                            }
                        }
                    }}, tabInput);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Security.loadRight() : " + er.message);
                }
            },

            /**
             * @name : logout
             */
            logout : function(){
                try {
                    var session = $.Oda.Storage.get("ODA-SESSION");
                    if(session !== null){
                        var tabInput = {
                            "key" : session.key
                        };
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/deleteSession.php", {}, tabInput);
                        $.Oda.Storage.remove("ODA-SESSION");
                    }
                    $.Oda.Session = {
                        "code_user" : "",
                        "key" : "",
                        "userInfo" : {
                            "locale" : "fr",
                            "firstName" : "",
                            "lastName" : "",
                            "mail" : "",
                            "profile" : 0,
                            "profileLabel" : "",
                            "showTooltip" : 0
                        }
                    };
                    $.Oda.Display.MenuSlide.remove();
                    $.Oda.Display.Menu.remove();
                    $.Oda.Router.routes.auth.go();
                    $.Oda.Display.Scene.avatar({callback : function(data){$("#avatar").attr('src',data.src);}});
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Security.logout : " + er.message);
                }
            }
        },

        Controler : {
            Auth : {
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Controler.Auth}
                 */
                start : function (p_params) {
                    try {
                        $.Oda.Scope.Gardian.add({
                            id : "gardianAuth",
                            listElt : ["login", "mdp"],
                            function : function(params){
                                if( ($("#login").data("isOk")) && ($("#mdp").data("isOk")) ){
                                    $("#submit").removeClass("disabled");
                                    $("#submit").removeAttr("disabled");
                                }else{
                                    $("#submit").addClass("disabled");
                                    $("#submit").attr("disabled", true);
                                }
                            }
                        });

                        $.Oda.Google.startSessionAuth(
                            function(){
                                $('#google').html('<button type="button" onclick="$.Oda.Controler.Auth.goInWithGoogle();" class="btn btn-danger center-block">'+$.Oda.I8n.get("oda-main","bt-google")+'</button>');
                            }
                            , function(){
                                $('#google').html('<button type="button" onclick="$.Oda.Google.callServiceGoogleAuth($.Oda.Controler.Auth.goInWithGoogle);" class="btn btn-danger center-block">'+$.Oda.I8n.get("oda-main","bt-google")+'</button>');
                            }
                        );
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Controler.Auth.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Controler.Auth}
                 */
                goIn : function (p_params) {
                    try {
                        $.Oda.Security.auth({'login' : $('#login').val(), 'mdp' : $('#mdp').val(), 'reload' : true});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Controler.Auth.goIn : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Controler.Auth}
                 */
                goInWithGoogle : function (p_params) {
                    try {
                        gapi.client.oauth2.userinfo.get().execute(function(resp) {
                            var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/phpsql/getAccountsFromEmail.php", {}, { "email" : resp.email});
                            if(retour.strErreur == ""){
                                if(retour.data.nombre == 0){
                                    $.Oda.Display.Notification.warning("Pas de compte rattach&eacute; à l'email : "+resp.email);
                                }else if(retour.data.nombre == 1){
                                    $.Oda.Security.auth({"login" : retour.data.data[0].code_user, "mdp" : "authByGoogle-"+resp.email, "reload" : true});
                                }else {
                                    var strHtml = '<div class="list-group"">';
                                    for (var indice in retour.data.data) {
                                        var elt = retour.data.data[indice];
                                        strHtml += "<a class=\"list-group-item\" href=\"javascript:$.Oda.Security.auth({'login' : '"+elt.code_user+"', 'mdp' : '"+"authByGoogle-"+resp.email+"', 'reload' : true});\">"+elt.code_user+"</a>";
                                    }
                                    strHtml += '</div>';
                                    $.Oda.Display.Popup.open({"label" : "Choisir le compte.", "details" : strHtml});
                                }
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Controler.Auth.goInWithGoogle : " + er.message);
                        return null;
                    }
                },
            },
            Contact : {
                /**
                 * saisirContact
                 *
                 * @param {type} p_reponse
                 * @param {type} p_message
                 */
                contact: function (p_reponse, p_message) {
                    try {
                        var contact_mail_administrateur = $.Oda.Interface.getParameter("contact_mail_administrateur");
                        if (contact_mail_administrateur !== "") {
                            var tabInput = {
                                "reponse": p_reponse,
                                "message": p_message,
                                "code_user": $.Oda.Session.code_user
                            };
                            var result = $.Oda.Interface.callRest($.Oda.Context.rest + "vendor/happykiller/oda/resources/phpsql/insertContact.php", {}, tabInput);
                            if (result.strErreur === "") {
                                var message_html = "";
                                var sujet = "";

                                message_html = "";
                                message_html += "<html><head></head><body>";
                                message_html += "De : <pre>" + $.Oda.Session.code_user + "</pre>";
                                message_html += "</br></br>";
                                message_html += "Contact : <pre>" + p_reponse + "</pre>";
                                message_html += "</br></br>";
                                message_html += "Message : <pre>" + p_message + "</pre>";
                                message_html += "</body></html>";

                                sujet = "[ODA-" + $.Oda.Interface.getParameter("nom_site") + "]Nouveau contact.";

                                var paramsMail = {
                                    email_mail_ori: contact_mail_administrateur,
                                    email_labelle_ori: "Service Mail ODA",
                                    email_mail_reply: contact_mail_administrateur,
                                    email_labelle_reply: "Service Mail ODA",
                                    email_mails_dest: contact_mail_administrateur,
                                    message_html: message_html,
                                    sujet: sujet
                                };

                                var retour = $.Oda.Interface.sendMail(paramsMail);

                                $("#mail").val("");
                                $("#name").val("");
                                $("#msg").val("");

                                if (retour) {
                                    $.Oda.Display.Notification.success("Demande bien soummise sous l'identifiant n&ordm;" + result.data.resultat + ".");
                                }
                            } else {
                                $.Oda.Display.Notification.error(result.strErreur);
                            }
                        } else {
                            $.Oda.Display.Notification.error("Mail du service non définie.");
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.contact() : " + er.message);
                    }
                }
            },
            Profile : {
                /**
                 * @param {Object} p_params
                 * @param p_params.elt
                 * @returns {$.Oda.Controler.Profile.setAvatar}
                 */
                setAvatar : function (p_params) {
                    try {
                        $.Oda.Tooling.uploadFile({idInput : p_params.elt.id, folder : "avatars/", name : $.Oda.Session.code_user + ".png"});
                        $.Oda.Display.Scene.avatar({callback : function(data){
                            $("#avatar").attr('src',data.src);
                            $("#img_avatar").html('<img src="'+data.src+'" alt="Savatar" height="42" width="42">');
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Controler.Profile.setAvatar : " + er.message);
                        return null;
                    }
                },
            }
        },

        Worker : {
            lib : function(){
                this.$Oda = {
                    Context : {
                        rest : "$$REST$$"
                    },

                    Session : {
                        code_user : "$$CODEUSER$$",
                        key : "$$ODAKEY$$"
                    },

                    message : function(cmd, parameter){
                        try {
                            this.cmd = cmd;
                            this.parameter = parameter;
                        } catch (er) {
                            $Oda.log("ERROR($Oda.message : " + er.message);
                        }
                    },

                    log : function(msg){
                        console.log(msg);
                    },

                    callRest: function(p_url, p_tabSetting, p_tabInput) {
                        try {
                            var jsonAjaxParam = {
                                url : p_url,
                                contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
                                dataType : 'json',
                                type : 'GET'
                            };

                            p_tabInput.milis = this.getMilise();
                            p_tabInput.ctrl = "OK";
                            p_tabInput.keyAuthODA = this.Session.key;

                            jsonAjaxParam.data = p_tabInput;

                            //traitement determinant async ou pas
                            var async = true;
                            if(p_tabSetting.functionRetour === null){
                                async = false;
                                jsonAjaxParam.async = false;
                            }

                            for(var indice in p_tabSetting){
                                jsonAjaxParam[indice] = p_tabSetting[indice];
                            }

                            //si retour synchron init retour
                            var v_retourSync = null;

                            //Utilisé notament pour les workers qui ne peuvent avoir Jquey et donc Ajax
                            var xhr_object = new XMLHttpRequest();

                            switch (jsonAjaxParam.type){
                                case "GET":
                                case "get":
                                    var url = jsonAjaxParam.url+"?tag=1";

                                    for(var key in jsonAjaxParam.data){
                                        var param = jsonAjaxParam.data[key].toString();
                                        url += "&"+key+"="+(param.replace(new RegExp("&", "g"), '%26'));
                                    }

                                    xhr_object.open(jsonAjaxParam.type, url, false);
                                    xhr_object.send(null);
                                    break;
                                case "POST":
                                case "post":
                                default:
                                    var params = "tag=1";
                                    for(var key in jsonAjaxParam.data){
                                        var param = jsonAjaxParam.data[key].toString();
                                        params += "&"+key+"="+(param.replace(new RegExp("&", "g"), '%26'));
                                    }

                                    xhr_object.open(jsonAjaxParam.type,jsonAjaxParam.url, false);
                                    xhr_object.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                                    xhr_object.send(params);
                                    break;
                            }

                            v_retourSync =  {"strErreur": "No call", "data": {}, "statut": 4};
                            switch (jsonAjaxParam.dataType) {
                                case "json":
                                    if (xhr_object.readyState === 4 && xhr_object.status === 200) {
                                        v_retourSync = JSON.parse(xhr_object.responseText);
                                    } else {
                                        v_retourSync = {"strErreur": "$Oda.callRest : " + xhr_object.status + " " + xhr_object.statusText, "data": {}, "statut": 4};
                                    }
                                    break;
                                case "text":
                                default:
                                    if (xhr_object.readyState === 4) {
                                        v_retourSync = xhr_object.responseText;
                                    } else {
                                        v_retourSync = "$Oda.callRest : " + xhr_object.status + " " + xhr_object.statusText;
                                    }
                                    break;
                            }

                            delete self.xhr_object;

                            return v_retourSync;
                        } catch (er) {
                            var msg = "ERROR($Oda.callRest) : " + er.message;
                            $Oda.log(msg);
                            return null;
                        }
                    },

                    /**
                     * @name getMilise
                     * @returns {string}
                     */
                    getMilise : function() {
                        try {
                            var d = new Date();
                            return d.getTime();
                        } catch (er) {
                            $Oda.log("ERROR($Oda.getMilise) : " + er.message);
                            return null;
                        }
                    },

                    /**
                     * arrondir
                     * @param {float|int} p_value
                     * @param {int} p_precision
                     * @returns {float|int}
                     */
                    arrondir : function(p_value, p_precision){
                        try {
                            var retour = 0;
                            var coef = Math.pow(10, p_precision);

                            if(coef !== 0){
                                retour = Math.round(p_value*coef)/coef;
                            }else{
                                retour = Math.round(p_value);
                            }

                            return retour;
                        } catch (er) {
                            $Oda.log("ERROR($Oda.arrondir) : " + er.message);
                            return null;
                        }
                    }
                };
            },

            message : function(cmd, parameter){
                try {
                    this.cmd = cmd;
                    this.parameter = parameter;
                } catch (er) {
                    $.Oda.Log.error("$Oda.message : " + er.message);
                }
            },

            /**
             * @name initWorker
             * @desc pour initialiser un worker
             * @param {string} p_nameWorker
             * @param {string} p_fonctionRetour
             * @returns {Worker}
             */
            initWorker : function(p_nameWorker, p_dataInit, p_functionCore, p_fonctionRetour) {
                try {
                    var strFunctionLib = $.Oda.Worker.lib.toString();
                    strFunctionLib = strFunctionLib.substring(12);
                    strFunctionLib = strFunctionLib.substring(0, strFunctionLib.length - 1);
                    strFunctionLib = strFunctionLib.replace("$$CODEUSER$$",$.Oda.Session.code_user);
                    strFunctionLib = strFunctionLib.replace("$$ODAKEY$$",$.Oda.Session.key);
                    strFunctionLib = strFunctionLib.replace("$$REST$$",$.Oda.Context.rest);

                    var strFunctionCore = p_functionCore.toString();
                    strFunctionCore = strFunctionCore.substring(12);
                    strFunctionCore = strFunctionCore.substring(0, strFunctionCore.length - 1);

                    var blob = new Blob([strFunctionLib+strFunctionCore], {type: 'application/javascript'});

                    var monWorker = new Worker(window.URL.createObjectURL(blob));

                    monWorker.addEventListener("message", function (event) {
                        p_fonctionRetour(event.data);
                    }, false);

                    return monWorker;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Worker.initWorker : " + er.message);
                }
            },

            /**
             * @name terminateWorker
             * @desc pour finir le worker
             * @param {type} p_worker
             * @returns {undefined}
             */
            terminateWorker : function(p_worker) {
                try {
                    // On aurait pu créer une commande 'stop' qui aurait été traitée
                    // au sein du worker qui se serait fait hara-kiri via .close()
                    p_worker.terminate();
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Worker.terminateWorker : " + er.message);
                }
            }
        },

        Tuto : {
            enable : true,

            currentElt : "",

            listElt : [],

            start : function (){
                try {
                    if($.Oda.Tuto.enable){
                        $('[oda-tuto]').each(function(index, value){
                            var theTuto = {};
                            var def = $(value).attr("oda-tuto");
                            var tabDef = def.split(";");
                            for(var indice in tabDef){
                                var elt = tabDef[indice];
                                var prop = elt.split(":");
                                if(prop[1] !== undefined){
                                    theTuto[prop[0]] = prop[1];
                                }
                            }

                            if(!$.Oda.Tuto.listElt.hasOwnProperty(theTuto.id)){
                                $.Oda.Tuto.listElt[theTuto.id] = {"id" : theTuto.id, "enable" : true, "props" : theTuto};
                            }

                            var sessionTuto = $.Oda.Storage.get("ODA-TUTO-"+$.Oda.Session.code_user, {});
                            if(sessionTuto.hasOwnProperty(theTuto.id)){
                                $.Oda.Tuto.listElt[theTuto.id].enable = sessionTuto[theTuto.id];
                            }else{
                                sessionTuto[theTuto.id] = true;
                                $.Oda.Storage.set("ODA-TUTO-"+$.Oda.Session.code_user, sessionTuto);
                            }

                            if(($.Oda.Tuto.listElt[theTuto.id].enable)&&($.Oda.Tuto.currentElt === "")){
                                $.Oda.Tuto.show(theTuto.id);
                            }
                        });
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tuto.start : " + er.message);
                }
            },

            readed : function(id){
                try {
                    $.Oda.Tuto.listElt[id].enable = false;

                    var sessionTuto = $.Oda.Storage.get("ODA-TUTO-"+$.Oda.Session.code_user);
                    sessionTuto[id] = false;
                    $.Oda.Storage.set("ODA-TUTO-"+$.Oda.Session.code_user, sessionTuto);

                    $("[oda-tuto^='id:"+id+"']").tooltip('destroy');
                    for(var elt in $.Oda.Tuto.listElt){
                        if($.Oda.Tuto.listElt[elt].enable){
                            this.show(elt);
                            break;
                        }
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tuto.readed : " + er.message);
                }
            },

            show : function (id){
                try {
                    var elt = $("[oda-tuto^='id:"+id+"']");

                    $.Oda.Tuto.currentElt = id;

                    elt.attr("data-toggle","tooltip");
                    if($.Oda.Tuto.listElt[id].props.hasOwnProperty("location")){
                        elt.attr("data-placement",$.Oda.Tuto.listElt[id].props.location);
                    }
                    elt.attr("data-html",true);

                    var strHtml = $('[oda-tuto-content='+id+']').html();

                    if($.Oda.Tuto.listElt[id].props.hasOwnProperty("bt-next")){
                        strHtml += "";
                    }
                    strHtml += '<br><button type="button" onclick="$.Oda.Tuto.readed(\''+id+'\');" class="btn btn-info btn-xs">Readed</button >';
                    elt.attr("title",strHtml);
                    elt.on('hidden.bs.tooltip', function () {
                        $.Oda.Tuto.enable = false;
                        elt.tooltip('destroy');
                    });

                    elt.tooltip('show');
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tuto.show : " + er.message);
                }
            }
        },

        Scope : {
            /**
             * @param {Object} p_params
             * @param p_params.str
             * @exemple $.Oda.Scope.transform({str:"<span oda-label='oda-main.logout'>logout</span>"});
             * @returns {String}
             */
            transform : function (p_params) {
                try {
                    var strReturn = '';

                    $(" body ").append('<div id="tmp_scopeTransform" style="display: none;"></div>');

                    $("#tmp_scopeTransform").html(p_params.str);
                    $.Oda.Scope.init({id:'tmp_scopeTransform'});
                    strReturn = $("#tmp_scopeTransform").html();

                    $("#tmp_scopeTransform").remove();

                    return strReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.transform : " + er.message);
                    return null;
                }
            },

            /**
             * @param {Object} p_params
             * @param p_params.id
             * @returns {undefined}
             */
            init : function(p_params){
                try {
                    var divTarget = "";
                    if(!$.Oda.Tooling.isUndefined(p_params)){
                        divTarget = '#'+p_params.id+' ';
                    }

                    //oda-loading
                    $(divTarget+'oda-loading').each(function(index, value){
                        $.Oda.Display.loading({elt : $(value)});
                    });

                    //oda-input-text
                    $(divTarget+'[oda-input-text]').each(function(index, value){
                        var id = $(value).attr("oda-input-text");

                        $(value).attr("id",id);
                        $(value).attr("name",id);

                        $.Oda.Scope.checkInputText({elt:value});

                        //TODO use debounce ?
                        $(value).bind("keyup mouseup",function(elt){
                            $.Oda.Scope.checkInputText({elt:elt.target});
                            $.Oda.Scope.Gardian.findByElt({id : elt.target.id});
                        });

                        var placeHolder = $(value).attr("oda-input-text-placeholder");
                        if(placeHolder !== undefined){
                            var tab = placeHolder.split(".");
                            if((tab.length > 1) && ($.Oda.I8n.get(tab[0], tab[1]) !== "Not define")){
                                $(value).attr("placeholder", $.Oda.I8n.get(tab[0], tab[1]));
                            }
                        }

                        var odaTips = $(value).attr("oda-input-text-tips");
                        if(odaTips !== undefined){
                            var tab = odaTips.split(".");
                            if((tab.length > 1) && ($.Oda.I8n.get(tab[0], tab[1]) !== "Not define")){
                                $(value).after('<span style="color : #a1a1a1;" id="span-'+id+'">&nbsp;</span>');
                                $(value).focus(function() {
                                    $("#span-"+id).html($.Oda.I8n.get(tab[0], tab[1]));
                                });
                                $(value).focusout(function() {
                                    $("#span-"+id).html("&nbsp;");
                                });
                            }
                        }
                    });

                    //oda-input-select
                    $(divTarget+'[oda-input-select]').each(function(index, value){
                        var id = $(value).attr("oda-input-select");

                        $(value).attr("id",id);
                        $(value).attr("name",id);

                        $.Oda.Scope.checkInputSelect({elt:value});
                        $(value).change(function(elt){
                            $.Oda.Scope.checkInputSelect({elt:elt.target});
                            $.Oda.Scope.Gardian.findByElt({id : elt.target.id});
                        });
                    });

                    //oda-label
                    $(divTarget+'[oda-label]').each(function(index, value){
                        var labelName = $(value).attr("oda-label");
                        var tab = labelName.split(".");
                        $(value).html($.Oda.I8n.get(tab[0], tab[1]));
                    });

                    //oda-submit
                    $(divTarget+'[oda-submit]').each(function(index, value){
                        var id = $(value).attr("oda-submit");

                        $(value).attr("id",id);

                        $(document).unbind("keypress");

                        $(document).keypress(function(e) {
                            if(e.which === 13) {
                                if(!$(value).hasClass("disabled")){
                                    $(value).click();
                                }
                            }
                        });
                    });
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.init : " + er.message);
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.elt
             * @returns {$.Oda.Scope}
             */
            checkInputText: function (p_params) {
                try {
                    var $elt = $(p_params.elt);
                    var required = !$.Oda.Tooling.isUndefined($elt.attr("required"));
                    if(required && (($elt.val() === undefined) || ($elt.val() === ""))){
                        $elt.data("isOk", false);
                        $elt.css("border-color","#FF0000");
                    }else{
                        var odaCheck = $elt.attr("oda-input-text-check");
                        if(odaCheck !== undefined){
                            if(odaCheck.startsWith("Oda.Regexs:")){
                                odaCheck = odaCheck.replace("Oda.Regexs:", '');
                                odaCheck = $.Oda.Regexs[odaCheck];
                            }

                            var patt = new RegExp(odaCheck, "g");
                            var res = patt.test($elt.val());
                            if(res){
                                $elt.data("isOk", true);
                                $elt.css("border-color","#04B404");
                            }else{
                                $elt.data("isOk", false);
                                $elt.css("border-color","#FF0000");
                            }
                        }
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.checkInputText : " + er.message);
                    return null;
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.elt
             * @returns {$.Oda.Scope.checkInputSelect}
             */
            checkInputSelect : function (p_params) {
                try {
                    var $elt = $(p_params.elt);
                    var required = !$.Oda.Tooling.isUndefined($elt.attr("required"));
                    if(required && (($elt.val() === undefined) || ($elt.val() === ""))){
                        $elt.data("isOk", false);
                        $elt.css("border-color","#FF0000");
                    }else{
                        $elt.data("isOk", true);
                        $elt.css("border-color","#04B404");
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.checkInputSelect : " + er.message);
                    return null;
                }
            },
            Gardian : {
                inventory : {},
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @param p_params.listElt
                 * @param p_params.function
                 * @returns {$.Oda.Scope}
                 */
                add : function (p_params) {
                    try {
                        $.Oda.Scope.Gardian.inventory[p_params.id] = {
                            listElt : p_params.listElt,
                            function : p_params.function
                        };
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.add : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Scope}
                 */
                remove : function (p_params) {
                    try {
                        $.each($.Oda.Scope.Gardian.inventory, function( key, value ) {
                            delete $.Oda.Scope.Gardian.inventory[key];
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.remove : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.Scope}
                 */
                removeAll : function () {
                    try {
                        $.Oda.Scope.Gardian.inventory = {};
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.removeAll : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Scope}
                 */
                findByElt : function (p_params) {
                    try {
                        $.each($.Oda.Scope.Gardian.inventory, function( key, value ) {
                            if($.Oda.Tooling.isInArray(p_params.id, value.listElt)){
                                value.function({elt : p_params.id});
                            };
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.findByElt : " + er.message);
                        return null;
                    }
                },
            }
        },

        Storage : {
            /* Version number */
            version : VERSION,
            ttl_default : 86400, //24H
            storageKey : "ODA__default__",

            /**
             *
             * @returns {Boolean}
             */
            isStorageAvaible: function(){
                try {
                    var boolRetour = false;

                    if (localStorage) {
                        boolRetour = true;
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.isStorageAvaible : " + er.message);
                    return null;
                }
            },

            /**
             *
             * @param {string} p_key
             * @param {json} p_value
             * @param {integer} p_ttl in seconde
             * @returns {Boolean}
             */
            set: function(p_key, p_value, p_ttl) {
                try {
                    var boolRetour = true;

                    var d = new Date();
                    var date = d.getTime();

                    var ttl = 0;
                    if(typeof(p_ttl) !== 'undefined'){
                        ttl = p_ttl;
                    }

                    var storage = {
                        "value" : p_value,
                        "recordDate" : date,
                        "ttl" : ttl
                    };

                    if(boolRetour){
                        var data = JSON.stringify(storage);
                        var compressed = LZString.compress(data);
                        localStorage.setItem(this.storageKey+p_key, compressed);
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.set : " + er.message);
                    return null;
                }
            },

            get: function(p_key, p_default) {
                try {
                    var myValue = null;

                    var compressed = localStorage.getItem($.Oda.Storage.storageKey+p_key);
                    if(compressed !== null){
                        var data = LZString.decompress(compressed);
                        var myStorage = JSON.parse(data);

                        myValue = myStorage.value;

                        if((myStorage.value !== null)&&(myStorage.ttl !== 0)){
                            var d = new Date();
                            var date = d.getTime();

                            var dateTimeOut = myStorage.recordDate + (myStorage.ttl*1000);

                            if(date > dateTimeOut){
                                this.remove(p_key);
                                myValue = null;
                            }
                        }

                        if((myValue === null)&&(typeof(p_default) !== 'undefined')){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }else{
                        if(typeof(p_default) !== 'undefined'){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }

                    return myValue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.get : " + er.message);
                    return null;
                }
            },

            setTtl: function(p_key, p_ttl) {
                try {
                    var myValue = $.Oda.Storage.get(p_key);

                    var d = new Date();
                    var date = d.getTime();

                    var storage = {
                        "value" : myValue,
                        recordDate : date,
                        ttl : p_ttl
                    };

                    var myReturn = $.Oda.Storage.set($.Oda.Storage.storageKey+p_key, storage);

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.setTtl : " + er.message);
                    return null;
                }
            },

            getTtl: function(p_key) {
                try {
                    var myReturn = 0;

                    var myStorage = $.Oda.Storage.get($.Oda.Storage.storageKey+p_key);

                    if(myStorage !== null){

                        var d = new Date();
                        var date = d.getTime();

                        var dateTimeOut = myValue.recordDate + (myValue.ttl*1000);

                        myReturn = dateTimeOut - date;

                        if(myReturn < 0){
                            myReturn = 0;
                        }
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.getTtl : " + er.message);
                    return null;
                }
            },

            remove: function(p_key) {
                try {
                    var myReturn = true;

                    localStorage.removeItem($.Oda.Storage.storageKey+p_key);

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.setTtl : " + er.message);
                    return null;
                }
            },

            reset: function() {
                try {
                    var myReturn = true;

                    for (var indice in localStorage) {
                        localStorage.removeItem(indice);
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.reset : " + er.message);
                    return null;
                }
            },

            getIndex: function(p_filtre) {
                try {
                    var myReturn = [];

                    var patt = new RegExp($.Oda.Storage.storageKey+p_filtre, 'gi');

                    for (var indice in localStorage) {
                        var res = patt.test(indice);
                        if(res){
                            myReturn.push(indice);
                        }
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.getIndex : " + er.message);
                    return null;
                }
            }
        },

        Router : {
            current : {
                route : "",
                args : []
            },

            routes : {},

            routerExit : false,

            routesAllowed : [],

            routeDependencies : [],

            routesAllowedDefault : [],

            MiddleWares : {},

            /**
             * navigateTo
             * @param {object} p_request
             * @returns {$.Oda.Router}
             */
            navigateTo : function(p_request) {
                try {
                    $.Oda.Display.Popup.closeAll();

                    $.Oda.Router.routerExit = false;

                    if($.Oda.Tooling.isUndefined(p_request)){
                        p_request = $.Oda.Router.current;
                    }

                    for(var name in $.Oda.Router.routes){
                        for(var indice in $.Oda.Router.routes[name].urls){
                            var url = $.Oda.Router.routes[name].urls[indice];
                            if(url === p_request.route){
                                $.Oda.Router.current = p_request;

                                if($.Oda.Session.code_user !== ""){
                                    $.Oda.Interface.addStat($.Oda.Session.code_user, $.Oda.Router.current.route, "request");
                                }

                                $.Oda.Router.routes[name].go(p_request);

                                if ($('#wrapper').exists()) {
                                    $("#wrapper").removeClass("toggled");
                                }
                                return this;
                            }
                        }
                    }

                    $.Oda.Log.error(p_request.route + " not found.");
                    $.Oda.Router.routes["404"].go(p_request);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.navigateTo : " + er.message);
                    return null;
                }
            },
            /**
             * addRoute
             * @param {String} name description
             * @param {object} p_routeDef
             * @returns {$.Oda.Router}
             */
            addRoute : function(p_name, p_routeDef) {
                try {
                    if(!p_routeDef.hasOwnProperty("system")){
                        p_routeDef.system = false;
                    }
                    p_routeDef.go = function(p_request){
                        $.Oda.Router.routerGo({"routeDef" : this, "request" : p_request});
                    };
                    if(!p_routeDef.hasOwnProperty("middleWares")){
                        p_routeDef.middleWares = [];
                    }
                    if(!p_routeDef.hasOwnProperty("dependencies")){
                        p_routeDef.dependencies = [];
                    }
                    $.Oda.Router.routes[p_name] = p_routeDef;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.addRoute : " + er.message);
                    return null;
                }
            },
            /**
             * addMiddleWare
             * @param {string} p_name
             * @param {object} p_midlleWareDef
             * @returns {$.Oda.Router}
             */
            addMiddleWare : function(p_name, p_midlleWareDef) {
                try {
                    $.Oda.Router.MiddleWares[p_name] = p_midlleWareDef;
                    $.Oda.Router.MiddleWares[p_name].name = p_name;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.addMiddleWare : " + er.message);
                    return null;
                }
            },
            /**
             * addDependencies
             * @param {string} p_name
             * @param {object} p_dependenciesLoad
             * @returns {$.Oda.Router}
             */
            addDependencies : function(p_name, p_dependenciesLoad) {
                try {
                    p_dependenciesLoad.name = p_name;
                    $.Oda.Router.routeDependencies[p_name] = p_dependenciesLoad;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.addDependencies : " + er.message);
                    return null;
                }
            },

            /**
             *
             * @param {Object} p_params
             * @returns {$.Oda.Router}
             */
            loadPartial : function(p_params) {
                try {
                    $.get(p_params.routeDef.path, function(data) {
                        $('#'+$.Oda.Context.mainDiv).html(data);
                        $.Oda.Scope.init({id:$.Oda.Context.mainDiv});
                        if($.Oda.Session.code_user !== ""){
                            $.Oda.Tuto.start();
                        }
                    })
                        .fail(function(){
                            $.Oda.Log.error("$.Oda.Router.loadPartial : " + p_params.routeDef.path + " not found.");
                        });
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.loadPartial : " + er.message);
                    return null;
                }
            },

            /**
             *
             * @returns {$.Oda.Router}
             */
            startRooter : function() {
                try {
                    if($("#projectLabel").exists()){
                        $("#projectLabel").text($.Oda.Context.projectLabel);
                    }

                    if(!$("#"+ $.Oda.Context.mainDiv).exists()){
                        $(" body ").append('<!-- content --><div id="'+ $.Oda.Context.mainDiv + '" class="container" style="padding-top:40px;"><oda-loading></oda-loading></div>');
                    }

                    var hash = decodeURI($.Oda.Context.window.location.hash.substring(1).replace(/\?(.*)$/, ''));
                    var loc = $.Oda.Context.window.location + '';
                    var locationRacine = loc.replace(/#(.*)$/, '').replace(/\?(.*)$/, '')+'#';

                    var paramsGet = $.Oda.Tooling.getParameterGet({url: decodeURI($.Oda.Context.window.location)});

                    var obj = { Page: hash, Url: locationRacine };
                    $.Oda.Context.window.history.pushState(obj, obj.Page, obj.Url);

                    $.Oda.Router.current = {
                        route: hash,
                        args: paramsGet
                    };

                    this.navigateTo($.Oda.Router.current);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.startRooter : " + er.message);
                    return null;
                }
            },

            /**
             * go
             * @param {object} p_params description
             * @returns {$.Oda.Router}
             */
            routerGo : function(p_params) {
                try {
                    $.Oda.Log.debug("RouterGo : " + p_params.routeDef.path);

                    $.Oda.Display.loading({elt:$('#' + $.Oda.Context.mainDiv)});

                    //HASH
                    if (!p_params.routeDef.system) {
                        var urlRoute = $.Oda.Router.current.route;
                        var urlArg = "";
                        for (var key in $.Oda.Router.current.args) {
                            if (($.Oda.Router.current.args[key] !== "getUser") && ($.Oda.Router.current.args[key] !== "getPass")) {
                                if (urlArg === "") {
                                    urlArg += "?";
                                } else {
                                    urlArg += "&";
                                }
                                urlArg += key + "=" + $.Oda.Router.current.args[key];
                            }
                        }
                        $.Oda.Context.window.location.hash = urlRoute + urlArg;

                        var decoded = $.Oda.Tooling.decodeHtml($.Oda.I8n.getByString(p_params.routeDef.title));

                        $.Oda.Context.window.document.title = $.Oda.Context.projectLabel + " - " + decoded;
                    }

                    // DEPENDENCIES
                    var listDepends = [];
                    for (var indice in p_params.routeDef.dependencies) {
                        listDepends = listDepends.concat($.Oda.Router.routeDependencies[p_params.routeDef.dependencies[indice]]);
                    }

                    $.Oda.Loader.load({ depends : listDepends, functionFeedback : function(data){
                        //exec middleware
                        if (data.params.routeDef.middleWares.length > 0) {
                            for (var indice in data.params.routeDef.middleWares) {
                                $.Oda.Router.MiddleWares[data.params.routeDef.middleWares[indice]]();
                            }
                        }

                        if (($.Oda.Router.routerExit) && (!data.params.routeDef.system)) {
                            return true;
                        }

                        //load menus
                        if (($.Oda.Context.ModeExecution.scene) && ($.Oda.Session.code_user !== "")) {
                            $.Oda.Display.MenuSlide.show();
                            $.Oda.Display.Menu.show();
                            $.Oda.Display.Scene.avatar({callback : function(data){$("#avatar").attr('src',data.src);}});
                        }

                        //show message
                        if (($.Oda.Context.ModeExecution.message) && ($.Oda.Session.code_user !== "")) {
                            $.Oda.Display.Message.show();
                        }

                        //reset gardians
                        $.Oda.Scope.Gardian.removeAll();

                        //call content
                        $.Oda.Router.loadPartial({"routeDef" : data.params.routeDef});
                    }, functionFeedbackParams : {params : p_params}});

                    return true;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.routerGo : " + er.message);
                    return null;
                }
            }
        },

        Google : {
            gapiStatuts : {
                "zero" : 0,
                "init" : 1,
                "loaded" : 2,
                "finish" : 3,
                "fail" : 4
            },
            gapiStatut : 0,
            gapi : null,
            clientId : "249758124548-fgt33dblm1r8jm0nh9snn53pkghpjtsu.apps.googleusercontent.com",
            apiKey : "PgCsKeWAsVGdOj3KjPn-JPS3",
            scopes : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            trySessionAuth : 0,
            methodeSessionAuthKo : null,
            methodeSessionAuthOk : null,
            sessionInfo : null,
            gaips : [],

            init : function () {
                try {
                    switch($.Oda.Google.gapiStatut) {
                        case $.Oda.Google.gapiStatuts.zero :
                            $.Oda.Google.gapiStatut = $.Oda.Google.gapiStatuts.init;
                            $.getScript("https://apis.google.com/js/client.js?onload=handleClientLoad",function(){
                                $.Oda.Google.handleClientLoad();
                            });
                            break;
                        case $.Oda.Google.gapiStatuts.loaded :
                            $.Oda.Log.debug("$.Oda.Google.init : already load.");
                            break;
                        default:
                            $.Oda.Log.error("$.Oda.Google.init : client load fail.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.init :" + er.message);
                }
            },
            handleClientLoad : function() {
                try {
                    if(gapi.hasOwnProperty("client")) {
                        $.Oda.Google.gapi = gapi;
                        $.Oda.Google.gapiStatut = $.Oda.Google.gapiStatuts.loaded;
                        $.Oda.Event.send({name : "oda-gapi-loaded"});
                        $.Oda.Log.debug("$.Oda.Google.handleClientLoad : finish.");
                    }else{
                        $.Oda.Log.debug("$.Oda.Google.handleClientLoad : waiting (gapi.client not loaded)");
                        $.Oda.Tooling.timeout($.Oda.Google.handleClientLoad,100);
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.handleClientLoad :" + er.message);
                }
            },
            startSessionAuth : function(methodOk, methodKo){
                try {
                    if(!$.Oda.Tooling.isUndefined(methodOk)){
                        $.Oda.Google.methodeSessionAuthOk = methodOk;
                    }
                    if(!$.Oda.Tooling.isUndefined(methodKo)){
                        $.Oda.Google.methodeSessionAuthKo = methodKo;
                    }

                    switch($.Oda.Google.gapiStatut) {
                        case $.Oda.Google.gapiStatuts.zero :
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth : waiting (gapi not start)");
                            $.Oda.Google.init();
                            $.Oda.Event.addListener({name : "oda-gapi-loaded", callback : function(e){
                                $.Oda.Google.startSessionAuth();
                            }});
                            break;
                        case $.Oda.Google.gapiStatuts.loaded :
                            $.Oda.Google.loadGapis([{
                                "api": "oauth2",
                                "version": "v2"
                            }], $.Oda.Google.callbackAuthSession);
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth : finish.");
                            break;
                        case $.Oda.Google.gapiStatuts.init :
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth : waiting (gapi not loaded)");
                            $.Oda.Tooling.timeout($.Oda.Google.startSessionAuth,100);
                            break;
                        default:
                            $.Oda.Log.error("$.Oda.Google.startSessionAuth : $.Oda.Google.gapi problem.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.startSessionAuth : " + er.message);
                }
            },
            loadGapis : function(tabApi, callbackFunction) {
                try {
                    if (tabApi.length > 0) {
                        for (var indice in $.Oda.Google.gaips) {
                            if (($.Oda.Google.gaips[indice].api === tabApi[0].api) && ($.Oda.Google.gaips[indice].version === tabApi[0].version)) {
                                $.Oda.Log.debug('$.Oda.Google.loadGapis : Already ok pour ' + tabApi[0].api + " en " + tabApi[0].version);
                                tabApi.splice(0, 1);
                                $.Oda.Google.loadGapis(tabApi, callbackFunction);
                                return true;
                            }
                        }

                        $.Oda.Google.gapi.client.load(tabApi[0].api, tabApi[0].version, function (resp) {
                            if (typeof resp === "undefined") {
                                $.Oda.Google.gaips.push({"api": tabApi[0].api, "version": tabApi[0].version});
                                $.Oda.Log.debug('$.Oda.Google.loadGapis : Chargement ok pour ' + tabApi[0].api + " en " + tabApi[0].version);
                                tabApi.splice(0, 1);
                                $.Oda.Google.loadGapis(tabApi, callbackFunction);
                            } else {
                                $.Oda.Log.debug('$.Oda.Google.loadGapis : Chargement ko pour ' + tabApi[0].api + " en " + tabApi[0].version + "(" + resp.error.message + ")");
                            }
                        });
                    } else {
                        $.Oda.Log.debug("$.Oda.Google.loadGapis : finish.");
                        callbackFunction();
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.loadGapis :" + er.message);
                }
            },
            callbackAuthSession : function(){
                try {
                    $.Oda.Google.gapi.client.setApiKey($.Oda.Google.apiKey);
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": true}, $.Oda.Google.handleAuthResult);
                    $.Oda.Log.debug("$.Oda.Google.callbackAuthSession finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.callbackAuthSession :" + er.message);
                }
            },
            handleAuthResult : function(authResult) {
                try {
                    if ((authResult) && (!authResult.error) && (authResult.access_token !== undefined)) {
                        $.Oda.Google.sessionInfo = authResult;
                        $.Oda.Google.methodeSessionAuthOk();
                    } else {
                        $.Oda.Google.methodeSessionAuthKo();
                    }
                    $.Oda.Log.debug("$.Oda.Google.handleAuthResult finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.handleAuthResult :" + er.message);
                }
            },
            callServiceGoogleAuth : function(callMethodeOk) {
                try {
                    $.Oda.Google.methodeSessionAuthOk = callMethodeOk;
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": false}, $.Oda.Google.handleAuthResult);
                    $.Oda.Log.debug("$.Oda.Google.callServiceGoogleAuth finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.callServiceGoogleAuth :" + er.message);
                }
            }
        },

        /**
         * log
         * @param {int} p_type
         * @param {string} p_msg
         * @returns {boolean}
         */
        Log : {
            "info" : function(p_msg) {
                try {
                    $.Oda.Context.console.info(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.info : " + er.message);
                    return null;
                }
            },
            "trace" : function(p_msg) {
                try {
                    $.Oda.Context.console.log(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.trace : " + er.message);
                    return null;
                }
            },
            "debug" : function(p_msg) {
                try {
                    if($.Oda.Context.debug){
                        $.Oda.Context.console.debug(p_msg);
                    }
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.debug : " + er.message);
                    return null;
                }
            },
            "error" : function(p_msg) {
                try {
                    $.Oda.Context.console.error(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.error : " + er.message);
                    return null;
                }
            },
            "warning" : function(p_msg) {
                try {
                    $.Oda.Context.console.warn(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.warning : " + er.message);
                    return null;
                }
            }
        }
    };

    $.Oda.Context.startDate = new Date();

    //Apply the mode execution
    var params = $.Oda.Tooling.getParamsLibrary({library : "Oda"});
    if (params.hasOwnProperty("modeExecution")){
        switch(params.modeExecution) {
            case "full":
                $.Oda.Context.ModeExecution.app = true;
                $.Oda.Context.ModeExecution.scene = true;
                $.Oda.Context.ModeExecution.init = true;
                $.Oda.Context.ModeExecution.notification = true;
                $.Oda.Context.ModeExecution.message = true;
                break;
            case "app":
                $.Oda.Context.ModeExecution.app = true;
                $.Oda.Context.ModeExecution.init = true;
                $.Oda.Context.ModeExecution.notification = true;
                $.Oda.Context.ModeExecution.message = true;
                break;
            case "mini":
                $.Oda.Context.ModeExecution.init = true;
                $.Oda.Context.ModeExecution.notification = true;
                $.Oda.Context.ModeExecution.message = true;
                break;
            default:
                break;
        }
    }
    if(params.hasOwnProperty("vandorName")){
        $.Oda.Context.vendorName = params.vandorName;
    }
    if(params.hasOwnProperty("debug")){
        $.Oda.Context.debug = params.debug;
    }

    // Initialize
    if($.Oda.Context.ModeExecution.init){
        $.Oda.init();
    }
})();