/*******************************************************************************
 * @author Tomasz Scislo <<ahref='mailto:t.scislo@samsung.com'>t.scislo@samsung.com</a>>
 * @author Lukasz Jagodzinski <<ahref='mailto:l.jagodzinsk@samsung.com'>l.jagodzinsk@samsung.com</a>>
 * Copyright (c) 2013 Samsung Electronics All Rights Reserved.
 ******************************************************************************/

var googleLocation = (function ($, logger, view, network, ajax) {
    var appKey, internetConnectionCheck;
    var mylat, mylon;
    appKey = "AIzaSyDdKjhStoKF6t0xxA_hFxYBmKrEb77b-nQ";

    /**
     * Asynch method to check the network connection
     * @private
     */
    internetConnectionCheck = function () {
        network.isInternetConnection(function (isConnection) {
            if (!isConnection) {
                view.hideLoader();
                view.showPopup("No Internet connection. Application may not work properly.");
            }
        });
    };
    return {
        /**
         * Provides initialization for the app
         */
        initialize: function () {
            var that = this;
            
            ajax();
            
            $.extend($.mobile, {
                defaultPageTransition: "flip",
                loadingMessageTextVisible: true,
                pageLoadErrorMessage: "Unable to load page",
                pageLoadErrorMessageTheme: "d",
                touchOverflowEnabled: true,
                loadingMessage: "Please wait...",
                allowCrossDomainPages: true,
                ajaxEnabled: false
            });
            logger.info("googleLocation.initialize()");
            internetConnectionCheck();
            
            $('#main').live('pageshow', function () {
                internetConnectionCheck();
                

                
            });
            
            
            $('#introduce').live('pageshow', function(){
            	location.replace("https://www.bikeseoul.com/info/infoReg.do"); 
            	
            	
            	
            } );
     

         
            
            $('#searchForPlaces').live('pageshow', function () {
                internetConnectionCheck();
                var root_lng, root_lat;
                var min_name, min_lat, min_lng, min_dist;
                
                $(this).find("#myLocationButton").bind({
                    click: function (event) {
                        event.preventDefault();
                        view.showLoader();
                        that.getCurrentLocation();
                        root_lng = mylon;
                        root_lat = mylat;
                        view.showPopup('현재 위치 설정이 완료되었습니다. <br/> 대여소 찾기 버튼을 눌러주세요');
                    }
                });
                
                
                $(this).find("#searchLocationButton").bind({
                    click: function (event) {
                    var location;

                       // logger.info('Searching for', $('#searchLocation').val());
                       // internetConnectionCheck();
                        location = encodeURIComponent($('#searchLocation').val());
                        $.ajax({
                            url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&sensor=true',
                            success: function (data) {
                                var foundLocation, map, southWest, northEast, bounds;

                             //   logger.info(data);
                             //   logger.info("Status", data.status);
                                if (google.maps.GeocoderStatus.OK === data.status && data.results.length !== 0) {
                                    // We take into account only first result returned from Google Maps API
                                    foundLocation = data.results[0];
                                //    logger.info(foundLocation.geometry.location.lat);
                                //    logger.info(foundLocation.geometry.location.lng);
                                    view.showPopup('위치검색이 완료되었습니다. <br/> 대여소 찾기 버튼을 눌러주세요');
                                    root_lng = foundLocation.geometry.location.lng;
                                    root_lat = foundLocation.geometry.location.lat;
                                    
                                    
                                } else {
                                    alert("Unable to find this location!");
                                }
                                
                            }
                        });
                    }
                });
                
                $(this).find("#nearest_button").bind({
                    click: function (event) {
                    	
                    	
                		$.ajax({
                			type : "POST",
                			url : "http://cspro.sogang.ac.kr/~cse20101649/select.php",
                			dataType: "text",
                			data : null,
                			success : function(msg, dataType) {
                				
                				var db_name;
                				var db_lat;
                				var db_lng;
                				var num, dist;
                				var string = msg;
                				var strArr = string.split('/');
                				min_dist=10000000;
                				
                				num = strArr[0];
                				var j;
                				j=0;
                				for(var i=0; i<num; i++){
                					db_name = strArr[j+1];
                					db_lat = strArr[j+2];
                    				db_lng = strArr[j+3];
                    				j=j+3;
                    				
                    				dist =  Math.sqrt(Math.pow((root_lng - db_lng),2) + Math.pow((root_lat-db_lat),2));
                    				if(dist < min_dist){
                    					min_name = db_name;
                    					min_lat = db_lat;
                    					min_lng = db_lng;
                    					min_dist = dist;
                    				}
                				}
                				

                					
                       		 var map2 = that.createMapForGivenContainer("one_canvas", {
                                    zoom: 18,
                                  //  lat: 37.3359,
                                 //   lon: 126.5840,
                                    lat : min_lat,//mylat,
                                    lon : min_lng,//mylon,
                                    //내 위치를 lat lon에 넣어주면됨
                                  
                                    streetViewControl: false,
                                    
                                    //mapTypeId: google.maps.MapTypeId.HYBRID
                                });
			
                      		var myLatlng = new google.maps.LatLng(min_lat,min_lng);

                       	  var marker = new google.maps.Marker({
                          	position: myLatlng,
                          //{
                            // 	lat : min_lat,
                             //	lng : min_lng
                          //}, 
                          	map : map2,
                          	title:"it"
                          	});

                				
                       	  
                       	  
                       	var request;
                        var ori_str1, ori_str2;

                        ori_str1 = root_lat + ',' + root_lng;
                        ori_str2 = min_lat + ',' + min_lng;
                       // alert(ori_str1 + '   '+ ori_str2);
                        event.preventDefault();
                        view.showLoader();
                        //internetConnectionCheck();
                        request = {
                        		origin: ori_str1, 
                        		destination: ori_str2,
                            travelMode: google.maps.TravelMode.TRANSIT
                        };
                        that.calculateDirections(request, map2, "red");
                        view.showPopup('가장 가까운 대여소 번호는 ' + min_name + '입니다.');		
                			
                			},
                			error : function(XMLHttpRequest, textStatus, errorThrown) {
                				alert("code:"+XMLHttpRequest.status+"\n"+"message:"+XMLHttpRequest.responseText+"\n"+"error:"+errorThrown);
    
                			}
                		});
                    	
                	
                		
                		
                		
                    	
                    	
                    }
                
                });
                
                
                
                
            });

            
            
            
            
            $('#getDirections').live('pageshow', function () {
                var createStartMap;
                var resultmap;
                var location1, location2;
                var foundLocation1, foundLocation2;
                var root_lng1, root_lat1;
                var root_lng2, root_lat2;
                var min_name1, min_lat1, min_lng1, min_dist1;
				var min_name2, min_lat2, min_lng2, min_dist2;
				
                internetConnectionCheck();
                createStartMap = function () {
                    return that.createMapForGivenContainer("directionsMap", {
                        zoom: 10,
                        lat: 37.555242,
                        lon: 126.937358,
                        //mapTypeId: google.maps.MapTypeId.HYBRID,
                        streetViewControl: false
                    });
                };
                resultmap = createStartMap();
                
                $(this).find("#myLocationButton2").bind({
                    click: function (event) {
                        event.preventDefault();
                        view.showLoader();
                        that.getCurrentLocation();
                        root_lng1 = mylon;
                        root_lat1 = mylat;
                        
                   		$.ajax({
                			type : "POST",
                			url : "http://cspro.sogang.ac.kr/~cse20101649/select.php",
                			dataType: "text",
                			data : null,
                			success : function(msg, dataType) {
                				
                				var db_name;
                				var db_lat;
                				var db_lng;
                				var num, dist;
                				var string = msg;
                				var strArr = string.split('/');
                				min_dist1=10000000;
                				
                				num = strArr[0];
                				var j;
                				j=0;
                				for(var i=0; i<num; i++){
                					db_name = strArr[j+1];
                					db_lat = strArr[j+2];
                    				db_lng = strArr[j+3];
                    				j=j+3;
                    				
                    				dist =  Math.sqrt(Math.pow((root_lng1 - db_lng),2) + Math.pow((root_lat1-db_lat),2));
                    				if(dist < min_dist1){
                    					min_name1 = db_name;
                    					min_lat1 = db_lat;
                    					min_lng1 = db_lng;
                    					min_dist1 = dist;
                    				}
                				}
                				//alert("start ::  " + min_name1);
                				
                                
                                var request;
                                var ori_str1, ori_str2;

                                ori_str1 = root_lat1 + ',' + root_lng1;
                                ori_str2 = min_lat1 + ',' + min_lng1;
                                //alert(ori_str1 + '   '+ ori_str2);
                                event.preventDefault();
                                view.showLoader();
                                //internetConnectionCheck();
                                request = {
                                		origin: ori_str1, 
                                		destination: ori_str2,
                                    travelMode: google.maps.TravelMode.TRANSIT
                                };
                                that.calculateDirections(request, resultmap, "green");
                                view.showPopup('현 위치(출발지)와 가까운 대여소 번호는 ' + min_name1 + '입니다.');	
                				
                				
                			}
                   		});   
                        
                        
                    }
                });
                

                $(this).find("#getFromButton").bind({
                    click: function (event) {
                    	
                   
                    	location1 = encodeURIComponent($('#locationFrom').val());
                $.ajax({
                    url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + location1 + '&sensor=true',
                    success: function (data1) {
                        var map, southWest, northEast, bounds;

                       // logger.info(data1);
                      //  logger.info("Status", data1.status);
                        if (google.maps.GeocoderStatus.OK === data1.status && data1.results.length !== 0) {
                            // We take into account only first result returned from Google Maps API
                            foundLocation1 = data1.results[0];
                        //    logger.info(foundLocation1.geometry.location.lat);
                        //    logger.info(foundLocation1.geometry.location.lng);
                            //$("#latlng1").val(foundLocation1.geometry.location.lat+","+foundLocation1.geometry.location.lng);
                            root_lng1 = foundLocation1.geometry.location.lng;
                            root_lat1 = foundLocation1.geometry.location.lat;
                            //view.showPopup('lng111 ' + foundLocation1.geometry.location.lng + ' lat111 ' + foundLocation1.geometry.location.lat);
                        
                          
                        
                       		$.ajax({
                    			type : "POST",
                    			url : "http://cspro.sogang.ac.kr/~cse20101649/select.php",
                    			dataType: "text",
                    			data : null,
                    			success : function(msg, dataType) {
                    				
                    				var db_name;
                    				var db_lat;
                    				var db_lng;
                    				var num, dist;
                    				var string = msg;
                    				var strArr = string.split('/');
                    				min_dist1=10000000;
                    				
                    				num = strArr[0];
                    				var j;
                    				j=0;
                    				for(var i=0; i<num; i++){
                    					db_name = strArr[j+1];
                    					db_lat = strArr[j+2];
                        				db_lng = strArr[j+3];
                        				j=j+3;
                        				
                        				dist =  Math.sqrt(Math.pow((root_lng1 - db_lng),2) + Math.pow((root_lat1-db_lat),2));
                        				if(dist < min_dist1){
                        					min_name1 = db_name;
                        					min_lat1 = db_lat;
                        					min_lng1 = db_lng;
                        					min_dist1 = dist;
                        				}
                    				}
                    				//alert("start ::  " + min_name1);
                    				
                                    
                                    var request;
                                    var ori_str1, ori_str2;

                                    ori_str1 = root_lat1 + ',' + root_lng1;
                                    ori_str2 = min_lat1 + ',' + min_lng1;
                                    //alert(ori_str1 + '   '+ ori_str2);
                                    event.preventDefault();
                                    view.showLoader();
                                    //internetConnectionCheck();
                                    request = {
                                    		origin: ori_str1, 
                                    		destination: ori_str2,
                                        travelMode: google.maps.TravelMode.TRANSIT
                                    };
                                    that.calculateDirections(request, resultmap, "green");
                                    view.showPopup('출발지와 가까운 대여소 번호는 ' + min_name1 + '입니다.');	
                    				
                    				
                    			}
                       		});     
                            
                            
                            
                            
                            
                            
                            
                            
                        }else {
                            alert("Unable to find this locationFROM!");
                        }

                        
                    }
                });
                


                
                
                
                
                
                
                
                
                
                
                
                    }
                }
                );
                
                
                $(this).find("#getToButton").bind({
                    click: function (event) {
                
                location2 = encodeURIComponent($('#locationTo').val());
                $.ajax({
                    url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + location2 + '&sensor=true',
                    success: function (data2) {
                        var map, southWest, northEast, bounds;

                       // logger.info(data2);
                      //  logger.info("Status", data2.status);
                        if (google.maps.GeocoderStatus.OK === data2.status && data2.results.length !== 0) {
                            // We take into account only first result returned from Google Maps API
                            foundLocation2 = data2.results[0];
                          //  logger.info(foundLocation2.geometry.location.lat);
                          //  logger.info(foundLocation2.geometry.location.lng);
                            //$("#latlng2").val(foundLocation2.geometry.location.lat+","+foundLocation2.geometry.location.lng);
                            root_lng2 = foundLocation2.geometry.location.lng;
                            root_lat2 = foundLocation2.geometry.location.lat;
                           
                            
                            
                            
                            $.ajax({
                    			type : "POST",
                    			url : "http://cspro.sogang.ac.kr/~cse20101649/select.php",
                    			dataType: "text",
                    			data : null,
                    			success : function(msg, dataType) {
                    				
                    				var db_name;
                    				var db_lat;
                    				var db_lng;
                    				var num, dist;
                    				var string = msg;
                    				var strArr = string.split('/');
                    				min_dist2=10000000;
                    				
                    				num = strArr[0];
                    				var j;
                    				j=0;
                    				for(var i=0; i<num; i++){
                    					db_name = strArr[j+1];
                    					db_lat = strArr[j+2];
                        				db_lng = strArr[j+3];
                        				j=j+3;
                        				
                        				dist =  Math.sqrt(Math.pow((root_lng2 - db_lng),2) + Math.pow((root_lat2-db_lat),2));
                        				if(dist < min_dist2){
                        					min_name2 = db_name;
                        					min_lat2 = db_lat;
                        					min_lng2 = db_lng;
                        					min_dist2 = dist;
                        				}
                    				}
                    				//alert("end ::  " + min_name2);
                    				
                    				  var request;
                    	                var ori_str1, ori_str2;
                    	                ori_str1 = root_lat2 + ',' + root_lng2;
                    	                ori_str2 = min_lat2 + ',' + min_lng2;
                    	               // alert(ori_str1 + '   '+ ori_str2);
                    	                event.preventDefault();
                    	                view.showLoader();
                    	                //internetConnectionCheck();
                    	                request = {
                    	                		origin: ori_str1, 
                    	                		destination: ori_str2,
                    	                    travelMode: google.maps.TravelMode.TRANSIT
                    	                };
                    	                that.calculateDirections(request, resultmap, "blue");
                    	                view.showPopup('목적지와 가까운 대여소 번호는 ' + min_name2 + '입니다.');	
                    				
                    			}
                       		});
                            
                            
                            
                            
                            //view.showPopup('lng222 ' + foundLocation2.geometry.location.lng + ' lat222 ' + foundLocation2.geometry.location.lat);
                        }else {
                            alert("Unable to find this locationTO!");
                        }

                    }
                });
                
                
           		
              
                
                
                
                
                    }
                });
            
                
         
                
                
                
                
                
                $(this).find("#getDirButton").bind({
                    click: function (event) {
                        var request;
                        var ori_str1, ori_str2;
                        //ori_str1 = foundLocation1.geometry.location.lat + ',' + foundLocation1.geometry.location.lng;
                        //ori_str2 = foundLocation2.geometry.location.lat + ',' + foundLocation2.geometry.location.lng;
                        ori_str1 = min_lat1 + ',' + min_lng1;
                        ori_str2 = min_lat2 + ',' + min_lng2;
                       // alert(ori_str1 + '   '+ ori_str2);
                        event.preventDefault();
                        view.showLoader();
                        //internetConnectionCheck();
                        request = {
                        		origin: ori_str1, 
                        		destination: ori_str2,
                        			//origin: "37.554859,126.936157",
                                    //destination: "37.554859,126.938950",
                            travelMode: google.maps.TravelMode.TRANSIT
                        };
                        that.calculateDirections(request, resultmap, "red");
                        view.showPopup('대여소 번호' + min_name1 + '부터 ' + min_name2 +'까지의 경로입니다.');
                    }
                });
                

                
            });

            
            
           
            view.getScreenHeight();
            view.getScreenWidth();
        },

        createCityUI: function (name, distance) {
            $('#cityList').append('<li><a href="#findNearest">' + name + '<span class="ui-li-count">' + distance + '</span></a></li> ').listview("refresh");
        },

        /**
         * Method that can be used for basic google.maps.Map creation for given container
         * @param container
         * @param options
         * @returns {Object} google.maps.Map
         */
        createMapForGivenContainer: function (container, options) {
            var mapOptions, map;

            mapOptions = {
                center: new google.maps.LatLng(options.lat, options.lon),
                zoom: options.zoom,
                mapTypeId: options.mapTypeId,
                streetViewControl: options.streetViewControl
            };
            map = new google.maps.Map(document.getElementById(container), mapOptions);
            return map;
        },

        /**
         * @param request {Object} - JSON with options for route calculation
         * @param map {Object} - map to draw the directions on
         * @returns
         */
        calculateDirections: function (request, map, color) {
            var directionsService, directionsDisplay;

            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer({
            	   polylineOptions: {
            		      strokeColor: color
            	}
            });
            directionsDisplay.setMap(map);
            directionsService.route(request, function (result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(result);
                } else {
                    view.showPopup('Unable to get directions');
                    logger.err('Unable to get directions');
                }
                view.hideLoader();
            });
        },

        /**
         * Method that can be used to get current device geolocation according to W3C Geolocation API
         * @returns
         */
        getCurrentLocation: function () {
            logger.info('getCurrentLocation');
            if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    view.hideLoader();
                    // Currently Tizen returns coords as 0 0 and we should treat this as an error
                    if (position.coords.latitude === 0 && position.coords.longitude === 0) {
                        view.showPopup('Unable to acquire your location');
                    } else {
                        //view.showPopup('Latitude: ' + position.coords.latitude + "<br />" + 'Longitude: ' + position.coords.longitude);
                        mylat = position.coords.latitude;
                        mylon = position.coords.longitude;
                    }
                }, function (error) {
                    view.hideLoader();
                    view.showPopup('Unable to acquire your location');
                    logger.err('GPS error occurred. Error code: ', JSON.stringify(error));
                });
            } else {
                view.hideLoader();
                view.showPopup('Unable to acquire your location');
                logger.err('No W3C Geolocation API available');
            }
        }
    };
}($, tlib.logger, tlib.view, tlib.network, tlib.ajax));

googleLocation.initialize();