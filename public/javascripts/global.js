
// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON('/events/eventslist', function( data ) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function() {
            tableContent += '<tr>'; 
            tableContent += '<td><a href="#" class="linkshowevent" rel="' + this._id + '">' + this.name + '</a></td>';
            tableContent += '<td>' + this.date + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteevent" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#eventsList table tbody').html(tableContent);

        $('#eventsList a.linkshowevent').click(function(event) {
            event.preventDefault();
            window.location.hash = "#event/" + $(this).attr("rel");
        });
        // Delete Event link click
        $('#eventsList a.linkdeleteevent').click(deleteEvent);
    });
};

var editMarker;
// Show Event Info
function showEventInfo(id) {  
     $.getJSON('/events/event/' + id, function( data ) { 
        // Get template
        var tpl = _.template(document.getElementById('event-tmp').innerHTML);
        var resultInHTML = tpl(data);
        $("#event.page").html(resultInHTML);

        // Initializing map
        initMap(data);

        // Applying jQuery-UI
        applyjQueryUI();

        // Init Text Editor
        $("#msg-txt").initEditor();

        //Hide Example links
        $("#exampleLinks").hide();
        $('#submit').click(function(event) {
            event.preventDefault();
             if (validate())
                 return;
            publishEvent(id);
        });
     }); 
};

function applyjQueryUI() {
    $("#submit").button().css({background: "linear-gradient(#22A7F0, #1F4788)"});
    $("#evtdate").datepicker();
    $("#relation").buttonset();
    $("#fsize").selectmenu({width: 100});
    $("#colorpickerbutton").button();
    $("#checkboxpane").buttonset();
}

function initMap(data) {
    if(!data.lat) data.map.lat = 49.996505;
    if(!data.lng) data.map.lng = 36.245621;

    var latlng = new google.maps.LatLng(data.lat, data.lng);
    var mapOptions = {
        center: latlng,
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    editMarker = new google.maps.Marker({
          draggable: true,
          position: latlng,
          map: map
    });
}

function showAllEventsOnMap() {
    var latlng = new google.maps.LatLng(49.996505, 36.245621);
    var mapOptions = {
        center: latlng,
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("places-map"), mapOptions);

    $.getJSON('/events/eventslist', function(data) {
        var markers = [];
        for (var i = 0; i < data.length; i++) {
            markers.push(
                new google.maps.Marker({
                    position: new google.maps.LatLng(data[i].lat, data[i].lng) ,
                    map: map,
                    title: data[i].name
                })
            );
        };
        var bounds = new google.maps.LatLngBounds();
        for(i = 0; i < markers.length; i++)
            bounds.extend(markers[i].getPosition());
        map.fitBounds(bounds);
    });
}


// Add Event
function addEvent() {
    var defaults = {
        _id: '',
        name: '',
        date: '',
        relation: 'positive',
        description: '',
        video: '',
        lat: 49.996505,
        lng: 36.245621
    }

     // Get template
    var tpl = _.template(document.getElementById('event-tmp').innerHTML);
    var resultInHTML = tpl(defaults);
    $("#event.page").html(resultInHTML).show();
    initMap(defaults);
    applyjQueryUI();
    $("#msg-txt").initEditor();
    // add event listener to a submit button
    $('#submit').click(function(event) {
        event.preventDefault();
        if (validate())
            return;
        publishEvent();
    });
};

// VALIDATOR
function validate() {
    var isInvalid = false;
    if(validateElement($("#eventMainParams input#evtname")))
        isInvalid = true;
    if(validateElement($("#eventMainParams input#evtdate")))
        isInvalid = true;
    if(validateYoutubeLinkValue($("input#video")))
        isInvalid = true;

    if(isInvalid)
        $.jnotify("Error", "Incorrect field input", "../images/owl.jpg", { lifeTime: 5000, customClass: "error-message" });
    return isInvalid;
}

function validateElement($element) {
    var result = isEmpty($element.val());
    if(result) {
        $element.next().text($element.attr("name") + " is a required field!");
    } else {
        $element.next().empty();
    }
    return result;
}

function validateYoutubeLinkValue($element) {
    if(isEmpty($element.val()))
        return false;
    var pattern = /(http|https):\/\/www\.youtube.com\/watch\?v=.{11}/g
    var isValid = pattern.test($element.val());
    if(!isValid) {
        $element.next().text("Wrong YouTube link!");
    } else {
        $element.next().empty();
    }
    return !isValid;
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

// PUBLISH EVENT
function publishEvent(id) {
 // compile all event info into one object
    var newEvent = {
        'name': $('#eventMainParams input#evtname').val(),
        'date': $('#eventMainParams input#evtdate').val(),
        'relation': $('input[name=relation]:checked').val(),
        'description': $("#msg-txt").val(),
        'video': $("#video").val(),
        lat: editMarker.getPosition().lat(),
        lng: editMarker.getPosition().lng(),
        style: $("#msg-txt").getCurrentStyle()
    }
    var url = id ? 'events/updatevent/' + id : 'events/addevent';
    // Use AJAX to post the object to our addevent service
   $.ajax({
        type: 'POST',
        data: newEvent,
        url: url,
        dataType: 'JSON'
    }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
            // Clear the form inputs
            $('#eventMainParams input#evtname').val('');
            $('#eventMainParams input#evtdate').val('');
            $('#eventMainParams input#evtid').val('');
            $("#relation").find("input").removeAttr('checked').button("refresh");
            $("#msg-txt").val('');
            $("#video").val('');
        }
        else {
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
        }
    });
    $.jnotify("Success", "Event has been saved successfully!!", "../images/owl.jpg", { lifeTime: 5000 });
    window.location.hash = "#list";
    $("#event").empty();
}

// Delete event
function deleteEvent(event) {
    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this event?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/events/deletevent/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
};


    $(window).on("hashchange", function() {
        router.changeState(window.location.hash);
    });

    // Custom Router
    function Router(){
        var routesCollection = [];
        this.addRoute = function(hash, callback){
            if(typeof(hash) !== "string" || typeof(callback) !== "function"){
                throw new TypeError("hello! there's something wrong with the hash, check it!");
            }
            routesCollection.push({
                hash: hash,
                callback: callback
            });
        };

        this.onHashChanged = function (hash) {
            $('ul>li>a').removeClass('highlight');
            $('ul>li>a[href="' + hash + '"]').addClass('highlight');
        }

        this.changeState = function(hash) {
            if(hash.length == 0)
                hash = "#list";

            this.onHashChanged(hash);

            hash = hash.substr(1); // remove #
            $(".page").hide();
            for (var i = 0; i < routesCollection.length; i++) {
                if(hash.indexOf(routesCollection[i].hash) == 0) {
                    var params = undefined;
                    var slashIndex = hash.indexOf('/');
                    if(slashIndex >= 0)
                        params = hash.substr(slashIndex + 1);
                    $("#"+routesCollection[i].hash+".page").show();
                    routesCollection[i].callback(params);
                    window.scrollTo(0, 0);
                    return;
                }
            }
        }
    }

    var router = new Router();

    //adding routes for Router
    router.addRoute("event-add", function() {
        addEvent();
    });

    router.addRoute("list", function() {
        populateTable();
    });

    router.addRoute("event", function(params) {
        showEventInfo(params);
    });

    router.addRoute("places", function(params) {
        showAllEventsOnMap();
    });


    router.changeState(window.location.hash);

