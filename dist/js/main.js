/*global $, require, google, browser: true */
$(function () {

    'use strict';

    var PUBLIC = {},
        PRIVATE = {},
        internationalCountry = false,
        body = $(document.body),
        liveConf = {
            isLive : false,
            liveURL : 'http://www.youtube.com/embed/TuwH-oo_UpQ'
        };

    PRIVATE.setLanguage = function () {

        if (body.hasClass('LNG-en-us')) {

            internationalCountry = true;

        }

    };

    PRIVATE.configRequirePaths = function () {

        var facebookURL = "http://connect.facebook.net/pt_BR/all.js#xfbml=1";

        if (internationalCountry) {

            facebookURL = "http://connect.facebook.net/en_US/all.js#xfbml=1";

        }

        require.config({
            paths: {
                "facebook" : facebookURL,
                "twitter" : 'http://platform.twitter.com/widgets',
                "g+" : 'http://apis.google.com/js/plusone',
                "sequence" : 'jquery.sequence-min',
                "async" : 'async-plugin',
                "twitterPostFetcher" : 'twitterPostFetcher'
            }
        });

    };

    PUBLIC.init = function () {

        //We need to see if the user is in the pt-BR or en-US page
        PRIVATE.setLanguage();

        PRIVATE.configRequirePaths();

        PUBLIC.appendEvents();

        //Loads the right speakers background
        PUBLIC.loadBackground();

        //Function responsible for expand the content in schedule section
        PUBLIC.applyScheduleEvents();

        //All about the menu
        PUBLIC.applyMenuBehaviours();

        //Load the speakers modal behaviours
        PUBLIC.applyModalBehaviours();

        //Load Google Maps API
        PUBLIC.loadMaps();

        //Just load the facebook, gplus and twitter API´s
        PUBLIC.loadSocialAPPS();

        //Load what the people are saying about our event!
        PUBLIC.loadTweets();

    };

    PUBLIC.appendEvents = function () {

        var modalContainer = $('#modal'),
            keynotesContainer = $('.keynote-container:first'); //This is a tip.... read carefully :)

        keynotesContainer.hover(
            function () {

                modalContainer.addClass('on');

            },
            function () {

                modalContainer.removeClass('on');

            }
        );

    };

    PUBLIC.loadBackground = function () {

        var background = {},
            userInformation = {},
            shadowsContainer = $('#speakers').find('.shadows:first');

        background = {

            init : function () {

                var hasLocalStorage = background.verifyLocalStorage();

                if (hasLocalStorage) {

                    background.loadHeroes();

                } else {

                    shadowsContainer.addClass('theather-version');

                }

            },

            verifyLocalStorage : function () {

                //This function is the same used in Modernizr.
                try {

                    return 'localStorage' in window && window['localStorage'] !== null;

                } catch (e) {

                    return false;

                }

            },

            loadHeroes : function () {

                userInformation.movieVersion = localStorage.getItem('BRJS-movieVersion');

                if (userInformation.movieVersion) {

                    if (userInformation.movieVersion === 'directors-cut') {

                        userInformation.movieVersion = 'theater-version';

                    } else {

                        userInformation.movieVersion = 'directors-cut';

                    }

                } else {

                    localStorage.setItem('BRJS-movieVersion', 'directors-cut');
                    userInformation.movieVersion = 'directors-cut';

                }

                //Puts the current version in the shadows container
                shadowsContainer.addClass(userInformation.movieVersion);
                localStorage.setItem('BRJS-movieVersion', userInformation.movieVersion);

            }

        };

        return background.init();

    };

    PUBLIC.applyMenuBehaviours = function () {

        var menu = {},
            menuContainer = $('#menu'),
            menuItens = menuContainer.find('ul:first'),
            hooks = $('html, body');

        menu = {

            init : function () {

                menu.bindWindowEvents();

            },

            bindWindowEvents : function () {

                //Binds the expanded menu in mobile or tablet devices
                menuContainer.find('.menu-switch:first').on('click', function () {

                    menuItens.toggleClass('opened');

                });

                //Bind Links Scroll Animation
                menuItens.on('click', 'a', function (evt) {

                    menu.goToSelectedAnchor($(this).attr('href'));

                });

            },

            goToSelectedAnchor : function (anchor) {

                menuItens.toggleClass('opened');

                hooks.animate({

                    scrollTop: $(anchor).offset().top - 70

                }, 1000);
                
                $(anchor).attr('tabindex', 0);

            }

        };

        return menu.init();

    };

    PUBLIC.applyScheduleEvents = function () {

        var scheduleContainer = $('#schedule'),
            tablesContainer = scheduleContainer.find('table');

        tablesContainer.each(function () {

            $(this).find('.expand').on('click', function () {

                $(this).toggleClass('active');

            });

        });

    };

    PUBLIC.applyModalBehaviours = function () {

        require(['sequence'], function () {

            var modal = {},
                activeLayer = false,
                modalContainer = $('#modal'),
                overlayContainer = $('#heroes-overlay'),
                closeButton = overlayContainer.find('.close:first');

            modal = {

                init : function () {

                    //Bind events to our heroes anchors
                    modal.loadSequence();

                },

                loadSequence : function () {

                    var options = {
                        autoPlay : false,
                        nextButton : overlayContainer.find('.next:first'),
                        prevButton : overlayContainer.find('.previous:first'),
                        transitionThreshold : 200,
                        preloader : true,
                        reverseAnimationsWhenNavigatingBackwards : false,
                        preventDelayWhenReversingAnimations : true
                    };

                    window.sequence = overlayContainer.sequence(options).data("sequence");

                    modal.bindEvents();

                },

                bindEvents : function () {

                    var heroesContainer = $('#heroes').find('.heroes-list:first'),
                        speakerIndex;

                    heroesContainer.find('li').on('click', 'a', function (evt) {

                        speakerIndex = $(this).attr('data-layer');

                        evt.preventDefault();

                        modal.openModal(speakerIndex);

                    });

                    closeButton.on('click', function () {

                        if (activeLayer) {

                            modal.closeModal();

                        }

                    });

                    $(document).keyup(function (evt) {

                        if (evt.keyCode === 27 && activeLayer) {

                            modal.closeModal();

                        }

                    });

                },

                openModal : function (index) {

                    modalContainer.addClass('on');

                    overlayContainer.removeClass('visuallyhidden');

                    window.sequence.goTo(index, 1);

                    activeLayer = true;

                    //Binds an event to close the modal if the user clicks outside it's content
                    modal.bindBodyBehaviours();

                },

                closeModal : function () {

                    if (activeLayer) {

                        //Closes the modal
                        modalContainer.removeClass('on');

                        //Hides the overlay
                        overlayContainer.addClass('visuallyhidden');

                        //Removes the event attached to the body
                        body.off('click.modalEvents');

                    }

                },

                bindBodyBehaviours : function () {

                    body.on('click.modalEvents', function (evt) {

                        if ($(evt.target).is(modalContainer)) {

                            modal.closeModal();

                        }

                    });

                }

            };

            return modal.init();

        });

    };

    PUBLIC.loadMaps = function () {

        require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyDqkwMGOmpgtKttSKXdQ6SP1iA9PMPaXPI'], function () {

            var mapsContainer = document.getElementById("map"),
                mapInstance,
                coordenates,
                marker,
                maps = {},
                options = {},
                geocoder = new google.maps.Geocoder();

            maps = {

                configureMap : function () {

                    geocoder.geocode( { 'address': 'Tecnovates - Universitário, Lajeado - RS, 95900-000'}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            coordenates = results[0]['geometry']['location'];

                            options = {
                                zoom : 18,
                                center : coordenates,
                                scrollwheel : false,
                                mapTypeId : google.maps.MapTypeId.SATELLITE,
                                streetViewControl : true
                            };

                            maps.createInstance();
                        }
                    });

                },

                createInstance : function () {

                    mapInstance = new google.maps.Map(mapsContainer, options);

                    maps.createMarker();

                },

                createMarker : function () {

                    marker = new google.maps.Marker({
                        position : coordenates,
                        map : mapInstance,
                        title : 'Tecnovates'
                    });

                },

            };

            return maps.configureMap();

        });

    };

    PUBLIC.loadSocialAPPS = function () {

        require(['facebook', 'twitter', 'g+']);

    };

    PUBLIC.loadTweets = function () {

        require(['twitterPostFetcher'], function () {

            window.twitterFetcher.fetch('347162232708276224', 'tweets-container', 3, true, true, false);

        });

    };

    PUBLIC.liveVideo = function () {

        if (liveConf.isLive) {

            var live = {},
                liveContainer = $('#jsLiveVideo');

            live = {

                init : function () {

                    //Apply layer and show the content
                    body.addClass('is-live');
                    liveContainer.removeClass('visuallyhidden');

                    //load the video link
                    live.loadVideo();

                    //Bind the close events
                    live.bindEvents();

                },

                loadVideo : function () {

                    var iFrameContainer = liveContainer.find('iframe:first'),
                        videoLink = liveContainer.find('a:first');

                    //Load the containers with the current live link
                    iFrameContainer.attr('src', liveConf.liveURL);
                    videoLink.attr('href', liveConf.liveURL);

                },

                bindEvents : function () {

                    var closeButton = liveContainer.find('.close:first');

                    //Closes the live video
                    closeButton.on('click', function () {

                        live.closeModal();

                    });

                    //Also Closes the live video
                    $(document).keyup(function (evt) {

                        if (evt.keyCode === 27 && liveConf.isLive) {

                            live.closeModal();

                        }

                    });

                },

                closeModal : function () {

                    liveContainer.remove();
                    body.removeClass('is-live');

                }

            };

            return live.init();

        }

    };

    return PUBLIC.init();

});