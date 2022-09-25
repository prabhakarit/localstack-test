var gkey = "AIzaSyBWs5Ef_-EUfRFEhJPxwryNq_pcwCsmu-A";

PXLPRK = PXLPRK || {};

PXLPRK.Retailer = {
    init: function () {

        var retailers = {

            map: '',
            overlay: '',
            latlngbounds: '',
            markers: [],
            infoBoxes: [],
            maxZoom: 15,
            minZoom: 3,
            startZoomLevel: 12,
            map_canvas: $("#mapcontainer"),

            init: function () {

                retailers.bindUIActions();
                retailers.bindPageEvents();
                retailers.bindTrackingEvents();

            },

            showSpinner: function (show) {
                var overlay = $("#spinneroverlay");
                if(show){
                    overlay.attr("data-active",true);
                } else {
                    overlay.attr("data-active",false);
                }
            },

            showNoSuchPLZ: function (msg) {
                $("#suchemsg").html(msg);
            },

            bindUIActions: function () {

                $("#haendlersucheinput").keyup(function (e) {
                    retailers.showNoSuchPLZ("");
                    var pattern = /^[0-9]*$/;
                    if (!pattern.test($(this).val()) || $(this).val().length > 5) {
                        var str = $(this).val();

                        var newstr = str.slice(0, -1);
                        $(this).val(newstr);
                        return false;
                    }
                });

                $("#haendlersearchbtn").click(function () {

                    var plz = $("#haendlersucheinput").val();
                    if(plz.length < 5){
                        retailers.showNoSuchPLZ("Postleitzahl existiert nicht");
                        return;
                    }
                    retailers.deleteAllMarkersAndInfoboxes();
                    retailers.initLatlngbounds();
                    retailers.showSpinner(true);

                    var plzstring = "gssndata.php?zipcode=" + plz;
                    // TEST
                    //var plzstring = "../assets/retailersuche/plz_suche.json";

                    $.get(plzstring)
                        .done(function (data) {
                            console.log(data, "nu1");

                            var obj1 = data.cities[0];
                            var long = obj1['lng'];
                            var lat = obj1['lat'];

                            var callstring = "gssndata.php?";
                            callstring += "lon=" + long + "&lat=" + lat;

                            // TEST
                            //callstring = "../assets/retailersuche/umkreissuche.json";


                            $.get(callstring, function (data) {

                                // Aufruf der Methoden mit den Erhaltenen Daten.
                                retailers.showSpinner(false);
                                retailers.initMap();
                                //retailers.initMap();      // init twice fixes broken map rendering.
                                var retailersarr = data['outletDAO'];
                                $.each(retailersarr, function (i) {
                                    retailers.createRetailerMarker(retailersarr[i], i);
                                });
                            }).fail(function (data) {
                                retailers.showSpinner(false);
                                retailers.showNoSuchPLZ("Anfrage konnte nicht bearbeitet werden");
                            });
                        })
                        .fail(function (data) {
                            retailers.showSpinner(false);
                            retailers.showNoSuchPLZ("Anfrage konnte nicht bearbeitet werden");
                        });


                });


            },

            bindPageEvents: function () {


            },

            bindTrackingEvents: function () {
                $(document).on('click', '.retailerMarker', function () {
                    if ($(this).data('otc') != undefined) {
                        //page.trackOmnitureEvent($(this).data('otc'));
                    }
                    if ($(this).data('mtc') != undefined) {
                        //page.trackMediaEvent($(this).data('mtc'));
                    }
                });


                $(document).on("ajax:success", 'form#retailer_search', function (event, data, status, xhr) {
                    if (data['status'] == 'error') {
                        //page.trackOmnitureEvent('haendlersuche:error:data');
                    } else if (data['status'] == 'success') {
                        //page.trackOmnitureEvent('haendlersuche:user_linked_to_map#internal');
                    }
                });

            },

            initMap: function () {


                var mapOptions = {
                    zoom: retailers.startZoomLevel,
                    maxZoom: retailers.maxZoom,
                    minZoom: retailers.minZoom,
                    disableDefaultUI: true,
                    draggable: true,//!(MobileEsp.DetectTierTablet() || MobileEsp.DetectSmartphone()),
                    scrollwheel: false,
                    position: new google.maps.LatLng(53.1, 13.1) // 53, 13
                };

                retailers.map = new google.maps.Map(retailers.map_canvas[0], mapOptions);
                retailers.createZoomControl();
                retailers.map_canvas.show();

            },

            initLatlngbounds: function () {
                //console.log(window.google);
                retailers.latlngbounds = new window.google.maps.LatLngBounds;
            },

            deleteAllMarkersAndInfoboxes: function () {
                $.each(retailers.markers, function (i) {
                    retailers.markers[i].setMap(null);
                });

                $.each(retailers.infoBoxes, function (i) {
                    retailers.infoBoxes[i].close();
                });

                retailers.markers = [];
                retailers.infoBoxes = [];
            },

            createRetailerMarker: function (retailer, idx) {

                var markerContent = document.createElement('div');

                markerContent.className = 'retailerMarker';
                markerContent.setAttribute('data-otc', 'haendlersuche:haendler' + (idx + 1) + '_lightbox#internal')

                var position = new google.maps.LatLng(parseFloat(retailer['outletgeographicinformation']['latitude']), parseFloat(retailer['outletgeographicinformation']['longitude']));
                retailers.latlngbounds.extend(position);


                var marker = new PXLPRK.RichMarker({
                    //var marker = new google.maps.Marker({
                    map: retailers.map,
                    position: position,
                    draggable: false,
                    flat: true,
                    anchor: RichMarkerPosition.BOTTOM,
                    content: markerContent
                });

                retailers.createRetailerInfoBox(marker, retailer, idx);

                retailers.map.fitBounds(retailers.latlngbounds);

                retailers.markers.push(marker);


            },

            createRetailerInfoBox: function (marker, retailer, idx) {


                var boxText = document.createElement("div");
                boxText.className = "retailerData";


                var retnew = [
                    {name1: retailer.outletname1},
                    {name2: retailer.outletname2},
                    {name3: retailer.outletname3},

                    {address1: retailer.outletaddress.outletcity},
                    {address2: retailer.outletaddress.outletstreet1 + " " + retailer.outletaddress.outletzipcode},
                    {address3: "<br>"},
                    //{address4: retailer.outletaddress.outletzipcode},

                    {email: retailer.outletcommuchannel.outletemail},
                    {homepage: retailer.outletcommuchannel.outlethomepage},
                    {abreak: "<br>"},
                    {phone: retailer.outletcommuchannel.outletphone},
                    {fax: retailer.outletcommuchannel.outletfax}
                ];


                var retailerHTML = '<ul>';

                retnew.forEach(function (obj) {

                    var key = Object.keys(obj)[0];
                    var value = obj[key];

                    retailerHTML += '<li class="' + key + '">';

                    if (key != 'lat' && key != 'lng') {

                        if (key == 'email' || key == 'homepage') {
                            retailerHTML
                                += '<a href="' + (key == 'email' ? 'mailto:' : '') + value + '"'
                                + ' target="_blank"'
                                + ' data-otc="haendlersuche:haendler' + (idx + 1) + '_lightbox:user_linked_to_' + (key == 'email' ? 'mail' : 'home') + '#external">';
                        }

                        if (key == 'phone') {
                            retailerHTML
                                += 'Tel. '
                                + '<a href="tel:' + value.match(/([0-9+]+)/g).join('') + '"'
                                + ' data-otc="haendlersuche:haendler' + (idx + 1) + '_lightbox:user_linked_to_phone#external">';
                        }

                        if (key == 'fax') {
                            retailerHTML
                                += 'Fax '
                                + '<a href="fax:' + value.match(/([0-9+]+)/g).join('') + '">';
                        }

                        retailerHTML += value;

                        if (key == 'email' || key == 'homepage' || key == 'phone') {
                            retailerHTML += '</a>';
                        }

                    }
                    retailerHTML += '</li>';
                });

                retailerHTML += '</ul>';

                boxText.innerHTML = retailerHTML;

                var infoBoxOptions = {
                    boxClass: 'retailerInfoBox',
                    content: boxText,
                    disableAutoPan: false,
                    maxWidth: 0,
                    pixelOffset: new google.maps.Size(-150, 20),
                    zIndex: null,
                    closeBoxMargin: "0 0 0 0",
                    closeBoxURL: "#",
                    infoBoxClearance: new google.maps.Size(10, 10),
                    isHidden: false,
                    pane: "floatPane",
                    enableEventPropagation: true
                };

                var infoBox = new InfoBox(infoBoxOptions);

                google.maps.event.addListener(marker, 'click', function () {
                    $.each(retailers.infoBoxes, function (i) {
                        retailers.infoBoxes[i].close();
                    });

                    infoBox.open(retailers.map, marker);

                    $('.retailerMarker').removeClass('active');

                    $(marker.markerContent_).find('.retailerMarker').addClass('active');
                });

                google.maps.event.addListener(infoBox, 'closeclick', function () {
                    $('.retailerMarker').removeClass('active');
                });

                retailers.infoBoxes.push(infoBox);

            },

            createZoomControl: function () {

                var controlDiv = document.createElement('div');
                controlDiv.className = 'zoomControl';

                var zoomin = document.createElement('div');
                zoomin.className = 'zoomIn';
                zoomin.title = 'Herauszoomen';
                controlDiv.appendChild(zoomin);

                var zoominText = document.createElement('div');
                zoominText.className = 'zoomInText'
                zoominText.innerHTML = '<i class="icon-plus"></i>';
                zoomin.appendChild(zoominText);

                var zoomout = document.createElement('div');
                zoomout.className = 'zoomOut';
                zoomout.title = 'Hereinzoomen';
                controlDiv.appendChild(zoomout);

                var zoomoutText = document.createElement('div');
                zoomoutText.className = 'zoomOutText';
                zoomoutText.innerHTML = '<i class="icon-minus"></i>';
                zoomout.appendChild(zoomoutText);


                google.maps.event.addDomListener(zoomout, 'click', function () {
                    var currentZoomLevel = retailers.map.getZoom();
                    if (currentZoomLevel != 0) {
                        retailers.map.setZoom(currentZoomLevel - 1);
                    }
                });

                google.maps.event.addDomListener(zoomin, 'click', function () {
                    var currentZoomLevel = retailers.map.getZoom();
                    if (currentZoomLevel != 21) {
                        retailers.map.setZoom(currentZoomLevel + 1);
                    }
                });

                controlDiv.index = 1;
                retailers.map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

            }

        }

        retailers.init();

    }
}

